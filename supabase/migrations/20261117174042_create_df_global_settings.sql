create table public.df_global_settings (
  id boolean primary key default true check (id = true),
  active_theme_preset text not null default 'tecno'
    check (active_theme_preset in ('tecno', 'dajjal-veylora')),
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id) on delete set null
);

comment on table public.df_global_settings is
  'Singleton configuration for Dajjal Family global site settings. Accessed only by trusted server-side code.';

comment on column public.df_global_settings.active_theme_preset is
  'Active global theme preset identifier; visitor appearance mode is stored separately.';

insert into public.df_global_settings (id, active_theme_preset)
values (true, 'tecno');

alter table public.df_global_settings enable row level security;

revoke all on table public.df_global_settings from public, anon, authenticated;
grant select, insert, update on table public.df_global_settings to service_role;
