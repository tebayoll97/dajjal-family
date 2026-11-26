-- Extend wedding guest submissions with Darkwar server and attendance metadata.
-- Existing rows remain intact; new columns are nullable for backward compatibility.
alter table public.df_guestbook
  add column if not exists server_name text,
  add column if not exists attendance text;

alter table public.df_rsvps
  add column if not exists server_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'df_guestbook_attendance_check'
      and conrelid = 'public.df_guestbook'::regclass
  ) then
    alter table public.df_guestbook
      add constraint df_guestbook_attendance_check
      check (attendance is null or attendance in ('yes', 'maybe', 'no')) not valid;
  end if;
end
$$;

alter table public.df_guestbook
  validate constraint df_guestbook_attendance_check;
