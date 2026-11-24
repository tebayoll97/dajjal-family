import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError, slugifyBlogTitle } from "@/lib/blog/auth";
import { translateBlogFields, mapBlogFields } from "@/lib/blog/translation";
export const dynamic = "force-dynamic";
const FIELDS = "id,contributor_id,category_id,status,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,content_id,content_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,meta_title_id,meta_title_en,meta_description_id,meta_description_en,reading_minutes,published_at,created_at,updated_at";
const TEXT_FIELDS = ["title", "excerpt", "content", "cover_image_alt", "meta_title", "meta_description"];
const LIMITS = { title: 180, excerpt: 360, content: 60000, cover_image_alt: 180, meta_title: 180, meta_description: 320 };
function cleanSource(body) {
  const fields = {};
  for (const key of TEXT_FIELDS) {
    const value = typeof body[key] === "string" ? body[key].trim() : "";
    if (value.length > LIMITS[key]) throw new Error("FIELD_TOO_LONG");
    fields[key] = value;
  }
  if (!fields.title || !fields.content) throw new Error("ARTICLE_CONTENT_REQUIRED");
  return fields;
}
function revalidateArticle(article) {
  revalidatePath("/id/blog"); revalidatePath("/en/blog"); revalidatePath("/sitemap.xml");
  if (article.slug_id) revalidatePath("/id/blog/" + article.slug_id);
  if (article.slug_en) revalidatePath("/en/blog/" + article.slug_en);
}
function errorResponse(error) {
  const messages = {
    TRANSLATION_NOT_CONFIGURED: ["Automatic translation is not configured. Contact the administrator.", 503],
    TRANSLATION_FAILED: ["Gemini could not complete a reliable translation. Nothing was published; please try again.", 502],
    INVALID_SOURCE_LOCALE: ["The active language could not be verified. Refresh the page and try again.", 422],
    FIELD_TOO_LONG: ["One or more article fields exceed the allowed length.", 422],
    ARTICLE_CONTENT_REQUIRED: ["An article title and content are required.", 422],
  };
  const [message, status] = messages[error.message] || ["Unable to process the article.", 422];
  return blogError(message, status);
}
async function prepare(body, publish) {
  const locale = body.source_locale;
  if (locale !== "id" && locale !== "en") throw new Error("INVALID_SOURCE_LOCALE");
  const source = cleanSource(body);
  const translated = publish ? await translateBlogFields(source, locale) : source;
  const targetLocale = locale === "id" ? "en" : "id";
  const slug = slugifyBlogTitle(body.slug || source.title);
  if (!slug) throw new Error("INVALID_SOURCE_LOCALE");
  const record = {
    ...mapBlogFields(source, locale),
    ...mapBlogFields(translated, targetLocale),
    [locale === "id" ? "slug_id" : "slug_en"]: slug,
    cover_image_url: typeof body.cover_image_url === "string" && /^https:\/\//i.test(body.cover_image_url) ? body.cover_image_url.trim().slice(0, 2000) : null,
    reading_minutes: Math.max(1, Math.ceil(source.content.split(/\s+/).filter(Boolean).length / 220)),
  };
  if (publish) {
    record[locale === "id" ? "slug_en" : "slug_id"] = slugifyBlogTitle(translated.title) || slug;
    record.status = "published";
    record.published_at = new Date().toISOString();
  } else {
    if (locale === "en") {
      record.title_id = source.title;
      record.content_id = source.content;
      record.slug_id = slug;
    }
    record.status = "draft";
    record.published_at = null;
  }
  return record;
}
export async function GET(request) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  let query = supabaseAdmin.from("df_blog_articles").select(FIELDS + ",df_blog_contributors(display_name)").order("updated_at", { ascending: false }).limit(auth.isOwner ? 500 : 100);
  if (!auth.isOwner) query = query.eq("contributor_id", auth.contributor.id);
  const { data, error } = await query;
  if (error) return blogError("Unable to load articles.", 500);
  return Response.json({ success: true, articles: data || [], owner: auth.isOwner, owner_name: auth.isOwner ? auth.ownerName : null }, { headers: BLOG_PRIVATE_HEADERS });
}
export async function POST(request) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  const body = await request.json().catch(() => ({}));
  let record;
  try { record = await prepare(body, body.status === "published"); } catch (error) { return errorResponse(error); }
  const categoryId = typeof body.category_id === "string" && body.category_id ? body.category_id : null;
  if (categoryId) {
    const { data: category, error } = await supabaseAdmin.from("df_blog_categories").select("id").eq("id", categoryId).eq("is_active", true).maybeSingle();
    if (error) return blogError("Unable to verify the selected category.", 500);
    if (!category) return blogError("Choose an active Blog category.", 422);
  }
  record.contributor_id = auth.contributor.id;
  record.category_id = categoryId;
  const { data, error } = await supabaseAdmin.from("df_blog_articles").insert(record).select(FIELDS).single();
  if (error) {
    console.error("Blog article create failed:", error);
    return blogError(error.code === "23505" ? "That article URL is already in use." : "Unable to save the article.", error.code === "23505" ? 409 : 500);
  }
  revalidateArticle(data);
  return Response.json({ success: true, article: data }, { status: 201, headers: BLOG_PRIVATE_HEADERS });
}
