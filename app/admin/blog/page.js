import { headers } from "next/headers";

export async function generateMetadata() {
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const title = locale === "id" ? "Pengelolaan Blog | DAJJAL FAMILY" : "Blog Management | DAJJAL FAMILY";
  const description = locale === "id" ? "Kelola pendaftaran kontributor, kategori, dan artikel DAJJAL FAMILY." : "Manage DAJJAL FAMILY contributor applications, categories, and articles.";
  const url = `https://dajjalfamily.com/${locale}/admin/blog`;
  const image = "https://dajjalfamily.com/dajjalfamily_icon_192.png";
  return { title, description, robots: { index: false, follow: false }, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "DAJJAL FAMILY", type: "website", images: [{ url: image, alt: "DAJJAL FAMILY" }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

import AdminBlogManager from "@/app/components/blog/AdminBlogManager";\nimport ContributorProvisioning from "@/app/components/contributors/ContributorProvisioning";
export default function AdminBlogPage(){return <><ContributorProvisioning/><AdminBlogManager/></>;}
