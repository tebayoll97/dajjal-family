-- Couple Profiles: server-mediated CRUD; no direct browser table access.
create table public.df_couple_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_player_id uuid not null references public.players(id) on delete cascade,
  male_nickname text not null check (char_length(btrim(male_nickname)) between 1 and 40),
  female_nickname text not null check (char_length(btrim(female_nickname)) between 1 and 40),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 90),
  anniversary_date date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint df_couple_profiles_owner_player_unique unique (owner_player_id)
);
create table public.df_couple_contents (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.df_couple_profiles(id) on delete cascade,
  locale text not null check (locale in ('id','en')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  seo_title text check (seo_title is null or char_length(seo_title) <= 90),
  seo_description text check (seo_description is null or char_length(seo_description) <= 220),
  updated_at timestamptz not null default now(),
  constraint df_couple_contents_locale_unique unique (couple_id, locale)
);
create table public.df_couple_media (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.df_couple_profiles(id) on delete cascade,
  slot_key text not null check (slot_key in ('cover','male_portrait','female_portrait')),
  google_drive_file_id text not null check (google_drive_file_id ~ '^[A-Za-z0-9_-]{10,200}$'),
  updated_at timestamptz not null default now(),
  constraint df_couple_media_slot_unique unique (couple_id, slot_key)
);
create index df_couple_profiles_published_slug_idx on public.df_couple_profiles (slug) where is_published = true;
create index df_couple_contents_couple_idx on public.df_couple_contents (couple_id);
create index df_couple_media_couple_idx on public.df_couple_media (couple_id);
alter table public.df_couple_profiles enable row level security;
alter table public.df_couple_contents enable row level security;
alter table public.df_couple_media enable row level security;
revoke all on public.df_couple_profiles from anon, authenticated;
revoke all on public.df_couple_contents from anon, authenticated;
revoke all on public.df_couple_media from anon, authenticated;
grant all on public.df_couple_profiles to service_role;
grant all on public.df_couple_contents to service_role;
grant all on public.df_couple_media to service_role;
comment on table public.df_couple_profiles is 'One public Couple Profile per DAJJAL FAMILY player. All CRUD is mediated by trusted server routes.';
comment on table public.df_couple_contents is 'Bilingual editable Couple Profile template content. JSON schema is validated by server routes.';
comment on table public.df_couple_media is 'Google Drive file ID references for cover and two portrait slots only; no gallery or voice-note media.';
