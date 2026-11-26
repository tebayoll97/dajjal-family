import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError } from "@/lib/blog/auth";
import { translateBlogFields } from "@/lib/blog/translation";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await verifyBlogUser(request);
  if (!auth.ok) return blogError(auth.error, auth.status);
  return Response.json({ success: true, contributor: { ...auth.contributor, status: auth.contributor.status === "active" ? "approved" : auth.contributor.status }, owner: auth.isOwner, owner_name: auth.isOwner ? auth.ownerName : null }, { headers: BLOG_PRIVATE_HEADERS });
}

export async function POST(request) {
  const auth = await verifyBlogUser(request);
  if (!auth.ok) return blogError(auth.error, auth.status);
  if (auth.isOwner) return blogError("The permanent Blog Owner does not need contributor registration.", 409);
  if (!auth.user.email_confirmed_at) return blogError("Verify your DAJJAL FAMILY email before applying.", 403);
  const body = await request.json().catch(() => ({}));
  const note = typeof body.application_note === "string" ? body.application_note.trim().slice(0, 1200) : "";
  const metadata = auth.user.user_metadata || {};
  const { data: playerProfile, error: playerProfileError } = await supabaseAdmin.from("players").select("nickname").eq("auth_user_id", auth.user.id).maybeSingle();
  if (playerProfileError) return blogError("Unable to load your DAJJAL FAMILY profile.", 500);
  const displayName = String(playerProfile?.nickname || metadata.full_name || metadata.name || metadata.user_name || auth.user.email.split("@")[0]).trim().slice(0, 80);
  if (!displayName) return blogError("Your account name is unavailable. Update your DAJJAL FAMILY profile first.", 422);
  if (auth.contributor?.status === "approved") return blogError("Your contributor account is already approved.", 409);
  if (auth.contributor?.status === "suspended") return blogError("Contributor access is suspended.", 403);
  const record = {
    account_user_id: auth.user.id, display_name: displayName, email: auth.user.email.toLowerCase(),
    status: "pending", application_note: note || null, reviewed_by: null, reviewed_at: null,
  };
  const { data, error } = await supabaseAdmin.from("df_blog_contributors")
    .upsert(record, { onConflict: "account_user_id" })
    .select("id,display_name,slug,email,status,created_at").single();
  if (error) {
    console.error("Blog contributor application failed:", error);
    return blogError("Unable to submit your contributor application.", 500);
  }
  return Response.json({ success: true, contributor: data }, { status: 201, headers: BLOG_PRIVATE_HEADERS });
}

export async function PATCH(request) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  if (!auth.contributor?.id) return blogError("Contributor profile was not found.", 404);
  const body = await request.json().catch(() => ({}));
  const displayName = typeof body.display_name === "string" ? body.display_name.trim() : auth.contributor.display_name;
  const bio = typeof body.bio === "string" ? body.bio.trim() : (auth.contributor.bio_id || auth.contributor.bio_en || "");
  const sourceLocale = body.source_locale;
  if (!displayName || displayName.length > 80) return blogError("Display name must contain 1–80 characters.", 422);
  if (bio.length > 600) return blogError("Biography must not exceed 600 characters.", 422);
  if (!["id", "en"].includes(sourceLocale)) return blogError("Refresh the page language and try again.", 422);
  let bioId = auth.contributor.bio_id || "";
  let bioEn = auth.contributor.bio_en || "";
  try {
    if (!bio) { bioId = ""; bioEn = ""; }
    else {
      const translated = await translateBlogFields({ bio }, sourceLocale);
      if (sourceLocale === "id") { bioId = bio; bioEn = translated.bio; }
      else { bioEn = bio; bioId = translated.bio; }
    }
  } catch (cause) {
    const status = cause.message === "TRANSLATION_NOT_CONFIGURED" ? 503 : 502;
    return blogError(status === 503 ? "Automatic translation is not configured. Contact the administrator." : "Gemini could not complete the biography translation. Nothing was saved; please try again.", status);
  }
  const { data, error } = await supabaseAdmin.from("df_blog_contributors")
    .update({ display_name: displayName, bio_id: bioId || null, bio_en: bioEn || null, updated_at: new Date().toISOString() })
    .eq("id", auth.contributor.id).eq("account_user_id", auth.user.id)
    .select("id,display_name,slug,email,status,bio_id,bio_en,avatar_url").single();
  if (error || !data) {
    console.error("Contributor profile update failed:", error);
    return blogError("Unable to save contributor profile.", 500);
  }
  revalidateTag("df-blog-public");
  revalidatePath("/id/blog/author");
  revalidatePath("/en/blog/author");
  revalidatePath("/sitemap.xml");
  return Response.json({ success: true, contributor: data }, { headers: BLOG_PRIVATE_HEADERS });
}
