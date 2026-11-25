import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PUBLIC_SELECT = "id,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,published_at,reading_minutes,df_blog_categories(slug,name_id,name_en),df_blog_contributors(display_name)";
const PUBLIC_CACHE = { revalidate: 120, tags: ["df-blog-public"] };

const cachedPublishedArticles = unstable_cache(async (locale, limit) => {
  const { data, error } = await supabaseAdmin.from("df_blog_articles").select(PUBLIC_SELECT)
    .eq("status", "published").not("published_at", "is", null)
    .order("published_at", { ascending: false }).limit(limit);
  if (error) { console.error("Blog listing query failed:", error); return []; }
  return (data || []).map((article) => ({
    ...article,
    title: locale === "en" ? article.title_en || article.title_id : article.title_id,
    excerpt: locale === "en" ? article.excerpt_en || article.excerpt_id : article.excerpt_id,
    cover_image_alt: locale === "en" ? article.cover_image_alt_en || article.cover_image_alt_id : article.cover_image_alt_id,
    slug: locale === "en" ? article.slug_en || article.slug_id : article.slug_id,
    category: Array.isArray(article.df_blog_categories) ? article.df_blog_categories[0] : article.df_blog_categories,
    author: Array.isArray(article.df_blog_contributors) ? article.df_blog_contributors[0] : article.df_blog_contributors,
  }));
}, ["df-blog-published-list-v1"], PUBLIC_CACHE);

export async function getPublishedArticles({ locale = "id", limit = 24 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 48);
  return cachedPublishedArticles(locale === "en" ? "en" : "id", safeLimit);
}

const cachedPublishedArticleBySlug = unstable_cache(async (slug, locale) => {
  const column = locale === "en" ? "slug_en" : "slug_id";
  const { data, error } = await supabaseAdmin.from("df_blog_articles")
    .select(`${PUBLIC_SELECT},content_id,content_en,meta_title_id,meta_title_en,meta_description_id,meta_description_en`)
    .eq("status", "published").not("published_at", "is", null).eq(column, slug).maybeSingle();
  if (error) { console.error("Blog article query failed:", error); return null; }
  if (!data) return null;
  return {
    ...data,
    title: locale === "en" ? data.title_en || data.title_id : data.title_id,
    excerpt: locale === "en" ? data.excerpt_en || data.excerpt_id : data.excerpt_id,
    cover_image_alt: locale === "en" ? data.cover_image_alt_en || data.cover_image_alt_id : data.cover_image_alt_id,
    content: locale === "en" ? data.content_en || data.content_id : data.content_id,
    slug: locale === "en" ? data.slug_en || data.slug_id : data.slug_id,
    category: Array.isArray(data.df_blog_categories) ? data.df_blog_categories[0] : data.df_blog_categories,
    author: Array.isArray(data.df_blog_contributors) ? data.df_blog_contributors[0] : data.df_blog_contributors,
  };
}, ["df-blog-published-article-v1"], PUBLIC_CACHE);

export async function getPublishedArticleBySlug(slug, locale = "id") {
  return cachedPublishedArticleBySlug(slug, locale === "en" ? "en" : "id");
}

const cachedBlogCategories = unstable_cache(async (locale) => {
  const { data, error } = await supabaseAdmin.from("df_blog_categories")
    .select("id,slug,name_id,name_en,description_id,description_en")
    .eq("is_active", true).order("sort_order", { ascending: true });
  if (error) { console.error("Blog category query failed:", error); return []; }
  return (data || []).map((category) => ({
    ...category,
    name: locale === "en" ? category.name_en || category.name_id : category.name_id,
  }));
}, ["df-blog-active-categories-v1"], PUBLIC_CACHE);

export async function getBlogCategories(locale = "id") {
  return cachedBlogCategories(locale === "en" ? "en" : "id");
}

const cachedBlogArticleNavigation = unstable_cache(async (locale) => {
  const [recentResult, categoriesResult] = await Promise.all([
    supabaseAdmin.from("df_blog_articles").select("id,slug_id,slug_en,title_id,title_en,published_at")
      .eq("status", "published").not("published_at", "is", null)
      .order("published_at", { ascending: false }).limit(12),
    supabaseAdmin.from("df_blog_categories").select("id,slug,name_id,name_en")
      .eq("is_active", true).order("sort_order", { ascending: true }),
  ]);
  if (recentResult.error) console.error("Blog recent posts query failed:", recentResult.error);
  if (categoriesResult.error) console.error("Blog category navigation query failed:", categoriesResult.error);
  const categories = await Promise.all((categoriesResult.data || []).map(async (category) => {
    const { count, error } = await supabaseAdmin.from("df_blog_articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published").not("published_at", "is", null).eq("category_id", category.id);
    if (error) console.error("Blog category count query failed:", error);
    return { ...category, name: locale === "en" ? category.name_en || category.name_id : category.name_id, article_count: count || 0 };
  }));
  const recentPosts = (recentResult.data || []).map((article) => ({
    ...article,
    slug: locale === "en" ? article.slug_en || article.slug_id : article.slug_id,
    title: locale === "en" ? article.title_en || article.title_id : article.title_id,
  }));
  return { recentPosts, categories };
}, ["df-blog-article-navigation-v1"], PUBLIC_CACHE);

export async function getBlogArticleNavigationData(locale = "id", currentArticleId = null) {
  const data = await cachedBlogArticleNavigation(locale === "en" ? "en" : "id");
  return { ...data, recentPosts: data.recentPosts.filter((article) => article.id !== currentArticleId).slice(0, 3) };
}
