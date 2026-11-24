# Contact Center API

Status: Phase 2E UI and notification inbox implementation; RPC ambiguity fix applied
Access: authenticated registered members and verified administrators
Data access: server-mediated through `supabaseAdmin`; browser roles have no table privileges
All responses: `Cache-Control: no-store`

## Authentication and authorization
- Member endpoints require `Authorization: Bearer <Supabase access token>`; the canonical owner/recipient is the verified Auth user ID.
- Admin endpoints require the same bearer token and a server-side match in `public.admin_users` through `verifyAdmin()`.
- Owner IDs, recipient IDs, sender roles, and admin IDs are never accepted as trusted client input.
- Anonymous/guest Auth sessions cannot use member endpoints.
- Database tables remain inaccessible to browser roles; only trusted server routes use service role after verifying identity and scope.

## Member endpoints
- `GET /api/contact-center/conversations?page=1&limit=25`: returns only the verified member's conversations, newest activity first; limit capped at 50.
- `POST /api/contact-center/conversations`: creates conversation and first message atomically. Body: `{ "subject": "...", "category": "general", "message": "..." }`. Categories: `general`, `account`, `technical`, `report`, `partnership`. Subject 1–120 chars, message 1–5000 chars; creation capped at three per account per ten minutes.
- `GET /api/contact-center/conversations/{id}/messages?page=1&limit=50`: owner-checked history; page size capped at 100.
- `POST /api/contact-center/conversations/{id}/messages`: member follow-up. Atomic transaction verifies ownership/open status, inserts message, sets `waiting_for_admin`, and notifies every current admin. Member reply rate capped at 20 per conversation per ten minutes.

## Admin endpoints
- `GET /api/admin/contact-center/conversations?status=active&page=1&limit=25`: verified-admin queue. `active` includes `open`, `waiting_for_admin`, `waiting_for_member`; individual status filters and `closed` are supported. Limit capped at 100.
- `GET /api/admin/contact-center/conversations?id={uuid}&page=1&limit=50`: returns conversation and paginated history; admin-only.
- `POST /api/admin/contact-center/conversations`: admin reply. Body: `{ "conversationId": "uuid", "message": "..." }`. Transaction verifies admin membership, locks conversation, inserts reply, sets `waiting_for_member`, and notifies the conversation owner.

## Notification inbox and read state
- `GET /api/notifications?limit=20`: returns up to 50 newest notifications belonging only to the verified Auth user, plus an unread count.
- `PATCH /api/notifications`: accepts either `{ "notificationId": "uuid" }` or `{ "markAll": true }`. Updates only unread rows whose `recipient_user_id` matches the verified Auth user. A client-supplied recipient/user ID is never used.
- Both member and admin Contact Center interfaces use this same inbox API. Notification rows are persisted in `df_notifications`; no Realtime subscription is enabled.
- Contact Center UI copy, API error presentation, notification headings, status labels, category names, sender roles, and date formatting must use the active `LanguageProvider` locale (`id`/`en`). Persisted notification titles remain backward-compatible English strings; clients localize their presentation by notification type and recipient context.

## Transaction and notification semantics
- Reply insert, conversation status/timestamps, and notification insert share one PostgreSQL transaction.
- Closed conversations reject replies with HTTP 409.
- Member replies notify only current rows in `admin_users`; if no admin exists, transaction rolls back.
- Both directions use the existing `support_message_received` notification type.
- RPCs are `SECURITY INVOKER`, use empty `search_path`, and EXECUTE is granted only to `service_role`.
- Request body max 16000 chars; message max 5000 chars. All responses are non-cacheable.

## Not included
Close/reopen controls, attachments, Realtime, email/push delivery, and retention/export workflows.


## Message sender presentation — 2026-11-19

- The admin conversation detail response may enrich each message with `sender_name` and `sender_avatar_url` resolved from the sender's linked `players` profile (`auth_user_id`). These are presentation fields only; the authoritative sender identity and role remain `sender_user_id` and `sender_role` from the server-side message row.
- If a sender has no linked player profile, clients use a localized or generic avatar/name fallback. Never accept sender identity, display name, or avatar URL from message submission input.
- The Contact Center navigation indicator reads the authenticated recipient's unread notification count through the existing `/api/notifications` endpoint. The browser refreshes periodically and reacts to the `df:notifications-updated` event after marking notifications read.
