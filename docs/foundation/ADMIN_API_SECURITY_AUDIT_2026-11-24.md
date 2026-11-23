# Admin & API Security Audit — 2026-11-24

Status: **Core Admin/API source hardening and Wedding submission security controls implemented in Production. Build verified on matching source commit; final documentation-only commit deployment is being checked.**

Repository: `tebayoll97/dajjal-family`
Production source commit containing the route implementation: `185ddd5536aaa9e02ffc29bc15f4fcc0aa7f8735`
Latest documentation/migration-filename commit: `8fe556c440b1dca26fdac970f9d37c0a8c4549a2`
Production Supabase project: `dajjal-family` (`kdcetzubnjtjcedusxav`)

## Scope inspected

- Operating rules, Command Master, Master Foundation, and Design System.
- Shared administrator verifier, client session cache, AdminAuthProvider, and legacy navigation-only admin visibility hook.
- All 17 indexed protected Admin API handlers, including Contact Center, Music upload/preview, Player Management, Couple Profile, Wedding Manager, Theme Manager, and Google Drive administration.
- Supabase Production migration history, relevant RLS policies, function execution grants, and Security Advisor findings.

## Verified Admin controls

1. All 17 indexed protected Admin API handlers invoke `verifyAdmin()` or a local wrapper that invokes it. The check validates the Supabase access token using `auth.getUser()` and independently checks membership in `public.admin_users` on the server for every protected API request.
2. Admin authorization does not depend on browser profile metadata or the AdminAuthProvider cache. The provider and shared client cache are UI optimizations only.
3. The service-role client is isolated in `lib/supabaseAdmin.js` with the `server-only` guard. Code search found no second service-role client construction.
4. Production grants for both public `record_game_result` overloads were queried directly. Neither `anon` nor `authenticated` can execute either overload. Migration `20261114133923_revoke_legacy_record_game_result_rpc` is present in Production migration history.
5. Admin membership and the reviewed admin-management RLS policies use `auth.uid()` membership/ownership checks; they do not grant arbitrary cross-user reads or writes.
6. The Contact Center uses server-side admin verification and bounded pagination. Its reply RPC also checks admin membership and applies transactional locking and reply limits.
7. `/api/admin/me` is dynamic and explicitly returns `private, no-store`; Next.js headers apply private/no-store and no-cache to all `/api/admin/*` and `/api/storage/google/*` paths.

## Wedding RSVP / Guestbook — implemented

The previously identified service-role bypass has been closed with a durable shared limiter and removal of public direct-insert policies.

### Source changes

- `lib/weddingSubmissionRateLimit.js`: server-only helper reads Vercel's trusted client IP header, validates it as an IP address, and consumes the shared database counter. Missing/invalid IP fails closed with HTTP 503. No process-memory counters or raw IP persistence.
- `app/api/wedding/rsvp/route.js`: checks the durable RSVP counter before insert.
- `app/api/wedding/guestbook/route.js`: checks the durable Guestbook counter before insert.
- Both routes return HTTP 429 and `Retry-After: 600` after five submissions per IP, per feature, per 10-minute window. Each feature has an independent scope.

### Production database changes

- Migration `20261123220548_add_durable_wedding_server_submission_rate_limit` adds `public.consume_wedding_submission_rate_limit(text, inet)`.
- The RPC is `SECURITY DEFINER`, has an empty search path, accepts only `service_role` JWT claims, validates scope/IP, hashes IP with the existing private salt, and uses an advisory transaction lock plus atomic upsert.
- Execute permission is explicitly revoked from `PUBLIC`, `anon`, and `authenticated`; only `service_role` can execute it.
- Migration `20261123220610_secure_wedding_public_submission_routes` drops the two public INSERT policies. Existing public approved-Guestbook SELECT and admin moderation/read policies remain.
- Production policy inspection confirms only the Guestbook admin moderation and public approved-message SELECT policies remain; RSVP retains only the admin SELECT policy.
- Table INSERT grants remain present, but RLS is enabled and no public INSERT policy remains, so direct `anon`/`authenticated` Data API inserts are denied by RLS. The server route uses service-role access only after the durable limiter succeeds.

### Database verification

A rolled-back SQL test verified:
- Requests 1–5 are allowed.
- Request 6 is denied.
- RSVP and Guestbook scopes are independent.
- An `anon` JWT role cannot execute the service-only limiter.

Privilege inspection verified:
- `service_role`: EXECUTE = true.
- `anon`, `authenticated`, and `PUBLIC`: EXECUTE = false.

## Source hardening in this audit

- `lib/adminAuth.js`: parse a single strict Bearer token, validate it with Supabase Auth, and verify the exact server-side admin membership without caching authorization.
- `app/api/admin/me/route.js`: mark the handler dynamic and return explicit private/no-store headers for both success and failure.
- `next.config.mjs`: apply private/no-store and no-cache headers to every `/api/admin/*` and `/api/storage/google/*` response, including error paths and OAuth callback redirects.

## Remaining security dispositions

### B. Supabase Auth leaked-password protection — configuration follow-up

The Production Security Advisor reports leaked-password protection is disabled. This is a Supabase Auth configuration setting, not part of the approved RSVP/Guestbook schema and policy change. It was not changed in this pass. Enable it after confirming provider compatibility and explicitly approving the Auth configuration change. See [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### C. RLS advisor notices — reviewed and classified

The Security Advisor reports RLS-enabled tables with no policies and policies scoped to `authenticated` where anonymous Auth users may also carry that database role. The reviewed no-policy tables are accessed through trusted server-side service-role paths by design; the reviewed admin policies include exact `auth.uid()` membership checks. The generic anonymous-role warnings do not establish that an anonymous user can impersonate an administrator. Do not add broad policies or disable anonymous sign-in merely to silence advisor notices. Review each table again when its access model changes.

### D. Password login attempt controls — deferred by existing project decision

The public `/login` and `/admin/login` pages still call Supabase `signInWithPassword` directly. Supabase Auth endpoint-level rate limits/CAPTCHA are the current defense-in-depth; this application does not claim to have a custom per-account failed-password lockout. The Command Master explicitly defers username/phone alias login. Before any alias login is introduced, move both public and admin password flows behind a shared server endpoint and implement a durable atomic limiter. Do not use process-memory counters or store raw passwords, identifiers, or IPs.

## Deployment and verification status

- Matching source deployment `185ddd5536aaa9e02ffc29bc15f4fcc0aa7f8735` built successfully on Vercel Production and reached `READY`; Next.js compilation and type/lint phase completed. Existing project warnings (including legacy `<img>` and React Hook dependency warnings) remain non-blocking.
- A later documentation/migration-filename-only commit `8fe556c440b1dca26fdac970f9d37c0a8c4549a2` is the latest `main` head; its Vercel Production deployment is being checked separately.
- Production Supabase migration history confirms both new migrations are recorded.
- No live browser POST/429 end-to-end test was possible through the available connected tools. Database behavior and build are verified; a real visitor-path test remains a release QA item.
- Vercel runtime error scan for the previous 24 hours should be refreshed after the latest deployment becomes READY.
- No production RSVP/Guestbook records were created or deleted during the SQL tests; the test transaction was rolled back.

## Exit criteria

Core Stage 1 source and database remediation is implemented. Final release sign-off still requires checking the latest deployment reaches READY, refreshing runtime error scan, and performing one real RSVP and Guestbook test (including a sixth-request 429 test) through the live site. Auth leaked-password protection and custom password-login lockout remain documented follow-ups, not silently claimed as completed.
