-- Serialize concurrent author slug allocation for identical normalized names.
-- The unique constraint remains the final database-level guarantee.
create or replace function public.df_blog_contributor_assign_slug()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base_slug text;
  candidate text;
  suffix text;
  attempt integer := 0;
begin
  if tg_op = 'UPDATE' then
    new.slug := old.slug;
    return new;
  end if;

  base_slug := trim(both '-' from regexp_replace(lower(btrim(coalesce(new.display_name, ''))), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'author';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(base_slug, 0));

  candidate := base_slug;
  suffix := left(replace(new.id::text, '-', ''), 8);

  while exists (
    select 1 from public.df_blog_contributors c where c.slug = candidate
  ) loop
    attempt := attempt + 1;
    candidate := base_slug || '-' || suffix || case when attempt > 1 then '-' || attempt::text else '' end;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;
