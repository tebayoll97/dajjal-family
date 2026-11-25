import { headers } from "next/headers";
import BlogAuthorDirectory from "@/app/components/blog/BlogAuthorDirectory";
import { getPublishedBlogAuthors } from "@/lib/blog/publicArticles";

export const revalidate = 300;

export async function generateMetadata() {
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const title = locale === "en" ? "Our Authors | DAJJAL FAMILY Blog" : "Para Penulis | Blog DAJJAL FAMILY";
  const description = locale === "en" ? "Meet the approved contributors behind DAJJAL FAMILY stories and articles." : "Kenali para kontributor resmi di balik cerita dan artikel DAJJAL FAMILY.";
  const url = `https://dajjalfamily.com/${locale}/blog/author`;
  const image = "https://dajjalfamily.com/dajjalfamily_icon_192.png";
  return {
    title, description,
    alternates: { canonical: url, languages: { id: "https://dajjalfamily.com/id/blog/author", en: "https://dajjalfamily.com/en/blog/author" } },
    openGraph: { title, description, url, siteName: "DAJJAL FAMILY", type: "website", images: [{ url: image, alt: "DAJJAL FAMILY" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogAuthorDirectoryPage() {
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const authors = await getPublishedBlogAuthors(locale);
  return <BlogAuthorDirectory authors={authors} locale={locale} />;
}
