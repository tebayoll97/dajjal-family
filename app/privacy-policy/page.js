import { headers } from "next/headers";
import LegalDocumentPage from "@/app/components/LegalDocumentPage";
import { getLegalDocument } from "@/lib/legalDocuments";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const t = getLegalDocument("privacy-policy", locale);
  const canonical = "https://dajjalfamily.com/" + locale + "/privacy-policy";
  return { title: t.title, description: t.lead, robots: { index: true, follow: true }, alternates: { canonical, languages: { id: "https://dajjalfamily.com/id/privacy-policy", en: "https://dajjalfamily.com/en/privacy-policy", "x-default": "https://dajjalfamily.com/id/privacy-policy" } }, openGraph: { title: t.title, description: t.lead, url: canonical, siteName: "DAJJAL FAMILY", type: "website", locale: locale === "en" ? "en_US" : "id_ID" } };
}

export default async function PrivacyPolicyPage() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  return <LegalDocumentPage documentKey="privacy-policy" locale={locale} />;
}
