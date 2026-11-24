import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError, slugifyBlogTitle } from "@/lib/blog/auth";

export const dynamic = "force-dynamic";
const FIELDS = "id,contributor_id,category_id,status,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,content_id,content_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,meta_title_id,meta_title_en,meta_description_id,meta_description_en,reading_minutes,published_at,created_at,updated_at";

export async function GET(request) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  let query = supabaseAdmin.from("df_blog_articles").select(`${FIELDS},df_blog_contributors(display_name)`).order("updated_at", { ascending: false }).limit(auth.isOwner ? 500 : 100);
  if (!auth.isOwner) query = query.eq("contributor_id", auth.contributor.id);
  const { data, error } = await query;
  if (error) return blogError("Unable to load articles.", 500);
  return Response.json({ success: true, articles: data || [], owner: auth.isOwner, owner_name: auth.isOwner ? auth.ownerName : null }, { headers: BLOG_PRIVATE_HEADERS });
}

export async function POST(request) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return blogError(auth.error, auth.status);
  const body = await request.json().catch(() => ({}));
  const title = String(body.title_id || "").trim().slice(0, 180);
  const content = String(body.content_id || "").trim().slice(0, 60000);
  if (!title || !content) return blogError("Indonesian title and article content are required.", 422);
  const slug = slugifyBlogTitle(body.slug_id || title);
  if (!slug) return blogError("A valid article slug is required.", 422);
  const status = body.status === "published" ? "published" : "draft";
  const readingMinutes = Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 220));
  const categoryId = typeof body.category_id === "string" && body.category_id ? body.category_id : null;
  if (categoryId) {
    const { data: category } = await supabaseAdmin.from("df_blog_categories").select("id").eq("id", categoryId).eq("is_active", true).maybeSingle();
    if (!category) return blogError("Choose an active Blog category.", 422);
  }
  const record = {
    contributor_id: auth.contributor.id, category_id: categoryId, status,
    slug_id: slug, slug_en: slugifyBlogTitle(body.slug_en || body.title_en || "") || null,
    title_id: title, title_en: String(body.title_en || "").trim().slice(0, 180) || null,
    excerpt_id: String(body.excerpt_id || "").trim().slice(0, 360) || null,
    excerpt_en: String(body.excerpt_en || "").trim().slice(0, 360) || null,
    content_id: content, content_en: String(body.content_en || "").trim().slice(0, 60000) || null,
    cover_image_url: typeof body.cover_image_url === "string" && /^https:\/\//i.test(body.cover_image_url) ? body.cover_image_url.slice(0, 2000) : null,
    cover_image_alt_id: String(body.cover_image_alt_id || "").trim().slice(0, 180) || null,
    cover_image_alt_en: String(body.cover_image_alt_en || "").trim().slice(0, 180) || null,
    meta_title_id: String(body.meta_title_id || "").trim().slice(0, 180) || null,
    meta_title_en: String(body.meta_title_en || "").trim().slice(0, 180) || null,
    meta_description_id: String(body.meta_description_id || "").trim().slice(0, 320) || null,
    meta_description_en: String(body.meta_description_en || "").trim().slice(0, 320) || null,
    reading_minutes: readingMinutes,
    published_at: status === "published" ? new Date().toISOString() : null,
  };
  const { data, error } = await supabaseAdmin.from("df_blog_articles").insert(record).select(FIELDS).single();
  if (error) {
    console.error("Blog article create failed:", error);
    return blogError(error.code === "23505" ? "That article URL is already in use." : "Unable to save the article.", error.code === "23505" ? 409 : 500);
  }
  revalidatePath("/id/blog"); revalidatePath("/en/blog"); revalidatePath("/sitemap.xml");
  if (data.slug_id) revalidatePath(`/id/blog/${data.slug_id}`);
  if (data.slug_en) revalidatePath(`/en/blog/${data.slug_en}`);
  return Response.json({ success: true, article: data }, { status: 201, headers: BLOG_PRIVATE_HEADERS });
}
