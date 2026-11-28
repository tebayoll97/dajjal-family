import { redirectLocalizedRoute } from "@/lib/redirectLocalizedRoute";

export default function LegacyRoute({ searchParams }) {
  return redirectLocalizedRoute("/tools/background-remover", searchParams);
}
