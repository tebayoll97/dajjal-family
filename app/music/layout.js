import { headers } from "next/headers";

const ORIGIN = "https://dajjalfamily.com";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const isEnglish = locale === "en";
  const title = isEnglish ? "Music Library" : "Perpustakaan Musik";
  const description = isEnglish
    ? "Discover and listen to music published by Dajjal Family. Explore the public music library, tracks, and favorites."
    : "Temukan dan dengarkan musik pilihan yang diterbitkan Dajjal Family melalui perpustakaan musik publik.";
  const canonical = `${ORIGIN}/${locale}/music`;

  return {
    title,
    description,
    keywords: ["Dajjal Family Music", "DF Music", "music library", "public music", "lagu Dajjal Family"],
    alternates: {
      canonical,
      languages: {
        id: `${ORIGIN}/id/music`,
        en: `${ORIGIN}/en/music`,
      },
    },
    openGraph: {
      title: `${title} | Dajjal Family`,
      description,
      url: canonical,
      siteName: "Dajjal Family",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | Dajjal Family`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function MusicLayout({ children }) {
  return children;
}
