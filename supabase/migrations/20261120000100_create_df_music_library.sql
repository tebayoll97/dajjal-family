-- DAJJAL FAMILY Music Library V1
-- Source migration only. Do not apply to production without separate owner approval.
create table if not exists public.df_music_library (
  id uuid primary key default gen_random_uuid(),
  music_id text not null unique default ('MUS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  title text not null check (char_length(title) between 1 and 160),
  artist text,
  genre text not null check (char_length(genre) between 1 and 80),
  description text,
  mood text,
  tags text[] not null default '{}',
  language text,
  audio_drive_file_id text not null,
  audio_original_name text,
  audio_mime_type text not null,
  audio_size_bytes bigint not null check (audio_size_bytes > 0 and audio_size_bytes <= 52428800),
  audio_duration_seconds integer not null check (audio_duration_seconds > 0 and audio_duration_seconds <= 900),
  cover_drive_file_id text,
  cover_mime_type text,
  cover_size_bytes bigint,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  rights_holder text,
  rights_source text,
  rights_license_notes text,
  rights_confirmed_at timestamptz,
  rights_confirmed_by uuid,
  created_by uuid not null,
  updated_by uuid not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists df_music_library_status_created_idx on public.df_music_library(status, created_at desc);
create index if not exists df_music_library_genre_idx on public.df_music_library(genre);
create index if not exists df_music_library_artist_idx on public.df_music_library(artist);
create index if not exists df_music_library_tags_idx on public.df_music_library using gin(tags);
alter table public.df_music_library enable row level security;
revoke all on public.df_music_library from anon, authenticated;
grant select, insert, update, delete on public.df_music_library to service_role;
