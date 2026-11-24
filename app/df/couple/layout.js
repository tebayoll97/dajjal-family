import { headers } from "next/headers";

const ORIGIN = "https://dajjalfamily.com";
const PATH = "/df/couple";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const isEnglish = locale === "en";
  const title = isEnglish
    ? "Dajjal × Veylora — Couple Profile"
    : "Dajjal × Veylora — Profil Couple";
  const description = isEnglish
    ? "Explore the character identities and shared creative universe of Dajjal and Veylora."
    : "Kenali identitas karakter dan universe kreatif bersama Dajjal dan Veylora.";

  return {
    title,
    description,
    alternates: {
      canonical: ORIGIN + "/" + locale + PATH,
      languages: {
        id: ORIGIN + "/id" + PATH,
        en: ORIGIN + "/en" + PATH,
      },
    },
    openGraph: {
      title: title + " | Dajjal Family",
      description,
      url: ORIGIN + "/" + locale + PATH,
      siteName: "Dajjal Family",
      type: "website",
      images: [{ url: "/dajjalfamily_icon_192.png", width: 192, height: 192, alt: "Dajjal Family" }],
    },
    robots: { index: true, follow: true },
  };
}

export default function CoupleProfileLayout({ children }) {
  return children;
}
