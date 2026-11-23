-- Durable server-route rate limiter shared with direct Data API insert triggers.
-- Only the trusted service_role JWT may consume a counter through this RPC.
create or replace function public.consume_wedding_submission_rate_limit(
  p_scope text,
  p_client_ip inet
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_claims jsonb;
  v_role text;
  v_salt text;
  v_ip_hash text;
  v_window timestamptz;
  v_count integer;
begin
  v_claims := coalesce(
    nullif(pg_catalog.current_setting('request.jwt.claims', true), ''),
    nullif(pg_catalog.current_setting('request.jwt', true), ''),
    '{}'
  )::jsonb;

  v_role := coalesce(
    v_claims ->> 'role',
    pg_catalog.current_setting('request.jwt.claim.role', true),
    ''
  );

  if v_role <> 'service_role' then
    raise insufficient_privilege using
      message = 'Only trusted server submissions may consume this rate limit.';
  end if;

  if p_scope not in ('rsvp', 'guestbook') or p_client_ip is null then
    raise invalid_parameter_value using
      message = 'Invalid wedding submission rate-limit parameters.';
  end if;

  select c.hash_salt
    into v_salt
  from private.wedding_submission_rate_limit_config as c
  where c.id = true;

  if v_salt is null then
    raise sqlstate '55000'
      using message = 'Wedding submission rate limiter is not configured.';
  end if;

  v_ip_hash := pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(v_salt || ':' || pg_catalog.host(p_client_ip), 'UTF8')
    ),
    'hex'
  );

  v_window := pg_catalog.to_timestamp(
    pg_catalog.floor(
      extract(epoch from pg_catalog.clock_timestamp()) / 600
    ) * 600
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_scope || ':' || v_ip_hash, 0)
  );

  insert into private.wedding_submission_rate_limits (
    scope, ip_hash, window_started_at, request_count
  )
  values (p_scope, v_ip_hash, v_window, 1)
  on conflict (scope, ip_hash, window_started_at)
  do update
    set request_count = private.wedding_submission_rate_limits.request_count + 1
  returning request_count into v_count;

  delete from private.wedding_submission_rate_limits
  where window_started_at < v_window - interval '1 day';

  return v_count <= 5;
end;
$function$;

revoke all on function public.consume_wedding_submission_rate_limit(text, inet)
  from public, anon, authenticated;
grant execute on function public.consume_wedding_submission_rate_limit(text, inet)
  to service_role;
