import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { BlogAuthorProfile } from "@/app/components/blog";
import { getPublishedBlogAuthorProfile } from "@/lib/blog/publicArticles";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (slug !== "tebayoll") return {};
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const profile = await getPublishedBlogAuthorProfile(slug, locale);
  if (!profile) return { title: "Author not found", robots: { index: false, follow: false } };
  const title = locale === "en" ? `${profile.author.display_name} — Blog Author` : `${profile.author.display_name} — Penulis Blog`;
  const description = locale === "en" ? `Read articles written by ${profile.author.display_name} for DAJJAL FAMILY.` : `Baca artikel yang ditulis oleh ${profile.author.display_name} untuk DAJJAL FAMILY.`;
  const url = `https://dajjalfamily.com/${locale}/blog/author/tebayoll`;
  const image = "https://dajjalfamily.com/dajjalfamily_icon_192.png";
  return {
    title, description,
    alternates: { canonical: url, languages: { id: "https://dajjalfamily.com/id/blog/author/tebayoll", en: "https://dajjalfamily.com/en/blog/author/tebayoll" } },
    openGraph: { title, description, url, siteName: "DAJJAL FAMILY", type: "profile", images: [{ url: image, alt: "DAJJAL FAMILY" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogAuthorRoute({ params }) {
  const { slug } = await params;
  if (slug !== "tebayoll") notFound();
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const profile = await getPublishedBlogAuthorProfile(slug, locale);
  if (!profile) notFound();
  return <BlogAuthorProfile profile={profile} locale={locale} />;
}
