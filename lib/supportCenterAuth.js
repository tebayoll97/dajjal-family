import "server-only";

import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";

export async function resolveSupportMember(request) {
  const auth = await resolveAuthenticatedPlayer(request);
  if (!auth.ok) return auth;

  // Anonymous/guest sessions are not eligible to open private support cases.
  if (auth.user?.is_anonymous === true) {
    return { ok: false, status: 403, error: "A registered account is required." };
  }

  return { ok: true, userId: auth.user.id };
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
