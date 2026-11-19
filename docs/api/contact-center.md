# Contact Center Member API

Status: Phase 2C implementation  
Access: authenticated, non-anonymous member sessions only  
Data access: server-mediated through `supabaseAdmin`; browser roles have no table privileges  
All responses: `Cache-Control: no-store`

## Authentication

Every endpoint requires an `Authorization: Bearer <Supabase access token>` header. The server validates the token with Supabase Auth through `resolveAuthenticatedPlayer()`. The canonical conversation owner is the verified `auth.user.id`; request-body owner IDs and sender roles are never accepted.

Anonymous/guest Auth sessions are not eligible to create or read private support conversations.

## Endpoints

### `GET /api/contact-center/conversations?page=1&limit=25`

Returns only conversations whose `owner_user_id` equals the verified Auth user ID. Results are ordered by most recently active first. Page size is capped at 50.

### `POST /api/contact-center/conversations`

JSON body:

```json
{
  "subject": "Account access",
  "category": "account",
  "message": "I need help accessing my account."
}
```

Allowed categories: `general`, `account`, `technical`, `report`, `partnership`. Subject length: 1–120 characters. Message length: 1–5000 characters.

The database function `public.create_df_support_conversation` creates the conversation and first member message in one transaction. It uses a transaction-scoped advisory lock and limits each account to three new conversations per ten minutes. A limit response is HTTP 429.

### `GET /api/contact-center/conversations/{id}/messages?page=1&limit=50`

Returns the conversation metadata and its messages only after verifying that the conversation belongs to the authenticated member. Messages are ordered oldest first; page size is capped at 100.

## Deliberate exclusions in Phase 2C

- Admin replies and admin conversation management (Phase 2D).
- Notifications and unread state (later member/admin notification integration).
- Attachments, Realtime, and browser-direct Supabase table access.
- Conversation close/reopen or member editing/deletion operations.
