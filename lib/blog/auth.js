import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Permanent Blog Owner identity. Authorization is bound to this immutable Auth UUID,
// and is re-checked against admin_users on every request. Email/user metadata is not
// used as an authorization claim.
export const BLOG_OWNER_USER_ID = "448532d5-a990-4173-804c-93daa72d1dc4";
export const BLOG_OWNER_DISPLAY_NAME = "Tebayoll";

async function isPermanentBlogOwner(user) {
  if (!user?.id || user.id !== BLOG_OWNER_USER_ID || !user.email_confirmed_at) return false;
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", BLOG_OWNER_USER_ID)
    .maybeSingle();
  if (error) {
    console.error("Blog Owner membership verification failed:", error);
    return false;
  }
  return data?.user_id === BLOG_OWNER_USER_ID;
}

async function ensureOwnerContributor(user) {
  const email = String(user.email || "").trim().toLowerCase();
  if (!email) return { data: null, error: new Error("Verified owner email is unavailable.") };
  return supabaseAdmin.from("df_blog_contributors")
    .upsert({
      account_user_id: BLOG_OWNER_USER_ID,
      display_name: BLOG_OWNER_DISPLAY_NAME,
      email,
      status: "approved",
      application_note: "Permanent DAJJAL FAMILY Blog Owner",
    }, { onConflict: "account_user_id" })
    .select("id,account_user_id,display_name,email,status,bio_id,bio_en,avatar_url")
    .single();
}

export async function verifyBlogUser(request, { approved = false } = {}) {
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization") || "");
  if (!match) return { ok: false, status: 401, error: "Session required." };
  const { data, error } = await supabaseAdmin.auth.getUser(match[1]);
  if (error || !data?.user?.id || !data.user.email) return { ok: false, status: 401, error: "Invalid session." };

  const isOwner = await isPermanentBlogOwner(data.user);
  if (data.user.id === BLOG_OWNER_USER_ID && !isOwner) {
    return { ok: false, status: 403, error: "Permanent Blog Owner authorization could not be verified." };
  }
  if (isOwner) {
    const { data: contributor, error: contributorError } = await ensureOwnerContributor(data.user);
    if (contributorError || !contributor) {
      console.error("Blog Owner contributor provisioning failed:", contributorError);
      return { ok: false, status: 500, error: "Unable to initialize Blog Owner workspace." };
    }
    return { ok: true, user: data.user, contributor, isOwner: true, ownerName: BLOG_OWNER_DISPLAY_NAME };
  }

  const { data: contributor, error: contributorError } = await supabaseAdmin
    .from("df_blog_contributors")
    .select("id,account_user_id,display_name,email,status,bio_id,bio_en,avatar_url")
    .eq("account_user_id", data.user.id)
    .maybeSingle();
  if (contributorError) return { ok: false, status: 500, error: "Unable to verify Blog contributor." };
  if (!contributor) return { ok: true, user: data.user, contributor: null, isOwner: false };
  if (approved && contributor.status !== "approved") return { ok: false, status: 403, error: "Contributor approval is required." };
  if (contributor.status === "suspended") return { ok: false, status: 403, error: "Contributor access is suspended." };
  return { ok: true, user: data.user, contributor, isOwner: false };
}

export const BLOG_PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0, must-revalidate", Vary: "Authorization" };
export function blogError(message, status = 400) {
  return Response.json({ success: false, error: message }, { status, headers: BLOG_PRIVATE_HEADERS });
}
export function slugifyBlogTitle(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}
