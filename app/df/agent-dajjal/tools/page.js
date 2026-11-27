import { headers } from "next/headers";
import AgentDajjalToolsClient from "./AgentDajjalToolsClient";

const origin = "https://dajjalfamily.com";
const fallbackImage = "/dajjalfamily_icon_192.png";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const title = language === "en" ? "Agent Dajjal Tools" : "Tools Agent Dajjal";
  const description = language === "en" ? "On-device tools that process your files locally." : "Tools yang memproses file langsung di perangkatmu.";
  const path = `/${language}/df/agent-dajjal/tools`;
  return {
    title: `${title} | DAJJAL FAMILY`, description,
    alternates: { canonical: origin + path, languages: { id: origin + "/id/df/agent-dajjal/tools", en: origin + "/en/df/agent-dajjal/tools" } },
    openGraph: { type: "website", siteName: "DAJJAL FAMILY", title, description, url: origin + path, images: [{ url: fallbackImage, width: 192, height: 192, alt: "DAJJAL FAMILY" }], locale: language === "en" ? "en_US" : "id_ID" },
    twitter: { card: "summary", title, description, images: [fallbackImage] },
  };
}

export default function AgentDajjalToolsPage() { return <AgentDajjalToolsClient />; }
