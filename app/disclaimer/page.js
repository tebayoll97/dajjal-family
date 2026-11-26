import { headers } from "next/headers";
import LegalDocumentPage from "@/app/components/LegalDocumentPage";
import { getLegalDocument } from "@/lib/legalDocuments";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const t = getLegalDocument("disclaimer", locale);
  const canonical = "https://dajjalfamily.com/" + locale + "/disclaimer";
  return { title: t.title, description: t.lead, robots: { index: true, follow: true }, alternates: { canonical, languages: { id: "https://dajjalfamily.com/id/disclaimer", en: "https://dajjalfamily.com/en/disclaimer", "x-default": "https://dajjalfamily.com/id/disclaimer" } }, openGraph: { title: t.title, description: t.lead, url: canonical, siteName: "DAJJAL FAMILY", type: "website", locale: locale === "en" ? "en_US" : "id_ID" } };
}

export default async function DisclaimerPage() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  return <LegalDocumentPage documentKey="disclaimer" locale={locale} />;
}
