import { headers } from "next/headers";

export async function generateMetadata() {
  const locale = (await headers()).get("x-df-locale") === "en" ? "en" : "id";
  const title = "Pixel Bio Generator — Darkwar Survival";
  const description = locale === "en"
    ? "Create Darkwar Survival pixel bio codes from images, text, or Intelligence Mode with on-device processing."
    : "Buat kode bio pixel Darkwar Survival dari gambar, teks, atau Intelligence Mode dengan pemrosesan lokal.";
  return {
  title,
  description,
  alternates: {
    languages: {
      id: "https://dajjalfamily.com/id/df/tools-dw/generator-pixel",
      en: "https://dajjalfamily.com/en/df/tools-dw/generator-pixel",
    },
  },
  openGraph: {
    type: "website",
    siteName: "DAJJAL FAMILY",
    title,
    description,
    images: [{ url: "https://dajjalfamily.com/dajjalfamily_icon_192.png", width: 192, height: 192, alt: "DAJJAL FAMILY" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["https://dajjalfamily.com/dajjalfamily_icon_192.png"],
  },
  };
}

export default function DarkwarToolsLayout({ children }) {
  return children;
}
