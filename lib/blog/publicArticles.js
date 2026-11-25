import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PUBLIC_SELECT = "id,slug_id,slug_en,title_id,title_en,excerpt_id,excerpt_en,cover_image_url,cover_image_alt_id,cover_image_alt_en,published_at,reading_minutes,df_blog_categories(slug,name_id,name_en),df_contributors(id,display_name,slug,bio_id,bio_en,avatar_url)";
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
    author: (() => { const author = Array.isArray(article.df_contributors) ? article.df_contributors[0] : article.df_contributors; return author ? { ...author, slug: author.slug } : null; })(),
  }));
}, ["df-blog-published-list-v2"], PUBLIC_CACHE);

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
    author: (() => { const author = Array.isArray(data.df_contributors) ? data.df_contributors[0] : data.df_contributors; return author ? { ...author, slug: author.slug } : null; })(),
  };
}, ["df-blog-published-article-v2"], PUBLIC_CACHE);

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


const cachedPublishedArticlePage = unstable_cache(async (locale, requestedPage, limit, categoryId, searchTerm) => {
  const safeSearch = String(searchTerm || "").normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const buildQuery = () => {
    let query = supabaseAdmin.from("df_blog_articles").select(PUBLIC_SELECT, { count: "exact" })
      .eq("status", "published").not("published_at", "is", null);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (safeSearch) {
      const pattern = "%" + safeSearch + "%";
      query = query.or(["title_id.ilike." + pattern, "title_en.ilike." + pattern, "excerpt_id.ilike." + pattern, "excerpt_en.ilike." + pattern].join(","));
    }
    return query.order("published_at", { ascending: false });
  };
  const firstOffset = (requestedPage - 1) * limit;
  let { data, count, error } = await buildQuery().range(firstOffset, firstOffset + limit - 1);
  if (error) { console.error("Blog paginated listing query failed:", error); return { articles: [], total: 0, page: 1, totalPages: 1 }; }
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(requestedPage, totalPages);
  if (page !== requestedPage) {
    const result = await buildQuery().range((page - 1) * limit, page * limit - 1);
    if (result.error) { console.error("Blog listing page correction failed:", result.error); return { articles: [], total, page, totalPages }; }
    data = result.data;
  }
  const articles = (data || []).map((article) => ({
    ...article,
    title: locale === "en" ? article.title_en || article.title_id : article.title_id,
    excerpt: locale === "en" ? article.excerpt_en || article.excerpt_id : article.excerpt_id,
    cover_image_alt: locale === "en" ? article.cover_image_alt_en || article.cover_image_alt_id : article.cover_image_alt_id,
    slug: locale === "en" ? article.slug_en || article.slug_id : article.slug_id,
    category: Array.isArray(article.df_blog_categories) ? article.df_blog_categories[0] : article.df_blog_categories,
    author: (() => { const author = Array.isArray(article.df_contributors) ? article.df_contributors[0] : article.df_contributors; return author ? { ...author, slug: author.slug } : null; })(),
  }));
  return { articles, total, page, totalPages };
}, ["df-blog-published-page-v2"], PUBLIC_CACHE);

export async function getPublishedArticlePage({ locale = "id", page = 1, limit = 12, categoryId = null, query = "" } = {}) {
  const safeLocale = locale === "en" ? "en" : "id";
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 24);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), 10000);
  const safeCategoryId = typeof categoryId === "string" && categoryId.length <= 128 ? categoryId : null;
  return cachedPublishedArticlePage(safeLocale, safePage, safeLimit, safeCategoryId, String(query || "").slice(0, 80));
}


const cachedBlogAuthors = unstable_cache(async () => {
  const { data: rows, error } = await supabaseAdmin.from("df_blog_articles")
    .select("contributor_id,df_contributors!inner(id,display_name,slug,status,bio_id,bio_en,avatar_url)")
    .eq("status", "published").not("published_at", "is", null).limit(5000);
  if (error) { console.error("Blog author directory query failed:", error); return []; }
  const authors = new Map();
  for (const row of rows || []) {
    const author = Array.isArray(row.df_contributors) ? row.df_contributors[0] : row.df_contributors;
    if (!author || author.status !== "active") continue;
    const current = authors.get(author.id) || { id: author.id, display_name: author.display_name, slug: author.slug, bio_id: author.bio_id, bio_en: author.bio_en, avatar_url: author.avatar_url, article_count: 0 };
    current.article_count += 1;
    authors.set(author.id, current);
  }
  return [...authors.values()].filter((author) => author.slug).sort((a, b) => a.display_name.localeCompare(b.display_name));
}, ["df-blog-author-directory-v2"], PUBLIC_CACHE);

export async function getPublishedBlogAuthors(locale = "id") {
  return cachedBlogAuthors();
}

const cachedBlogAuthorProfile = unstable_cache(async (slug, locale) => {
  const authors = await cachedBlogAuthors();
  const author = authors.find((item) => item.slug === slug);
  if (!author) return null;
  const { data: contributor, error: authorError } = await supabaseAdmin
    .from("df_contributors").select("id,display_name,slug,created_at,bio_id,bio_en,avatar_url")
    .eq("id", author.id).eq("status", "approved").maybeSingle();
  if (authorError) { console.error("Blog author profile query failed:", authorError); return null; }
  if (!contributor) return null;
  const { data: rows, error } = await supabaseAdmin.from("df_blog_articles")
    .select(PUBLIC_SELECT).eq("contributor_id", contributor.id).eq("status", "published")
    .not("published_at", "is", null).order("published_at", { ascending: false }).limit(48);
  if (error) { console.error("Blog author articles query failed:", error); return { author: { ...contributor, slug, article_count: author.article_count }, articles: [] }; }
  const articles = (rows || []).map((article) => ({
    ...article,
    title: locale === "en" ? article.title_en || article.title_id : article.title_id,
    excerpt: locale === "en" ? article.excerpt_en || article.excerpt_id : article.excerpt_id,
    cover_image_alt: locale === "en" ? article.cover_image_alt_en || article.cover_image_alt_id : article.cover_image_alt_id,
    slug: locale === "en" ? article.slug_en || article.slug_id : article.slug_id,
    category: Array.isArray(article.df_blog_categories) ? article.df_blog_categories[0] : article.df_blog_categories,
    author: { ...contributor, slug: author.slug },
  }));
  return { author: { ...contributor, slug, article_count: author.article_count }, articles };
}, ["df-blog-author-profile-v2"], PUBLIC_CACHE);

export async function getPublishedBlogAuthorProfile(slug, locale = "id") {
  return cachedBlogAuthorProfile(String(slug || "").toLowerCase(), locale === "en" ? "en" : "id");
}
