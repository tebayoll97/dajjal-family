import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { translateBlogFields, mapBlogFields } from "@/lib/blog/translation";
import { normalizeEditorial, editorialToText } from "@/lib/blog/editorialContent";
import { translateEditorialContent } from "@/lib/blog/translateEditorial";
import { slugifyBlogTitle } from "@/lib/blog/auth";

export async function publishDraftForAutoPost(articleId) {
  const { data: article, error: lookupError } = await supabaseAdmin
    .from("df_blog_articles")
    .select("*")
    .eq("id", articleId)
    .maybeSingle();

  if (lookupError) throw new Error("Unable to load the queued draft.");
  if (!article) throw new Error("The queued draft no longer exists.");
  if (article.status === "published") return { alreadyPublished: true, article };
  if (article.status !== "draft") throw new Error("The queued article is no longer a draft.");

  const sourceLocale = article.source_locale ||
    (article.title_en && article.title_en === article.title_id ? "en" : "id");
  if (!["id", "en"].includes(sourceLocale)) throw new Error("The draft language is invalid.");

  const targetLocale = sourceLocale === "id" ? "en" : "id";
  const sourceContentKey = sourceLocale === "id" ? "content_id" : "content_en";
  const targetContentKey = sourceLocale === "id" ? "content_en" : "content_id";
  const sourceSlug = sourceLocale === "id" ? article.slug_id : (article.slug_en || article.slug_id);
  const fields = {
    title: article[sourceLocale === "id" ? "title_id" : "title_en"] || article.title_id,
    excerpt: article[sourceLocale === "id" ? "excerpt_id" : "excerpt_en"] || "",
    cover_image_alt: article[sourceLocale === "id" ? "cover_image_alt_id" : "cover_image_alt_en"] || "",
    meta_title: article[sourceLocale === "id" ? "meta_title_id" : "meta_title_en"] || "",
    meta_description: article[sourceLocale === "id" ? "meta_description_id" : "meta_description_en"] || "",
  };

  if (!fields.title?.trim() || !sourceSlug?.trim()) throw new Error("The draft title or URL is incomplete.");
  const editorial = normalizeEditorial(article[sourceContentKey] || article.content_id);
  if (!editorial.blocks.length) throw new Error("The draft content is empty.");

  const [translatedFields, translatedEditorial] = await Promise.all([
    translateBlogFields(fields, sourceLocale),
    translateEditorialContent(editorial, sourceLocale),
  ]);

  const translatedSlug = slugifyBlogTitle(translatedFields.title);
  if (!translatedSlug) throw new Error("The translated article URL is invalid.");

  const readingMinutes = Math.max(1, Math.ceil(
    editorialToText(editorial).split(/\s+/).filter(Boolean).length / 220
  ));
  const now = new Date().toISOString();
  const update = {
    ...mapBlogFields(fields, sourceLocale),
    ...mapBlogFields(translatedFields, targetLocale),
    [sourceContentKey]: JSON.stringify(editorial),
    [targetContentKey]: JSON.stringify(translatedEditorial),
    slug_id: sourceLocale === "id" ? sourceSlug : translatedSlug,
    slug_en: sourceLocale === "en" ? sourceSlug : translatedSlug,
    source_locale: sourceLocale,
    reading_minutes: readingMinutes,
    status: "published",
    published_at: now,
    updated_at: now,
    autopost_claimed_at: null,
  };

  const { data: published, error: publishError } = await supabaseAdmin
    .from("df_blog_articles")
    .update(update)
    .eq("id", articleId)
    .eq("status", "draft")
    .select("id,title_id,title_en,slug_id,slug_en,status,published_at")
    .maybeSingle();

  if (publishError) {
    console.error("DAJJAL AI auto-post publication failed:", publishError.code || "unknown");
    throw new Error(publishError.code === "23505"
      ? "The translated article URL is already in use."
      : "The article could not be published.");
  }
  if (!published) throw new Error("The draft changed before publication could finish.");

  revalidateTag("df-blog-public");
  revalidatePath("/id/blog");
  revalidatePath("/en/blog");
  revalidatePath("/sitemap.xml");
  if (published.slug_id) revalidatePath("/id/blog/" + published.slug_id);
  if (published.slug_en) revalidatePath("/en/blog/" + published.slug_en);

  return { alreadyPublished: false, article: published };
}
