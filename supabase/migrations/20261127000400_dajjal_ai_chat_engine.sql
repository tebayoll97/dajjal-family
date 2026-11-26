create table if not exists public.dajjal_ai_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dajjal_ai_chat_conversations_title_length check (char_length(title) between 1 and 180)
);

create table if not exists public.dajjal_ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dajjal_ai_chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  retrieved_memories jsonb not null default '[]'::jsonb,
  model text,
  created_at timestamptz not null default now(),
  constraint dajjal_ai_chat_messages_content_length check (char_length(content) between 1 and 20000)
);

create index if not exists dajjal_ai_chat_conversations_user_updated_idx
  on public.dajjal_ai_chat_conversations (user_id, updated_at desc);
create index if not exists dajjal_ai_chat_messages_conversation_created_idx
  on public.dajjal_ai_chat_messages (conversation_id, created_at asc);
create index if not exists dajjal_ai_chat_messages_user_created_idx
  on public.dajjal_ai_chat_messages (user_id, created_at desc);

alter table public.dajjal_ai_chat_conversations enable row level security;
alter table public.dajjal_ai_chat_messages enable row level security;

revoke all on public.dajjal_ai_chat_conversations from anon, authenticated;
revoke all on public.dajjal_ai_chat_messages from anon, authenticated;
grant all on public.dajjal_ai_chat_conversations to service_role;
grant all on public.dajjal_ai_chat_messages to service_role;
