import { headers } from "next/headers";
import AuthorPortal from "@/app/components/blog/AuthorPortal";

export async function generateMetadata() {
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const title = locale === "en" ? "Become a Contributor | DAJJAL FAMILY" : "Daftar Kontributor | DAJJAL FAMILY";
  const description = locale === "en" ? "Apply to become an approved writer for DAJJAL FAMILY Blog." : "Daftarkan diri untuk menjadi penulis resmi Blog DAJJAL FAMILY.";
  const url = `https://dajjalfamily.com/${locale}/contributors`;
  const image = "https://dajjalfamily.com/dajjalfamily_icon_192.png";
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: false, follow: false },
    openGraph: { title, description, url, siteName: "DAJJAL FAMILY", type: "website", images: [{ url: image, alt: "DAJJAL FAMILY" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function ContributorsPage() {
  return <AuthorPortal mode="apply" />;
}
