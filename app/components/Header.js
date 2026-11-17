"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";
import ThemeToggle from "./ThemeToggle";

const copy = {
  en: {
    navigation: "Navigation",
    main: "MAIN MENU",
    home: "Home",
    games: "Gaming",
    blog: "Blog",
    products: "Digital Products",
    universe: "Dajjal Family",
    profile: "Profile",
    admin: "Admin",
    language: "Language",
    open: "Open navigation",
    close: "Close navigation",
  },
  id: {
    navigation: "Navigasi",
    main: "MENU UTAMA",
    home: "Beranda",
    games: "Gaming",
    blog: "Blog",
    products: "Produk Digital",
    universe: "Dajjal Family",
    profile: "Profil",
    admin: "Admin",
    language: "Bahasa",
    open: "Buka navigasi",
    close: "Tutup navigasi",
  },
};

function NavigationIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false",
  };

  const paths = {
    profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.3 3.1-5 7-5s6.3 1.7 7 5" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    games: <><path d="M6 8h12a4 4 0 0 1 3.8 5l-1 3.2a2.5 2.5 0 0 1-4.1 1.1L14 15h-4l-2.7 2.3a2.5 2.5 0 0 1-4.1-1.1l-1-3.2A4 4 0 0 1 6 8Z" /><path d="M7 11v4M5 13h4M16.5 12h.01M19 14h.01" /></>,
    blog: <><path d="M5 3h10l4 4v14H5z" /><path d="M14 3v5h5M8 12h8M8 16h8" /></>,
    products: <><path d="M4 8h16l-1.5 12h-13z" /><path d="M9 8a3 3 0 0 1 6 0" /><path d="M9 12v2M15 12v2" /></>,
    universe: <><circle cx="12" cy="12" r="9" /><path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export default function Header() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.id;
  const isWeddingInvitation = pathname.startsWith("/df/wedding-anak-dajjal");
  const [isAdmin, setIsAdmin] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const navigationRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event) {
      if (event.key === "Escape") setNavigationOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      triggerRef.current?.focus();
    };
  }, [navigationOpen]);

  useEffect(() => {
    setNavigationOpen(false);
  }, [pathname]);

  function isActive(route) {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  }

  const primaryLinks = [
    { label: t.home, route: "/", icon: "home" },
    { label: t.games, route: "/games", icon: "games" },
    { label: t.blog, route: "/blog", icon: "blog" },
    { label: t.products, route: "/digital-products", icon: "products" },
    { label: t.universe, route: "/df", icon: "universe" },
  ];

  return (
    <>
    <header className={"df-site-header" + (isWeddingInvitation ? " df-site-header--wedding" : "")}>
      <div className="df-site-header-inner">
        <div className="df-site-brand-group">
          {!isWeddingInvitation && (
            <button
              type="button"
              className="df-site-nav-toggle"
              aria-label={t.open}
              aria-expanded={navigationOpen}
              aria-controls="df-global-navigation"
              ref={triggerRef}
              onClick={() => setNavigationOpen(true)}
            >
              <span aria-hidden="true">☰</span>
            </button>
          )}
          {!isWeddingInvitation && (
            <Link href={withLocalePrefix("/", language)} className="df-site-brand" aria-label="Dajjal Family home">
              <span className="df-site-brand-mark" aria-hidden="true">DF</span>
              <span className="df-site-brand-copy">
                <strong>DAJJAL FAMILY</strong>
                <small>ONE FAMILY. MANY POSSIBILITIES.</small>
              </span>
            </Link>
          )}
        </div>

        <div className="df-site-actions">
          {!isWeddingInvitation && <ThemeToggle />}
          <div className="df-site-language" role="group" aria-label={t.language}>
            <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"}>ID</button>
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
        </div>
      </div>

    </header>

    {!isWeddingInvitation && navigationOpen && portalReady && createPortal(
      <div className="df-mobile-navigation-layer">
        <button
          type="button"
          className="df-mobile-navigation-backdrop"
          aria-label={language === "id" ? "Tutup navigasi" : "Close navigation"}
          onClick={() => setNavigationOpen(false)}
        />
        <nav
          ref={navigationRef}
          id="df-global-navigation"
          className="df-site-navigation-pane"
          aria-label={t.navigation}
          aria-modal="true"
          role="dialog"
        >
          <div className="df-site-navigation-top">
            <span className="df-site-navigation-brand">DAJJAL FAMILY</span>
            <button type="button" className="df-site-navigation-close" aria-label={t.close} onClick={() => setNavigationOpen(false)}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="df-site-navigation-content">
            <div className="df-site-navigation-profile">
              <Link href={withLocalePrefix("/profile", language)} aria-current={isActive("/profile") ? "page" : undefined} onClick={() => setNavigationOpen(false)}>
                <NavigationIcon name="profile" /><span>{t.profile}</span>
              </Link>
            </div>
            <p className="df-site-navigation-heading">{t.main}</p>
            <div className="df-site-navigation-links">
              {primaryLinks.map((item) => (
                <Link key={item.route} href={withLocalePrefix(item.route, language)} aria-current={isActive(item.route) ? "page" : undefined} onClick={() => setNavigationOpen(false)}>
                  <NavigationIcon name={item.icon} />
                  <span className="df-site-navigation-link-label">{item.label}</span>
                  {isActive(item.route) && <span className="df-site-navigation-active" aria-hidden="true">●</span>}
                </Link>
              ))}
              {isAdmin && (
                <Link href={withLocalePrefix("/admin", language)} aria-current={isActive("/admin") ? "page" : undefined} onClick={() => setNavigationOpen(false)}>
                  <NavigationIcon name="profile" />
                  <span className="df-site-navigation-link-label">{t.admin}</span>
                  {isActive("/admin") && <span className="df-site-navigation-active" aria-hidden="true">●</span>}
                </Link>
              )}
            </div>
          </div>
          <div className="df-site-navigation-footer">
            <span>ONE FAMILY. MANY POSSIBILITIES.</span>
            <small>DAJJALFAMILY.COM</small>
          </div>
        </nav>
      </div>,
      document.body
    )}
    </>
  );
}
