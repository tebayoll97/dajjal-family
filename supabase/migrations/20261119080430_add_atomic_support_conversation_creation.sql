-- Atomic Contact Center conversation creation with durable per-user throttling.
-- The function is server-only: service_role is the only role allowed to execute it.
-- SECURITY INVOKER keeps the function within the caller's table privileges.

create or replace function public.create_df_support_conversation(
  p_owner_user_id uuid,
  p_subject text,
  p_category text,
  p_body text
)
returns table (
  conversation_id uuid,
  message_id uuid,
  created_at timestamptz,
  last_message_at timestamptz,
  status text
)
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_conversation_id uuid;
  v_message_id uuid;
  v_created_at timestamptz;
  v_last_message_at timestamptz;
  v_status text;
  v_recent_count integer;
begin
  if p_owner_user_id is null then
    raise exception using errcode = '22023', message = 'INVALID_OWNER';
  end if;

  if p_subject is null or pg_catalog.char_length(pg_catalog.btrim(p_subject)) not between 1 and 120 then
    raise exception using errcode = '22023', message = 'INVALID_SUBJECT';
  end if;

  if p_category is null or p_category not in ('general', 'account', 'technical', 'report', 'partnership') then
    raise exception using errcode = '22023', message = 'INVALID_CATEGORY';
  end if;

  if p_body is null or pg_catalog.char_length(pg_catalog.btrim(p_body)) not between 1 and 5000 then
    raise exception using errcode = '22023', message = 'INVALID_MESSAGE';
  end if;

  -- Serialize conversation creation per owner so concurrent requests cannot
  -- bypass the three-conversations-per-ten-minutes limit.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_owner_user_id::text, 0)
  );

  select pg_catalog.count(*)::integer
    into v_recent_count
    from public.df_support_conversations
   where owner_user_id = p_owner_user_id
     and created_at >= pg_catalog.now() - interval '10 minutes';

  if v_recent_count >= 3 then
    raise exception using errcode = 'P0001', message = 'SUPPORT_RATE_LIMITED';
  end if;

  insert into public.df_support_conversations (
    owner_user_id,
    subject,
    category,
    status,
    last_message_at
  )
  values (
    p_owner_user_id,
    pg_catalog.btrim(p_subject),
    p_category,
    'waiting_for_admin',
    pg_catalog.now()
  )
  returning id, public.df_support_conversations.created_at,
            public.df_support_conversations.last_message_at,
            public.df_support_conversations.status
       into v_conversation_id, v_created_at, v_last_message_at, v_status;

  insert into public.df_support_messages (
    conversation_id,
    sender_user_id,
    sender_role,
    body
  )
  values (
    v_conversation_id,
    p_owner_user_id,
    'member',
    pg_catalog.btrim(p_body)
  )
  returning id into v_message_id;

  return query
    select v_conversation_id, v_message_id, v_created_at, v_last_message_at, v_status;
end;
$function$;

revoke all on function public.create_df_support_conversation(uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_df_support_conversation(uuid, text, text, text)
  to service_role;

comment on function public.create_df_support_conversation(uuid, text, text, text) is
  'Server-only atomic Contact Center conversation creation. Enforces three new conversations per owner per ten minutes with a transaction-scoped advisory lock.';
