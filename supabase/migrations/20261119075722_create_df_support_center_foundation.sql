-- Contact Center foundation: private, server-mediated support conversations.
-- Browser roles receive no table privileges; trusted server routes use service_role
-- only after verifying the caller's Supabase identity and admin membership.

create table public.df_support_conversations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(btrim(subject)) between 1 and 120),
  category text not null default 'general'
    check (category in ('general', 'account', 'technical', 'report', 'partnership')),
  status text not null default 'open'
    check (status in ('open', 'waiting_for_admin', 'waiting_for_member', 'closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.df_support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.df_support_conversations(id) on delete cascade,
  sender_user_id uuid null references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('member', 'admin')),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.df_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid null
    references public.df_support_conversations(id) on delete cascade,
  message_id uuid null
    references public.df_support_messages(id) on delete set null,
  notification_type text not null
    check (notification_type in ('support_message_received')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body_preview text not null default ''
    check (char_length(body_preview) <= 240),
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index df_support_conversations_owner_last_message_idx
  on public.df_support_conversations (owner_user_id, last_message_at desc, id desc);

create index df_support_conversations_status_last_message_idx
  on public.df_support_conversations (status, last_message_at desc, id desc);

create index df_support_messages_conversation_created_idx
  on public.df_support_messages (conversation_id, created_at asc, id asc);

create index df_support_messages_sender_created_idx
  on public.df_support_messages (sender_user_id, created_at desc)
  where sender_user_id is not null;

create index df_notifications_recipient_unread_created_idx
  on public.df_notifications (recipient_user_id, created_at desc)
  where read_at is null;

create index df_notifications_recipient_created_idx
  on public.df_notifications (recipient_user_id, created_at desc);

comment on table public.df_support_conversations is
  'Private Contact Center conversations. All access is mediated by trusted server routes.';
comment on table public.df_support_messages is
  'Append-only Contact Center message history. All access is mediated by trusted server routes.';
comment on table public.df_notifications is
  'Per-user persisted notifications. All access is mediated by trusted server routes.';

alter table public.df_support_conversations enable row level security;
alter table public.df_support_messages enable row level security;
alter table public.df_notifications enable row level security;

revoke all privileges on table public.df_support_conversations from public, anon, authenticated;
revoke all privileges on table public.df_support_messages from public, anon, authenticated;
revoke all privileges on table public.df_notifications from public, anon, authenticated;

grant all privileges on table public.df_support_conversations to service_role;
grant all privileges on table public.df_support_messages to service_role;
grant all privileges on table public.df_notifications to service_role;
