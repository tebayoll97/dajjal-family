import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPublishedBlogAuthors } from "@/lib/blog/publicArticles";

export const revalidate = 300;

const origin = "https://dajjalfamily.com";
const locales = ["id", "en"];
const publicRoutes = [
  "", "/games", "/knowledge", "/blog", "/blog/author", "/digital-products", "/business",
  "/community", "/community-guidelines", "/about", "/contact", "/help",
  "/music", "/df", "/df/couple", "/df/wedding-anak-dajjal",
];

export default async function sitemap() {
  const fixed = publicRoutes.flatMap((route) => locales.map((locale) => ({
    url: `${origin}/${locale}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/games" ? 0.8 : route === "/help" || route === "/music" ? 0.7 : 0.6,
    alternates: { languages: { id: `${origin}/id${route}`, en: `${origin}/en${route}` } },
  })));

  const { data, error } = await supabaseAdmin
    .from("df_blog_articles")
    .select("slug_id,slug_en,updated_at,published_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(5000);

  if (error) console.error("Blog sitemap query failed:", error);

  const authors = await getPublishedBlogAuthors("id");
  const authorProfiles = authors.flatMap((author) => locales.map((locale) => ({ url: `${origin}/${locale}/blog/author/${author.slug}`, changeFrequency: "monthly", priority: 0.45, alternates: { languages: { id: `${origin}/id/blog/author/${author.slug}`, en: `${origin}/en/blog/author/${author.slug}` } } })));

  const articles = (data || []).flatMap((article) => {
    const languages = {};
    if (article.slug_id) languages.id = `${origin}/id/blog/${article.slug_id}`;
    if (article.slug_en) languages.en = `${origin}/en/blog/${article.slug_en}`;
    return locales
      .filter((locale) => locale === "id" ? Boolean(article.slug_id) : Boolean(article.slug_en))
      .map((locale) => ({
        url: locale === "id" ? languages.id : languages.en,
        lastModified: article.updated_at || article.published_at,
        changeFrequency: "monthly",
        priority: 0.65,
        alternates: { languages },
      }));
  });

  return [...fixed, ...authorProfiles, ...articles];
}
