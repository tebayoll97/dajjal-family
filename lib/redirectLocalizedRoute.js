import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function redirectLocalizedRoute(path, searchParams) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const resolvedParams = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedParams || {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
    } else if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }

  const suffix = query.size ? `?${query.toString()}` : "";
  redirect(`/${locale}${path}${suffix}`);
}
