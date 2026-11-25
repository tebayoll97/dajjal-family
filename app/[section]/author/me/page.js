import { notFound } from "next/navigation";
import { headers } from "next/headers";
import AuthorPortal from "@/app/components/blog/AuthorPortal";

export async function generateMetadata({ params }) {
  const { section } = await params;
  if (section !== "author") return {};
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const title = locale === "en" ? "My Contributor Workspace | DAJJAL FAMILY" : "Ruang Kerja Kontributor | DAJJAL FAMILY";
  const description = locale === "en" ? "Manage your DAJJAL FAMILY contributor account and editorial work." : "Kelola akun kontributor dan pekerjaan editorial DAJJAL FAMILY.";
  const url = `https://dajjalfamily.com/${locale}/author/me`;
  const image = "https://dajjalfamily.com/dajjalfamily_icon_192.png";
  return { title, description, robots: { index: false, follow: false }, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "DAJJAL FAMILY", type: "website", images: [{ url: image, alt: "DAJJAL FAMILY" }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function ContributorWorkspacePage({ params }) {
  const { section } = await params;
  if (section !== "author") notFound();
  return <AuthorPortal mode="dashboard" />;
}
