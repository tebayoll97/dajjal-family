import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 300;

const origin = "https://dajjalfamily.com";
const locales = ["id", "en"];
const publicRoutes = [
  "", "/games", "/knowledge", "/blog", "/contributors", "/digital-products", "/business",
  "/community", "/community-guidelines", "/about", "/contact", "/help",
  "/privacy-policy", "/terms", "/cookies", "/disclaimer",
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

  const { data: contributors, error: contributorError } = await supabaseAdmin.from("df_contributors").select("slug").eq("status", "active").eq("public_profile_enabled", true).limit(5000);
  if (contributorError) console.error("Contributor sitemap query failed:", contributorError);
  const authorProfiles = (contributors || []).flatMap((contributor) => locales.map((locale) => ({ url: `${origin}/${locale}/contributors/profile/${contributor.slug}`, changeFrequency: "monthly", priority: 0.45, alternates: { languages: { id: `${origin}/id/contributors/profile/${contributor.slug}`, en: `${origin}/en/contributors/profile/${contributor.slug}` } } })));

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
