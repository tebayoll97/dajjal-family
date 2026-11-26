# DAJJAL AI Memory Cloud

Status: Phase 1 foundation and Phase 2 database/API foundation deployed on 2026-11-27.

## Architecture

- Supabase PostgreSQL is the active memory store.
- `dajjal_ai_memory_documents` stores canonical memory records and provenance.
- `dajjal_ai_memory_chunks` stores retrieval chunks and 384-dimensional embeddings.
- pgvector 0.8.2 stores vectors; Supabase Edge Runtime `gte-small` creates embeddings.
- Vercel is the planned application/API gateway and bot integration layer.
- GitHub stores migrations, code, and architecture documentation.
- Akashic Record remains the historical chronicle and reference archive, not the live database.

## Memory governance

Memory types: identity, project_knowledge, technical_knowledge, operational_memory, episodic_memory, learning_memory.

Visibility is `private` or `public`. Status is `draft`, `published`, or `archived`. Public users can read only records explicitly marked `public` and `published`. RLS protects both documents and chunks. Public users cannot insert, update, or delete canonical memory.

Never publish private conversations, credentials, tokens, personal sensitive information, or internal operational instructions. Every imported memory must retain source type and source reference where available. Separate verified facts, explicit decisions, plans, assumptions, and historical records.

## Edge Function

Endpoint:
`https://kdcetzubnjtjcedusxav.supabase.co/functions/v1/dajjal-ai-memory`

Public semantic search (POST, no user login):
```json
{"action":"search","query":"What is DAJJAL AI?","limit":6}
```

Admin-only internal semantic search (POST, requires an authenticated DAJJAL FAMILY admin access token):
```json
{"action":"search_internal","query":"What are the internal operating principles?","limit":6}
```

Admin-only embedding backfill:
```json
{"action":"index_pending"}
```

Public search automatically indexes a small batch of explicitly published public chunks before searching. Internal search indexes pending private and public chunks after validating the signed-in user against `public.admin_users`.

## Database functions

- `search_dajjal_ai_memory(query_embedding, match_threshold, match_count)`: vector similarity search. RLS applies to the caller.
- `search_dajjal_ai_memory_keyword(query_text, match_count)`: full-text keyword search. RLS applies to the caller.

## Initial seeded memory

Six curated records:
1. Public DAJJAL AI identity.
2. Private DAJJAL AI core identity.
3. Private operating principles.
4. Private DAJJAL FAMILY project context.
5. Private memory governance.
6. Private memory architecture.

Only the public identity record is published publicly. No private conversation archive has been bulk-imported yet.

## Current limitations / next integration

The memory database and semantic retrieval endpoint are live. The endpoint returns retrieved context, not a generated assistant answer. The next integration step is to connect the DAJJAL AI bot's chat/research/article workflow to `search_internal`, pass retrieved context to the configured language model, and record citations/source references. No language-model provider or chat-generation endpoint is configured by this foundation migration.
