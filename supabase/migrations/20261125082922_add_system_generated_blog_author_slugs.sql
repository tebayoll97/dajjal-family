-- System-generated, unique, immutable author URL identifiers.
alter table public.df_blog_contributors add column if not exists slug text;

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

do $$
declare
  contributor record;
  base_slug text;
  candidate text;
  suffix text;
  attempt integer;
begin
  for contributor in
    select id, display_name
    from public.df_blog_contributors
    order by created_at asc, id asc
  loop
    base_slug := trim(both '-' from regexp_replace(lower(btrim(coalesce(contributor.display_name, ''))), '[^a-z0-9]+', '-', 'g'));
    if base_slug = '' then base_slug := 'author'; end if;
    candidate := base_slug;
    suffix := left(replace(contributor.id::text, '-', ''), 8);
    attempt := 0;

    while exists (
      select 1 from public.df_blog_contributors c
      where c.slug = candidate and c.id <> contributor.id
    ) loop
      attempt := attempt + 1;
      candidate := base_slug || '-' || suffix || case when attempt > 1 then '-' || attempt::text else '' end;
    end loop;

    update public.df_blog_contributors
    set slug = candidate
    where id = contributor.id;
  end loop;
end;
$$;

alter table public.df_blog_contributors alter column slug set not null;
alter table public.df_blog_contributors
  add constraint df_blog_contributors_slug_key unique (slug);
alter table public.df_blog_contributors
  add constraint df_blog_contributors_slug_format
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

drop trigger if exists df_blog_contributors_assign_slug on public.df_blog_contributors;
create trigger df_blog_contributors_assign_slug
before insert or update on public.df_blog_contributors
for each row execute function public.df_blog_contributor_assign_slug();

comment on column public.df_blog_contributors.slug is
  'System-generated, unique, immutable public author URL identifier; assigned on insert and preserved when display_name changes.';
