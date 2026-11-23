# Admin & API Security Audit — 2026-11-24

Status: **Source hardening implemented; production security follow-ups remain explicitly gated.**

Repository: `tebayoll97/dajjal-family`
Audited baseline: `main`, source commit `e4c0235bad5552fbbbc1a2abfab15a0c93524599`
Production Supabase project: `dajjal-family` (`kdcetzubnjtjcedusxav`)

## Scope inspected

- Operating rules, Command Master, Master Foundation, and Design System.
- Shared administrator verifier, client session cache, AdminAuthProvider, and legacy navigation-only admin visibility hook.
- All 17 indexed protected Admin API handlers, including Contact Center, Music upload/preview, Player Management, Couple Profile, Wedding Manager, Theme Manager, and Google Drive administration.
- Supabase Production migration history, relevant RLS policies, function execution grants, and Security Advisor findings.

## Verified controls

1. All 17 indexed protected Admin API handlers invoke `verifyAdmin()` or a local wrapper that invokes it. The check validates the Supabase access token using `auth.getUser()` and independently checks membership in `public.admin_users` on the server for every protected API request.
2. Admin authorization does not depend on browser profile metadata or the AdminAuthProvider cache. The provider and shared client cache are UI optimizations only.
3. The service-role client is isolated in `lib/supabaseAdmin.js` with the `server-only` guard. Code search found no second service-role client construction.
4. Production grants for both public `record_game_result` overloads were queried directly. Neither `anon` nor `authenticated` can execute either overload. Migration `20261114133923_revoke_legacy_record_game_result_rpc` is present in Production migration history.
5. Admin membership and the reviewed admin-management RLS policies use `auth.uid()` membership/ownership checks; they do not grant arbitrary cross-user reads or writes.
6. The Contact Center uses server-side admin verification and bounded pagination. Its reply RPC also checks admin membership and applies transactional locking and reply limits.
7. The Wedding public Data API submission policies currently require an active invitation and enabled feature. Production has the durable database trigger `private.enforce_wedding_submission_rate_limit()`, which applies a per-IP, per-feature limit to direct `anon`/`authenticated` inserts.

## Source hardening committed in this audit

- `lib/adminAuth.js`: parse a single strict Bearer token, validate it with Supabase Auth, and verify the exact server-side admin membership without caching authorization.
- `app/api/admin/me/route.js`: mark the handler dynamic and return explicit private/no-store headers for both success and failure.
- `next.config.mjs`: apply private/no-store and no-cache headers to every `/api/admin/*` and `/api/storage/google/*` response, including error paths and OAuth callback redirects.

## Findings and release gates

### A. Wedding submission route limiter — unresolved, high priority

The public RSVP and Guestbook application routes use the service-role client to insert records. The existing database rate-limit trigger intentionally skips the `service_role` database role, so these application routes bypass the durable per-IP limiter that protects direct Data API inserts. The staged migration `202611140001_secure_wedding_guest_submissions.sql` removes public Data API INSERT policies, but it must **not** be applied yet: the application routes need an equivalent durable limiter first. The existing route-level Origin check is not a rate limiter, and a missing Origin header is currently accepted.

Required next action: implement a durable server-route limiter that shares the private database counter safely, test both routes and direct Data API behavior, then review and apply the policy migration under the security-change approval gate. Do not substitute process-memory counters.

### B. Supabase Auth leaked-password protection — unresolved configuration warning

The Production Security Advisor reports leaked-password protection is disabled. This is an Auth security configuration change, not a source-code change. Enable it only after checking provider compatibility and obtaining the required production configuration approval.

### C. RLS advisor notices — review, not automatic policy defects

The Security Advisor reports RLS-enabled tables with no policies and policies scoped to `authenticated` where anonymous Auth users may also carry that database role. The reviewed no-policy tables are used through trusted server-side service-role paths by design; the reviewed owner/admin policies include `auth.uid()` predicates. Do not add broad policies or disable anonymous sign-in merely to silence advisor notices. Continue reviewing each table against its intended access model.

### D. Login attempt controls — separate follow-up

The Command Master records that the application does not yet have its own durable failed-password-attempt counter. Supabase Auth endpoint rate limits/CAPTCHA are defense-in-depth, not an application-owned per-account lockout. Do not implement process-memory counters on Vercel. A shared durable limiter must be designed before adding any alternate password-login aliases.

## Verification limitations

- Production Supabase state and migration history were queried directly.
- The repository API scan returned 17 protected Admin route handlers; this is an indexed source audit, not a formal generated route manifest.
- No local checkout, package install, lint, build, automated integration test, or browser penetration test was available in this GitHub-only edit pass. These must be verified by the matching Vercel deployment and targeted live requests before marking the release fully verified.
- No database schema, RLS policy, Auth configuration, production data, or secrets were changed in this audit.

## Exit criteria

Stage 1 is not fully closed until finding A has a durable, tested route-level limiter and the required database policy change is reviewed/applied, and findings B/C/D have been dispositioned without weakening access controls.
