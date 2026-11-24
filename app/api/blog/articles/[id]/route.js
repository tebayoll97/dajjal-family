import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError, slugifyBlogTitle } from "@/lib/blog/auth";

export const dynamic = "force-dynamic";
const FIELDS = "id,contributor_id,category_id,status,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,content_id,content_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,meta_title_id,meta_title_en,meta_description_id,meta_description_en,reading_minutes,published_at,created_at,updated_at";

export async function PATCH(request, { params }) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const allowed = ["category_id","slug_id","slug_en","title_id","title_en","excerpt_id","excerpt_en","content_id","content_en","cover_image_url","cover_image_alt_id","cover_image_alt_en","meta_title_id","meta_title_en","meta_description_id","meta_description_en"];
  const update = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(body, key)) update[key] = body[key];
  for (const key of ["title_id","title_en","excerpt_id","excerpt_en","content_id","content_en","cover_image_alt_id","cover_image_alt_en","meta_title_id","meta_title_en","meta_description_id","meta_description_en"]) {
    if (key in update) update[key] = String(update[key] || "").trim().slice(0, key.startsWith("content") ? 60000 : key.startsWith("meta_description") ? 320 : 360) || null;
  }
  if (update.title_id && !body.slug_id) update.slug_id = slugifyBlogTitle(update.title_id);
  if (update.slug_id) update.slug_id = slugifyBlogTitle(update.slug_id);
  if (update.slug_en) update.slug_en = slugifyBlogTitle(update.slug_en) || null;
  if (update.cover_image_url && !/^https:\/\//i.test(update.cover_image_url)) return blogError("Cover image must use HTTPS.", 422);
  if (update.category_id) {
    const { data: category } = await supabaseAdmin.from("df_blog_categories").select("id").eq("id", update.category_id).eq("is_active", true).maybeSingle();
    if (!category) return blogError("Choose an active Blog category.", 422);
  }
  if (update.content_id || update.content_en) {
    const contentForReading = String(update.content_id || update.content_en || "");
    update.reading_minutes = Math.max(1, Math.ceil(contentForReading.split(/\s+/).filter(Boolean).length / 220));
  }
  if (body.status === "draft") update.status = "draft";
  if (body.status === "published") {
    let existingQuery = supabaseAdmin.from("df_blog_articles").select("title_id,content_id,published_at").eq("id", id);
    if (!auth.isOwner) existingQuery = existingQuery.eq("contributor_id", auth.contributor.id);
    const { data: existing } = await existingQuery.maybeSingle();
    if (!existing?.title_id || !existing?.content_id) return blogError("Add an Indonesian title and article content before publishing.", 422);
    update.status = "published";
    update.published_at = existing.published_at || new Date().toISOString();
  }
  update.updated_at = new Date().toISOString();
  let query = supabaseAdmin.from("df_blog_articles").update(update).eq("id", id);
  if (!auth.isOwner) query = query.eq("contributor_id", auth.contributor.id);
  const { data, error } = await query.select(FIELDS).maybeSingle();
  if (error) return blogError(error.code === "23505" ? "That article URL is already in use." : "Unable to update the article.", error.code === "23505" ? 409 : 500);
  if (!data) return blogError("Article not found.", 404);
  return Response.json({ success: true, article: data, owner: auth.isOwner }, { headers: BLOG_PRIVATE_HEADERS });
}

export async function DELETE(request, { params }) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  const { id } = await params;
  let query = supabaseAdmin.from("df_blog_articles").delete({ count: "exact" }).eq("id", id);
  if (!auth.isOwner) query = query.eq("contributor_id", auth.contributor.id);
  const { error, count } = await query;
  if (error) return blogError("Unable to delete the article.", 500);
  if (!count) return blogError("Article not found.", 404);
  return Response.json({ success: true }, { headers: BLOG_PRIVATE_HEADERS });
}
