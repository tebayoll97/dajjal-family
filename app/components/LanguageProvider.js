"use client";

import { createContext, useContext } from "react";

const LanguageContext = createContext(null);
const LOCALE_COOKIE = "df-locale";

export function LanguageProvider({ children, initialLanguage = "id" }) {
  const language = initialLanguage === "en" ? "en" : "id";

  async function setLanguage(nextLanguage) {
    if (nextLanguage !== "en" && nextLanguage !== "id") return;
    if (nextLanguage === language) return;

    const currentPath = window.location.pathname || "/";
    const segments = currentPath.split("/");
    const currentLocale = segments[1] === "id" || segments[1] === "en" ? segments[1] : null;
    const pathWithoutLocale = currentLocale ? "/" + segments.slice(2).join("/") : currentPath;
    let destinationPath = pathWithoutLocale === "/" ? `/${nextLanguage}` : `/${nextLanguage}${pathWithoutLocale}`;

    // Article slugs are language-specific. Resolve the matching translation before switching locale.
    const blogSegments = pathWithoutLocale.split("/").filter(Boolean);
    if (
      blogSegments.length === 2 &&
      blogSegments[0] === "blog" &&
      blogSegments[1] &&
      blogSegments[1] !== "author" &&
      currentLocale
    ) {
      try {
        const params = new URLSearchParams({ slug: blogSegments[1], from: currentLocale, to: nextLanguage });
        const response = await fetch(`/api/blog/locale-alternate?${params.toString()}`, { cache: "no-store" });
        const result = await response.json();
        if (response.ok && result?.slug) {
          destinationPath = `/${nextLanguage}/blog/${result.slug}`;
        } else {
          // If a translation is unavailable, keep the user in the corresponding Blog index.
          destinationPath = `/${nextLanguage}/blog`;
        }
      } catch {
        destinationPath = `/${nextLanguage}/blog`;
      }
    }

    document.cookie = `${LOCALE_COOKIE}=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    window.location.assign(`${destinationPath}${window.location.search}${window.location.hash}`);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, ready: true }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
