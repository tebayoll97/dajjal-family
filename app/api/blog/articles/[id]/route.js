import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError, slugifyBlogTitle } from "@/lib/blog/auth";
import { translateBlogFields, mapBlogFields } from "@/lib/blog/translation";
export const dynamic = "force-dynamic";
const FIELDS = "id,contributor_id,category_id,status,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,content_id,content_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,meta_title_id,meta_title_en,meta_description_id,meta_description_en,reading_minutes,published_at,created_at,updated_at";
const KEYS = ["title", "excerpt", "content", "cover_image_alt", "meta_title", "meta_description"];
const LIMITS = { title: 180, excerpt: 360, content: 60000, cover_image_alt: 180, meta_title: 180, meta_description: 320 };
function cleanSource(body) {
  const fields = {};
  for (const key of KEYS) {
    const value = typeof body[key] === "string" ? body[key].trim() : "";
    if (value.length > LIMITS[key]) throw new Error("FIELD_TOO_LONG");
    fields[key] = value;
  }
  if (!fields.title || !fields.content) throw new Error("ARTICLE_CONTENT_REQUIRED");
  return fields;
}
function errorResponse(error) {
  const map = {
    TRANSLATION_NOT_CONFIGURED: ["Automatic translation is not configured. Contact the administrator.", 503],
    TRANSLATION_FAILED: ["Gemini could not complete a reliable translation. Nothing was published; please try again.", 502],
    INVALID_SOURCE_LOCALE: ["The active language could not be verified. Refresh the page and try again.", 422],
    FIELD_TOO_LONG: ["One or more article fields exceed the allowed length.", 422],
    ARTICLE_CONTENT_REQUIRED: ["An article title and content are required.", 422],
  };
  const [message, status] = map[error.message] || ["Unable to process the article.", 422];
  return blogError(message, status);
}
function revalidateArticle(article) {
  revalidatePath("/id/blog"); revalidatePath("/en/blog"); revalidatePath("/sitemap.xml");
  if (article.slug_id) revalidatePath("/id/blog/" + article.slug_id);
  if (article.slug_en) revalidatePath("/en/blog/" + article.slug_en);
}
export async function PATCH(request, { params }) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  let lookup = supabaseAdmin.from("df_blog_articles").select(FIELDS).eq("id", id);
  if (!auth.isOwner) lookup = lookup.eq("contributor_id", auth.contributor.id);
  const { data: existing, error: lookupError } = await lookup.maybeSingle();
  if (lookupError) return blogError("Unable to load the article.", 500);
  if (!existing) return blogError("Article not found.", 404);
  const update = {};
  if (body.category_id !== undefined) {
    const categoryId = typeof body.category_id === "string" && body.category_id ? body.category_id : null;
    if (categoryId) {
      const { data: category, error } = await supabaseAdmin.from("df_blog_categories").select("id").eq("id", categoryId).eq("is_active", true).maybeSingle();
      if (error) return blogError("Unable to verify the selected category.", 500);
      if (!category) return blogError("Choose an active Blog category.", 422);
    }
    update.category_id = categoryId;
  }
  if (body.cover_image_url !== undefined) {
    if (body.cover_image_url && (typeof body.cover_image_url !== "string" || !/^https:\/\//i.test(body.cover_image_url))) return blogError("Cover image must use HTTPS.", 422);
    update.cover_image_url = body.cover_image_url ? body.cover_image_url.trim().slice(0, 2000) : null;
  }
  if (body.source_locale !== "id" && body.source_locale !== "en") return blogError("The active language could not be verified. Refresh the page and try again.", 422);
  let source;
  try { source = cleanSource(body); } catch (error) { return errorResponse(error); }
  if (body.status === "published") {
    try {
      const translated = await translateBlogFields(source, body.source_locale);
      const targetLocale = body.source_locale === "id" ? "en" : "id";
      Object.assign(update, mapBlogFields(source, body.source_locale), mapBlogFields(translated, targetLocale));
      const slug = slugifyBlogTitle(body.slug || source.title);
      if (!slug) return blogError("A valid article URL is required.", 422);
      update[body.source_locale === "id" ? "slug_id" : "slug_en"] = slug;
      update[body.source_locale === "id" ? "slug_en" : "slug_id"] = slugifyBlogTitle(translated.title) || slug;
      update.status = "published";
      update.published_at = existing.published_at || new Date().toISOString();
      update.reading_minutes = Math.max(1, Math.ceil(source.content.split(/\s+/).filter(Boolean).length / 220));
    } catch (error) { return errorResponse(error); }
  } else if (body.status === "draft") {
    try {
      Object.assign(update, mapBlogFields(source, body.source_locale));
      const slug = slugifyBlogTitle(body.slug || source.title);
      if (!slug) return blogError("A valid article URL is required.", 422);
      update[body.source_locale === "id" ? "slug_id" : "slug_en"] = slug;
      if (body.source_locale === "en" && !existing.title_id) {
        update.title_id = source.title;
        update.content_id = source.content;
        update.slug_id = slug;
      }
      update.status = "draft";
      update.published_at = null;
    } catch (error) { return errorResponse(error); }
  }
  update.updated_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from("df_blog_articles").update(update).eq("id", id).select(FIELDS).maybeSingle();
  if (error) return blogError(error.code === "23505" ? "That article URL is already in use." : "Unable to update the article.", error.code === "23505" ? 409 : 500);
  if (!data) return blogError("Article not found.", 404);
  revalidateArticle(data);
  return Response.json({ success: true, article: data, owner: auth.isOwner }, { headers: BLOG_PRIVATE_HEADERS });
}
export async function DELETE(request, { params }) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  const { id } = await params;
  let lookup = supabaseAdmin.from("df_blog_articles").select("slug_id,slug_en").eq("id", id);
  if (!auth.isOwner) lookup = lookup.eq("contributor_id", auth.contributor.id);
  const { data: existing } = await lookup.maybeSingle();
  if (!existing) return blogError("Article not found.", 404);
  let query = supabaseAdmin.from("df_blog_articles").delete({ count: "exact" }).eq("id", id);
  if (!auth.isOwner) query = query.eq("contributor_id", auth.contributor.id);
  const { error, count } = await query;
  if (error) return blogError("Unable to delete the article.", 500);
  if (!count) return blogError("Article not found.", 404);
  revalidatePath("/id/blog"); revalidatePath("/en/blog"); revalidatePath("/sitemap.xml");
  if (existing.slug_id) revalidatePath("/id/blog/" + existing.slug_id);
  if (existing.slug_en) revalidatePath("/en/blog/" + existing.slug_en);
  return Response.json({ success: true }, { headers: BLOG_PRIVATE_HEADERS });
}
