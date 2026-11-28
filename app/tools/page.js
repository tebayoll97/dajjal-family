import { headers } from "next/headers";
import AgentDajjalToolsClient from "@/app/df/agent-dajjal/tools/AgentDajjalToolsClient";

const origin = "https://dajjalfamily.com";
const fallbackImage = "/dajjalfamily_icon_192.png";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const title = language === "en" ? "Agent Dajjal Tools" : "Tools Agent Dajjal";
  const description = language === "en"
    ? "On-device tools that process your files locally."
    : "Kumpulan tools yang memproses file langsung di perangkatmu.";
  const path = `/${language}/tools`;

  return {
    title: `${title} | DAJJAL FAMILY`,
    description,
    alternates: {
      canonical: origin + path,
      languages: {
        id: origin + "/id/tools",
        en: origin + "/en/tools",
      },
    },
    openGraph: {
      type: "website",
      siteName: "DAJJAL FAMILY",
      title,
      description,
      url: origin + path,
      images: [{ url: fallbackImage, width: 192, height: 192, alt: "DAJJAL FAMILY" }],
      locale: language === "en" ? "en_US" : "id_ID",
    },
    twitter: { card: "summary", title, description, images: [fallbackImage] },
  };
}

export default function ToolsPage() {
  return <AgentDajjalToolsClient />;
}
