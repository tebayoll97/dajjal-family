import { headers } from "next/headers";
import AdminBlogManager from "@/app/components/blog/AdminBlogManager";
import ContributorProvisioning from "@/app/components/contributors/ContributorProvisioning";

export async function generateMetadata() {
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const title = locale === "id" ? "Pengelolaan Kontributor | DAJJAL FAMILY" : "Contributor Management | DAJJAL FAMILY";
  const description = locale === "id" ? "Buat akun kontributor, atur akses, dan kelola artikel DAJJAL FAMILY." : "Create contributor accounts, assign access, and manage DAJJAL FAMILY articles.";
  const url = `https://dajjalfamily.com/${locale}/admin/blog`;
  const image = "https://dajjalfamily.com/dajjalfamily_icon_192.png";
  return {
    title, description, robots: { index: false, follow: false }, alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "DAJJAL FAMILY", type: "website", images: [{ url: image, alt: "DAJJAL FAMILY" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function AdminBlogPage() {
  return <><ContributorProvisioning /><AdminBlogManager /></>;
}
