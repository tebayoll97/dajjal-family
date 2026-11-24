import { notFound } from "next/navigation";
import { headers } from "next/headers";
import AuthorPortal from "@/app/components/blog/AuthorPortal";

export async function generateMetadata({ params }) {
  const { section } = await params;
  if (section !== "blog") return {};
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const title = locale === "en" ? "Apply as a Blog Author | DAJJAL FAMILY" : "Daftar sebagai Penulis Blog | DAJJAL FAMILY";
  const description = locale === "en" ? "Apply to contribute original articles to DAJJAL FAMILY Blog." : "Ajukan diri untuk menerbitkan artikel orisinal di Blog DAJJAL FAMILY.";
  const url = `https://dajjalfamily.com/${locale}/blog/author/apply`;
  return { title, description, robots: { index: false, follow: false }, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "DAJJAL FAMILY", type: "website", images: [{ url: "/dajjalfamily_icon_192.png", alt: "DAJJAL FAMILY" }] }, twitter: { card: "summary_large_image", title, description, images: ["/dajjalfamily_icon_192.png"] } };
}

export default async function BlogAuthorApplyPage({ params }) {
  const { section } = await params;
  if (section !== "blog") notFound();
  return <AuthorPortal mode="apply" />;
}
