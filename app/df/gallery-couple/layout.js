import { headers } from "next/headers";

const ORIGIN = "https://dajjalfamily.com";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const path = `/${locale}/df/gallery-couple`;
  const title = locale === "en" ? "Couple Gallery" : "Galeri Couple";
  const description = locale === "en"
    ? "Explore published Couple Profiles and stories from Dajjal Family."
    : "Jelajahi Couple Profile yang dipublikasikan dan cerita pasangan dari Dajjal Family.";

  return {
    title,
    description,
    alternates: {
      canonical: ORIGIN + path,
      languages: {
        id: ORIGIN + "/id/df/gallery-couple",
        en: ORIGIN + "/en/df/gallery-couple",
      },
    },
    openGraph: { title: `${title} | Dajjal Family`, description, url: ORIGIN + path, siteName: "Dajjal Family", type: "website" },
  };
}

export default function CoupleGalleryLayout({ children }) {
  return children;
}
