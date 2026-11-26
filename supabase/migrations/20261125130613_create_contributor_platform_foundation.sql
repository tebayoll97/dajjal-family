begin;
create table if not exists public.df_contributors (
 id uuid primary key default gen_random_uuid(),
 account_user_id uuid not null unique references auth.users(id) on delete cascade,
 display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
 email text not null unique,
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 status text not null default 'invited' check (status in ('invited','active','suspended','inactive')),
 bio_id text check (bio_id is null or char_length(bio_id) <= 600),
 bio_en text check (bio_en is null or char_length(bio_en) <= 600),
 avatar_url text check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 2000)),
 public_profile_enabled boolean not null default true,
 must_change_password boolean not null default false,
 invited_by uuid references auth.users(id) on delete set null,
 invited_at timestamptz,
 activated_at timestamptz,
 last_seen_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
insert into public.df_contributors(id,account_user_id,display_name,email,slug,status,bio_id,bio_en,avatar_url,created_at,updated_at)
select id,account_user_id,display_name,lower(email),slug,
 case when status='approved' then 'active' when status='suspended' then 'suspended' else 'inactive' end,
 bio_id,bio_en,avatar_url,created_at,updated_at
from public.df_blog_contributors
on conflict(id) do update set account_user_id=excluded.account_user_id,display_name=excluded.display_name,email=excluded.email,slug=excluded.slug,status=excluded.status,bio_id=excluded.bio_id,bio_en=excluded.bio_en,avatar_url=excluded.avatar_url,updated_at=excluded.updated_at;
create table if not exists public.df_contributor_permissions(
 id uuid primary key default gen_random_uuid(),
 contributor_id uuid not null references public.df_contributors(id) on delete cascade,
 permission_key text not null check(permission_key ~ '^[a-z][a-z0-9_.-]{1,119}$'),
 enabled boolean not null default true,
 granted_by uuid references auth.users(id) on delete set null,
 granted_at timestamptz not null default now(),
 unique(contributor_id,permission_key)
);
insert into public.df_contributor_permissions(contributor_id,permission_key,enabled)
select c.id,p.permission_key,true from public.df_contributors c
cross join (values('blog.access'),('blog.article.create'),('blog.article.edit_own'),('blog.article.publish')) p(permission_key)
where c.status='active' on conflict(contributor_id,permission_key) do nothing;
create table if not exists public.df_contributor_tasks(
 id uuid primary key default gen_random_uuid(),
 contributor_id uuid not null references public.df_contributors(id) on delete cascade,
 module_key text not null check(module_key ~ '^[a-z][a-z0-9_.-]{1,79}$'),
 title text not null check(char_length(btrim(title)) between 1 and 180),
 description text,
 status text not null default 'assigned' check(status in ('assigned','accepted','in_progress','submitted','revision_requested','completed','cancelled')),
 priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 due_at timestamptz,
 assigned_by uuid references auth.users(id) on delete set null,
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.df_contributor_activity_logs(
 id bigint generated always as identity primary key,
 contributor_id uuid references public.df_contributors(id) on delete set null,
 actor_user_id uuid references auth.users(id) on delete set null,
 module_key text not null,
 action_key text not null,
 target_type text,
 target_id text,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists df_contributor_permissions_lookup_idx on public.df_contributor_permissions(contributor_id,permission_key) where enabled;
create index if not exists df_contributor_tasks_owner_status_idx on public.df_contributor_tasks(contributor_id,status,updated_at desc);
create index if not exists df_contributor_activity_owner_created_idx on public.df_contributor_activity_logs(contributor_id,created_at desc);
create index if not exists df_contributors_public_slug_idx on public.df_contributors(slug) where status='active' and public_profile_enabled;
alter table public.df_blog_articles drop constraint if exists df_blog_articles_contributor_id_fkey;
alter table public.df_blog_articles add constraint df_blog_articles_contributor_id_fkey foreign key(contributor_id) references public.df_contributors(id) on delete restrict;
comment on table public.df_contributors is 'Central DAJJAL FAMILY contributor identity registry shared by all contributor modules.';
comment on table public.df_contributor_permissions is 'Per-contributor module and capability grants enforced server-side.';
comment on table public.df_contributor_tasks is 'Admin-assigned work across contributor modules.';
comment on table public.df_contributor_activity_logs is 'Server-written contributor/admin audit trail.';
alter table public.df_contributors enable row level security;
alter table public.df_contributor_permissions enable row level security;
alter table public.df_contributor_tasks enable row level security;
alter table public.df_contributor_activity_logs enable row level security;
revoke all on public.df_contributors from anon,authenticated;
revoke all on public.df_contributor_permissions from anon,authenticated;
revoke all on public.df_contributor_tasks from anon,authenticated;
revoke all on public.df_contributor_activity_logs from anon,authenticated;
grant all on public.df_contributors to service_role;
grant all on public.df_contributor_permissions to service_role;
grant all on public.df_contributor_tasks to service_role;
grant all on public.df_contributor_activity_logs to service_role;
commit;