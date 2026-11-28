import { headers } from "next/headers";
import BackgroundRemoverClient from "./BackgroundRemoverClient";

const origin = "https://dajjalfamily.com";
const fallbackImage = "/dajjalfamily_icon_192.png";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const title = language === "en" ? "Background Remover — Agent Dajjal" : "Hapus Background — Agent Dajjal";
  const description = language === "en"
    ? "Remove a person's image background locally in your browser. Your photo is never uploaded."
    : "Hapus latar foto seseorang langsung di browser. Foto tidak pernah diunggah ke server.";
  const path = `/${language}/df/agent-dajjal/tools/background-remover`;
  return {
    title: `${title} | DAJJAL FAMILY`,
    description,
    alternates: { canonical: origin + path, languages: { id: origin + "/id/df/agent-dajjal/tools/background-remover", en: origin + "/en/df/agent-dajjal/tools/background-remover" } },
    openGraph: { type: "website", siteName: "DAJJAL FAMILY", title, description, url: origin + path, images: [{ url: fallbackImage, width: 192, height: 192, alt: "DAJJAL FAMILY" }], locale: language === "en" ? "en_US" : "id_ID" },
    twitter: { card: "summary", title, description, images: [fallbackImage] },
  };
}

export default function BackgroundRemoverPage() { return <BackgroundRemoverClient />; }
