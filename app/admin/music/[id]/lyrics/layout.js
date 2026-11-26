import { headers } from "next/headers";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const title = language === "id" ? "Lyrics Studio | Admin Musik — Dajjal Family" : "Lyrics Studio | Music Admin — Dajjal Family";
  const description = language === "id"
    ? "Editor internal untuk mengatur baris lirik dan timestamp audio Dajjal Family."
    : "Internal editor for managing Dajjal Family lyric lines and audio timestamps.";

  return {
    title,
    description,
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default function LyricsStudioLayout({ children }) {
  return children;
}
