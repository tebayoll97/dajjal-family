"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";
import ThemeToggle from "./ThemeToggle";

const copy = {
  en: {
    navigation: "Navigation",
    main: "MAIN MENU",
    tools: "TOOLS",
    home: "Home",
    games: "Games",
    universe: "Family Universe",
    profile: "Profile",
    admin: "Admin",
    settings: "Settings",
    wedding: "Wedding",
    language: "Language",
    open: "Open navigation",
    close: "Close navigation",
  },
  id: {
    navigation: "Navigasi",
    main: "MENU UTAMA",
    tools: "ALAT",
    home: "Beranda",
    games: "Game",
    universe: "Universe Keluarga",
    profile: "Profil",
    admin: "Admin",
    settings: "Pengaturan",
    wedding: "Wedding",
    language: "Bahasa",
    open: "Buka navigasi",
    close: "Tutup navigasi",
  },
};

export default function Header() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.id;
  const [isAdmin, setIsAdmin] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function checkAdmin(session) {
      if (!session?.access_token) {
        if (active) setIsAdmin(false);
        return;
      }
      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json();
        if (active) setIsAdmin(response.ok && result.success === true);
      } catch (error) {
        console.error("Admin check failed:", error);
        if (active) setIsAdmin(false);
      }
    }
    async function initialize() {
      const { data: { session } } = await supabaseAdminClient.auth.getSession();
      await checkAdmin(session);
    }
    initialize();
    const { data: { subscription } } = supabaseAdminClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        return;
      }
      if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) checkAdmin(session);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!navigationOpen) return undefined;
    function handlePointer(event) {
      if (!navigationRef.current?.contains(event.target)) setNavigationOpen(false);
    }
    function handleKey(event) {
      if (event.key === "Escape") setNavigationOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [navigationOpen]);

  function isActive(route) {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  }

  const mainLinks = [
    { label: t.home, route: "/" },
    { label: t.games, route: "/games" },
    { label: t.universe, route: "/df" },
    { label: t.profile, route: "/profile" },
    ...(isAdmin ? [{ label: t.admin, route: "/admin" }] : []),
  ];
  const toolLinks = [
    { label: t.settings, route: "/settings" },
    { label: t.wedding, route: "/df/wedding" },
  ];

  return (
    <header className="df-site-header">
      <div className="df-site-header-inner">
        <div className="df-site-brand-group" ref={navigationRef}>
          <button
            type="button"
            className="df-site-nav-toggle"
            aria-label={navigationOpen ? t.close : t.open}
            aria-expanded={navigationOpen}
            aria-controls="df-global-navigation"
            onClick={() => setNavigationOpen((open) => !open)}
          >
            <span aria-hidden="true">{navigationOpen ? "×" : "☰"}</span>
          </button>
          <Link href={withLocalePrefix("/", language)} className="df-site-brand" aria-label="Dajjal Family home">
            <span className="df-site-brand-mark" aria-hidden="true">DF</span>
            <span className="df-site-brand-copy">
              <strong>DAJJAL FAMILY</strong>
              <small>ONE FAMILY. MANY POSSIBILITIES.</small>
            </span>
          </Link>

          {navigationOpen && (
            <nav id="df-global-navigation" className="df-site-navigation-pane" aria-label={t.navigation}>
              <p className="df-site-navigation-heading">{t.main}</p>
              <div className="df-site-navigation-links">
                {mainLinks.map((item) => (
                  <Link
                    key={item.route}
                    href={withLocalePrefix(item.route, language)}
                    aria-current={isActive(item.route) ? "page" : undefined}
                    onClick={() => setNavigationOpen(false)}
                  >
                    <span>{item.label}</span>
                    {isActive(item.route) && <span className="df-site-navigation-active" aria-hidden="true">●</span>}
                  </Link>
                ))}
              </div>
              <p className="df-site-navigation-heading df-site-navigation-tools">{t.tools}</p>
              <div className="df-site-navigation-links">
                {toolLinks.map((item) => (
                  <Link
                    key={item.route}
                    href={withLocalePrefix(item.route, language)}
                    aria-current={isActive(item.route) ? "page" : undefined}
                    onClick={() => setNavigationOpen(false)}
                  >
                    <span>{item.label}</span>
                    {isActive(item.route) && <span className="df-site-navigation-active" aria-hidden="true">●</span>}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>

        <div className="df-site-actions">
          <ThemeToggle />
          <div className="df-site-language" role="group" aria-label={t.language}>
            <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"}>ID</button>
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
        </div>
      </div>
      <nav className="df-mobile-quick-nav" aria-label={language === "id" ? "Navigasi utama" : "Primary navigation"}>
        {[
          { label: t.home, route: "/" },
          { label: t.games, route: "/games" },
          { label: t.profile, route: "/profile" },
        ].map((item) => (
          <Link key={item.route} href={withLocalePrefix(item.route, language)} aria-current={isActive(item.route) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
