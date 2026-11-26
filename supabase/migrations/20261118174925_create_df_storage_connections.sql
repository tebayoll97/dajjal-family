create table public.df_storage_connections (
  singleton boolean primary key default true check (singleton),
  provider text not null default 'google_drive' check (provider = 'google_drive'),
  account_email text,
  drive_root_folder_id text,
  refresh_token_ciphertext text not null,
  refresh_token_iv text not null,
  refresh_token_tag text not null,
  scopes text[] not null default '{}',
  connected_by uuid,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.df_storage_connections is
  'Single owner-managed central storage provider connection. OAuth refresh token is application-encrypted before storage; never expose this table to browser clients.';

alter table public.df_storage_connections enable row level security;
revoke all on table public.df_storage_connections from anon, authenticated, public;
grant all on table public.df_storage_connections to service_role;
