import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function verifyBlogUser(request, { approved = false } = {}) {
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization") || "");
  if (!match) return { ok: false, status: 401, error: "Session required." };
  const { data, error } = await supabaseAdmin.auth.getUser(match[1]);
  if (error || !data?.user?.id || !data.user.email) return { ok: false, status: 401, error: "Invalid session." };
  const { data: contributor, error: contributorError } = await supabaseAdmin
    .from("df_blog_contributors")
    .select("id,account_user_id,display_name,email,status")
    .eq("account_user_id", data.user.id)
    .maybeSingle();
  if (contributorError) return { ok: false, status: 500, error: "Unable to verify Blog contributor." };
  if (!contributor) return { ok: true, user: data.user, contributor: null };
  if (approved && contributor.status !== "approved") return { ok: false, status: 403, error: "Contributor approval is required." };
  if (contributor.status === "suspended") return { ok: false, status: 403, error: "Contributor access is suspended." };
  return { ok: true, user: data.user, contributor };
}

export const BLOG_PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0, must-revalidate", "Vary": "Authorization" };
export function blogError(message, status = 400) {
  return Response.json({ success: false, error: message }, { status, headers: BLOG_PRIVATE_HEADERS });
}
export function slugifyBlogTitle(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}
