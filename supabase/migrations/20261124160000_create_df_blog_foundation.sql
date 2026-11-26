-- DAJJAL FAMILY Blog foundation. Additive production migration; applied 2026-11-24.
create table if not exists public.df_blog_categories(id uuid primary key default gen_random_uuid(),slug text not null unique,name_id text not null,name_en text,description_id text,description_en text,sort_order integer not null default 0,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),constraint df_blog_categories_slug_format check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'));
create table if not exists public.df_blog_contributors(id uuid primary key default gen_random_uuid(),account_user_id uuid not null references auth.users(id) on delete cascade,display_name text not null,email text not null,status text not null default 'pending' check(status in('pending','approved','rejected','suspended')),application_note text,reviewed_by uuid references auth.users(id) on delete set null,reviewed_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(account_user_id),unique(email));
create table if not exists public.df_blog_articles(id uuid primary key default gen_random_uuid(),contributor_id uuid not null references public.df_blog_contributors(id) on delete restrict,category_id uuid references public.df_blog_categories(id) on delete set null,status text not null default 'draft' check(status in('draft','published','archived')),slug_id text not null,slug_en text,title_id text not null,title_en text,excerpt_id text,excerpt_en text,content_id text not null default '',content_en text,cover_image_url text,cover_image_alt_id text,cover_image_alt_en text,meta_title_id text,meta_title_en text,meta_description_id text,meta_description_en text,reading_minutes integer,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),constraint df_blog_articles_slug_id_format check(slug_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),constraint df_blog_articles_slug_en_format check(slug_en is null or slug_en ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),constraint df_blog_articles_published_time check(status<>'published' or published_at is not null));
create unique index if not exists df_blog_articles_slug_id_unique on public.df_blog_articles(slug_id);
create unique index if not exists df_blog_articles_slug_en_unique on public.df_blog_articles(slug_en) where slug_en is not null;
create index if not exists df_blog_articles_public_listing on public.df_blog_articles(published_at desc) where status='published';
create index if not exists df_blog_articles_contributor on public.df_blog_articles(contributor_id,updated_at desc);
create index if not exists df_blog_articles_category on public.df_blog_articles(category_id,published_at desc) where status='published';
alter table public.df_blog_categories enable row level security;
alter table public.df_blog_contributors enable row level security;
alter table public.df_blog_articles enable row level security;
revoke all on public.df_blog_categories,public.df_blog_contributors,public.df_blog_articles from anon,authenticated;
grant select,insert,update,delete on public.df_blog_categories,public.df_blog_contributors,public.df_blog_articles to service_role;
comment on table public.df_blog_contributors is 'Blog contributors linked to the existing DAJJAL FAMILY Auth identity; no password data stored.';
comment on table public.df_blog_articles is 'Bilingual articles; approved contributors may save drafts or publish directly.';

-- Public read-only media bucket. Uploads remain server-mediated through verified contributor endpoints.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('df-blog-media', 'df-blog-media', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
