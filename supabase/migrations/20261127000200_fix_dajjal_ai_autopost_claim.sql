-- Fix PL/pgSQL output-variable ambiguity in the no-draft conflict target.
create or replace function public.claim_dajjal_ai_autopost()
returns table (slot_key text, scheduled_date date, article_id uuid, claim_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_settings public.df_dajjal_ai_autopost_settings%rowtype;
  v_local_now timestamp without time zone;
  v_today date;
  v_clock time without time zone;
  v_slot record;
  v_log public.df_dajjal_ai_autopost_logs%rowtype;
  v_article_id uuid;
  v_article_status text;
begin
  select * into v_settings from public.df_dajjal_ai_autopost_settings where id = true for update;
  if not found or not v_settings.enabled then return; end if;
  v_local_now := timezone('Asia/Jakarta', now());
  v_today := v_local_now::date;
  v_clock := v_local_now::time;

  for v_slot in
    select * from (values
      ('slot_1'::text, v_settings.slot_1_time),
      ('slot_2'::text, v_settings.slot_2_time),
      ('slot_3'::text, v_settings.slot_3_time)
    ) as slots(slot_key, slot_time)
    order by slot_time, slot_key
  loop
    if v_clock < v_slot.slot_time or v_clock >= v_slot.slot_time + interval '5 minutes' then continue; end if;

    select * into v_log
    from public.df_dajjal_ai_autopost_logs
    where df_dajjal_ai_autopost_logs.slot_key = v_slot.slot_key
      and df_dajjal_ai_autopost_logs.scheduled_date = v_today
    for update;

    if found then
      if v_log.status in ('published','no_draft') or v_log.attempts >= 3 then continue; end if;
      if v_log.status = 'processing' and v_log.updated_at > now() - interval '10 minutes' then continue; end if;
      v_article_id := v_log.article_id;
      if v_article_id is null then
        update public.df_dajjal_ai_autopost_logs set status = 'no_draft', updated_at = now() where id = v_log.id;
        continue;
      end if;
      select a.status into v_article_status from public.df_blog_articles a where a.id = v_article_id;
      if v_article_status = 'published' then
        update public.df_dajjal_ai_autopost_logs set status = 'published', error_message = null, updated_at = now() where id = v_log.id;
        continue;
      end if;
      if v_article_status is distinct from 'draft' then
        update public.df_dajjal_ai_autopost_logs set status = 'failed', error_message = 'Draft is no longer available.', updated_at = now() where id = v_log.id;
        continue;
      end if;
      update public.df_blog_articles set autopost_claimed_at = now()
      where id = v_article_id and status = 'draft'
        and (autopost_claimed_at is null or autopost_claimed_at < now() - interval '10 minutes');
      if not found then continue; end if;
      update public.df_dajjal_ai_autopost_logs
      set status = 'processing', attempts = attempts + 1, error_message = null, updated_at = now()
      where id = v_log.id;
      return query select v_slot.slot_key, v_today, v_article_id, 'processing'::text;
      return;
    end if;

    v_article_id := null;
    select a.id into v_article_id
    from public.df_blog_articles a
    where a.status = 'draft'
      and a.source_locale in ('id','en')
      and length(btrim(coalesce(a.title_id,''))) > 0
      and length(btrim(coalesce(a.content_id,''))) > 0
      and (a.autopost_claimed_at is null or a.autopost_claimed_at < now() - interval '10 minutes')
      and ((a.source_locale = 'id' and length(btrim(coalesce(a.slug_id,''))) > 0)
        or (a.source_locale = 'en' and length(btrim(coalesce(a.slug_en,a.slug_id,''))) > 0))
    order by a.created_at asc
    limit 1
    for update skip locked;

    if v_article_id is null then
      insert into public.df_dajjal_ai_autopost_logs
        (slot_key, scheduled_date, scheduled_time, status, attempts, error_message)
      values (v_slot.slot_key, v_today, v_slot.slot_time, 'no_draft', 0, null)
      on conflict do nothing;
      continue;
    end if;

    update public.df_blog_articles set autopost_claimed_at = now()
    where id = v_article_id and status = 'draft';
    insert into public.df_dajjal_ai_autopost_logs
      (slot_key, scheduled_date, scheduled_time, article_id, status, attempts)
    values (v_slot.slot_key, v_today, v_slot.slot_time, v_article_id, 'processing', 1);
    return query select v_slot.slot_key, v_today, v_article_id, 'processing'::text;
    return;
  end loop;
end;
$$;

create or replace function public.finish_dajjal_ai_autopost(
  p_slot_key text,
  p_scheduled_date date,
  p_status text,
  p_article_id uuid default null,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if p_status not in ('published','failed') then raise exception 'Invalid auto-post completion status.'; end if;
  update public.df_dajjal_ai_autopost_logs
  set status = p_status,
      article_id = coalesce(p_article_id, article_id),
      error_message = case when p_status = 'failed' then left(coalesce(p_error_message,'Publication failed.'),500) else null end,
      updated_at = now()
  where slot_key = p_slot_key and scheduled_date = p_scheduled_date;
  if p_status = 'failed' and p_article_id is not null then
    update public.df_blog_articles set autopost_claimed_at = null
    where id = p_article_id and status = 'draft';
  end if;
end;
$$;

revoke all on function public.claim_dajjal_ai_autopost() from public, anon, authenticated;
revoke all on function public.finish_dajjal_ai_autopost(text,date,text,uuid,text) from public, anon, authenticated;
grant execute on function public.claim_dajjal_ai_autopost() to service_role;
grant execute on function public.finish_dajjal_ai_autopost(text,date,text,uuid,text) to service_role;
