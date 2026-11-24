-- Public wedding submissions must use the server routes.
-- The routes now consume a durable per-IP/per-feature database counter before
-- writing with service_role. Admin moderation policies remain unchanged.
drop policy if exists "Public can submit wedding RSVP" on public.df_rsvps;
drop policy if exists "Public can submit DF guestbook messages" on public.df_guestbook;
