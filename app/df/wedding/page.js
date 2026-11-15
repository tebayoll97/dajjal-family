import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RetiredWeddingBuilderPage() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  redirect(`/${locale}/df/wedding-anak-dajjal`);
}
