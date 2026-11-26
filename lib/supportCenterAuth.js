import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function resolveSupportMember(request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = authorization.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  const user = data?.user;

  if (error || !user) {
    return { ok: false, status: 401, error: "Invalid session" };
  }

  // Contact Center ownership is based on the central Auth identity, not the
  // optional gaming Player profile. Anonymous/guest sessions are not eligible.
  if (user.is_anonymous === true) {
    return { ok: false, status: 403, error: "A registered account is required." };
  }

  return { ok: true, userId: user.id };
}

export function supportJson(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function supportError(message, status = 400) {
  return supportJson({ error: message }, status);
}

export function parsePositivePage(value, max = 200) {
  const parsed = Number.parseInt(value || "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, max);
}
