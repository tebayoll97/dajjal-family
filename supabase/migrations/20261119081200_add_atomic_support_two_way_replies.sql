-- Phase 2D: atomic two-way replies, status transitions, and persisted notifications.
create or replace function public.admin_reply_df_support_conversation(p_admin_user_id uuid, p_conversation_id uuid, p_body text)
returns table(message_id uuid, conversation_id uuid, status text, created_at timestamptz)
language plpgsql security invoker set search_path = ''
as $function$
declare v_owner_user_id uuid; v_status text; v_message_id uuid; v_created_at timestamptz;
begin
  if p_admin_user_id is null or not exists (select 1 from public.admin_users a where a.user_id = p_admin_user_id) then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;
  if p_conversation_id is null then raise exception using errcode = '22023', message = 'INVALID_CONVERSATION'; end if;
  if p_body is null or pg_catalog.char_length(pg_catalog.btrim(p_body)) not between 1 and 5000 then
    raise exception using errcode = '22023', message = 'INVALID_MESSAGE';
  end if;
  select c.owner_user_id, c.status into v_owner_user_id, v_status from public.df_support_conversations c where c.id = p_conversation_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'CONVERSATION_NOT_FOUND'; end if;
  if v_status = 'closed' then raise exception using errcode = '55000', message = 'CONVERSATION_CLOSED'; end if;
  insert into public.df_support_messages(conversation_id,sender_user_id,sender_role,body)
  values(p_conversation_id,p_admin_user_id,'admin',pg_catalog.btrim(p_body)) returning id,created_at into v_message_id,v_created_at;
  update public.df_support_conversations set status='waiting_for_member',last_message_at=v_created_at,updated_at=v_created_at where id=p_conversation_id;
  insert into public.df_notifications(recipient_user_id,conversation_id,message_id,notification_type,title,body_preview)
  values(v_owner_user_id,p_conversation_id,v_message_id,'support_message_received','New reply from Dajjal Family Support',pg_catalog.left(pg_catalog.btrim(p_body),240));
  return query select v_message_id,p_conversation_id,'waiting_for_member'::text,v_created_at;
end;
$function$;

create or replace function public.member_reply_df_support_conversation(p_owner_user_id uuid,p_conversation_id uuid,p_body text)
returns table(message_id uuid,conversation_id uuid,status text,created_at timestamptz)
language plpgsql security invoker set search_path = ''
as $function$
declare v_status text; v_message_id uuid; v_created_at timestamptz; v_admin_count integer;
begin
  if p_owner_user_id is null then raise exception using errcode = '22023', message = 'INVALID_OWNER'; end if;
  if p_conversation_id is null then raise exception using errcode = '22023', message = 'INVALID_CONVERSATION'; end if;
  if p_body is null or pg_catalog.char_length(pg_catalog.btrim(p_body)) not between 1 and 5000 then
    raise exception using errcode = '22023', message = 'INVALID_MESSAGE';
  end if;
  select c.status into v_status from public.df_support_conversations c
   where c.id=p_conversation_id and c.owner_user_id=p_owner_user_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'CONVERSATION_NOT_FOUND'; end if;
  if v_status='closed' then raise exception using errcode = '55000', message = 'CONVERSATION_CLOSED'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_conversation_id::text,0));
  if (select pg_catalog.count(*) from public.df_support_messages m where m.conversation_id=p_conversation_id
       and m.sender_role='member' and m.created_at >= pg_catalog.now()-interval '10 minutes') >= 20 then
    raise exception using errcode = 'P0001', message = 'SUPPORT_REPLY_RATE_LIMITED';
  end if;
  insert into public.df_support_messages(conversation_id,sender_user_id,sender_role,body)
  values(p_conversation_id,p_owner_user_id,'member',pg_catalog.btrim(p_body)) returning id,created_at into v_message_id,v_created_at;
  update public.df_support_conversations set status='waiting_for_admin',last_message_at=v_created_at,updated_at=v_created_at where id=p_conversation_id;
  insert into public.df_notifications(recipient_user_id,conversation_id,message_id,notification_type,title,body_preview)
  select a.user_id,p_conversation_id,v_message_id,'support_message_received','New member reply in Contact Center',pg_catalog.left(pg_catalog.btrim(p_body),240)
    from public.admin_users a;
  get diagnostics v_admin_count = row_count;
  if v_admin_count=0 then raise exception using errcode = '55000', message = 'NO_SUPPORT_ADMIN_CONFIGURED'; end if;
  return query select v_message_id,p_conversation_id,'waiting_for_admin'::text,v_created_at;
end;
$function$;

revoke all on function public.admin_reply_df_support_conversation(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.member_reply_df_support_conversation(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.admin_reply_df_support_conversation(uuid,uuid,text) to service_role;
grant execute on function public.member_reply_df_support_conversation(uuid,uuid,text) to service_role;
