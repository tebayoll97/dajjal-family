import CreatorLabClient from "./CreatorLabClient";
import { headers } from "next/headers";

const origin = "https://dajjalfamily.com";
const fallbackImage = "/dajjalfamily_icon_192.png";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const title = "Gaming Identity Creator";
  const description = language === "en" ? "Create gaming identity artwork with editable layers, local projects, and high-resolution PNG export. No AI required." : "Buat artwork identitas gaming dengan layer yang bisa diedit, proyek lokal, dan ekspor PNG resolusi tinggi. Tanpa AI.";
  const path = "/" + language + "/df/creator-lab";
  return {
    title, description,
    alternates: { canonical: origin + path, languages: { id: origin + "/id/df/creator-lab", en: origin + "/en/df/creator-lab" } },
    openGraph: { type: "website", siteName: "DAJJAL FAMILY", title: title + " | DAJJAL FAMILY", description, url: origin + path, images: [{ url: fallbackImage, width: 192, height: 192, alt: "DAJJAL FAMILY" }], locale: language === "en" ? "en_US" : "id_ID" },
    twitter: { card: "summary", title: title + " | DAJJAL FAMILY", description, images: [fallbackImage] },
  };
}

export default function CreatorLabPage() { return <CreatorLabClient />; }
