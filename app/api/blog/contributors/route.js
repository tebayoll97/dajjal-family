import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError } from "@/lib/blog/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await verifyBlogUser(request);
  if (!auth.ok) return blogError(auth.error, auth.status);
  return Response.json({ success: true, contributor: auth.contributor }, { headers: BLOG_PRIVATE_HEADERS });
}

export async function POST(request) {
  const auth = await verifyBlogUser(request);
  if (!auth.ok) return blogError(auth.error, auth.status);
  if (!auth.user.email_confirmed_at) return blogError("Verify your DAJJAL FAMILY email before applying.", 403);
  const body = await request.json().catch(() => ({}));
  const note = typeof body.application_note === "string" ? body.application_note.trim().slice(0, 1200) : "";
  const metadata = auth.user.user_metadata || {};
  const displayName = String(metadata.full_name || metadata.name || metadata.user_name || auth.user.email.split("@")[0]).trim().slice(0, 80);
  if (!displayName) return blogError("Your account name is unavailable. Update your DAJJAL FAMILY profile first.", 422);
  if (auth.contributor?.status === "approved") return blogError("Your contributor account is already approved.", 409);
  if (auth.contributor?.status === "suspended") return blogError("Contributor access is suspended.", 403);
  const record = {
    account_user_id: auth.user.id,
    display_name: displayName,
    email: auth.user.email.toLowerCase(),
    status: "pending",
    application_note: note || null,
    reviewed_by: null,
    reviewed_at: null,
  };
  const { data, error } = await supabaseAdmin.from("df_blog_contributors")
    .upsert(record, { onConflict: "account_user_id" })
    .select("id,display_name,email,status,created_at")
    .single();
  if (error) {
    console.error("Blog contributor application failed:", error);
    return blogError("Unable to submit your contributor application.", 500);
  }
  return Response.json({ success: true, contributor: data }, { status: 201, headers: BLOG_PRIVATE_HEADERS });
}
