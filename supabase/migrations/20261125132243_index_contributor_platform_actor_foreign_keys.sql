begin;
create index if not exists df_contributors_invited_by_idx on public.df_contributors(invited_by) where invited_by is not null;
create index if not exists df_contributor_permissions_granted_by_idx on public.df_contributor_permissions(granted_by) where granted_by is not null;
create index if not exists df_contributor_tasks_assigned_by_idx on public.df_contributor_tasks(assigned_by) where assigned_by is not null;
create index if not exists df_contributor_activity_actor_user_id_idx on public.df_contributor_activity_logs(actor_user_id) where actor_user_id is not null;
commit;
