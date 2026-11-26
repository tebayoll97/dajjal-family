import "./globals.css";
import RouteChrome from "./components/RouteChrome";
import GlobalAudioController from "./components/GlobalAudioController";
import { LanguageProvider } from "./components/LanguageProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { getActiveThemePreset } from "@/lib/themeSettings";
import { getThemeTokens } from "@/app/theme/themeTokens";
import { headers } from "next/headers";

const ORIGIN = "https://dajjalfamily.com";
const NO_INDEX_PATHS = [
  "/admin",
  "/profile",
  "/settings",
  "/login",
  "/register",
  "/design-system",
  "/character-test",
];

function isPrivatePath(pathname) {
  return NO_INDEX_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const pathname = requestHeaders.get("x-df-path") || "/";
  const localizedPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return {
    metadataBase: new URL(ORIGIN),
    title: { default: "Dajjal Family — One Family. Many Possibilities.", template: "%s | Dajjal Family" },
    description: "Explore Dajjal Family, a growing digital ecosystem for gaming, knowledge, articles, digital products, business, and community.",
    applicationName: "Dajjal Family",
    icons: {
      icon: [
        { url: "/favicon/favicon.ico", sizes: "any" },
        { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
        { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: ["/favicon/favicon.ico"],
      apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/favicon/site.webmanifest",
    keywords: ["Dajjal Family", "digital ecosystem", "online games", "digital products", "knowledge and learning", "digital community"],
    ...(isPrivatePath(pathname) ? { robots: { index: false, follow: false } } : {}),
    // Canonical is safe to derive for every localized route. hreflang is page-specific:
    // only pages with verified published translations may declare language alternates.
    alternates: {
      canonical: `${ORIGIN}${localizedPath}`,
    },
  };
}

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get("x-df-locale");
  const initialLanguage = requestedLocale === "en" ? "en" : "id";
  const { preset: initialThemePreset } = await getActiveThemePreset();
  const themeBootstrap = `(() => { try { const saved = localStorage.getItem("dajjal-family-theme"); const mode = saved === "dark" || saved === "light" ? saved : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"); const preset = ${JSON.stringify(initialThemePreset)}; const maps = ${JSON.stringify({ dark: getThemeTokens(initialThemePreset, "dark"), light: getThemeTokens(initialThemePreset, "light") })}; const root = document.documentElement; const browserThemeColor = maps[mode]["--df-bg"]; const themeColorMeta = document.querySelector('meta[name="theme-color"]'); if (themeColorMeta && browserThemeColor) themeColorMeta.setAttribute("content", browserThemeColor); root.dataset.theme = mode; root.dataset.themeMode = saved === "dark" || saved === "light" ? saved : "system"; root.dataset.themePreset = preset; root.style.colorScheme = mode; Object.entries(maps[mode]).forEach(([key, value]) => root.style.setProperty(key, value)); } catch (_) {} })();`;

  return (
    <html lang={initialLanguage}>
      <head><meta name="theme-color" content={getThemeTokens(initialThemePreset, "dark")["--df-bg"]} /><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider initialPalette={initialThemePreset}>
          <LanguageProvider initialLanguage={initialLanguage}>
            <GlobalAudioController />
            <RouteChrome>{children}</RouteChrome>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
