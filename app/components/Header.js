"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";
import ThemeToggle from "./ThemeToggle";
import NavigationProfileCard from "./NavigationProfileCard";

const ADMIN_CACHE_PREFIX = "df_admin_profile_cache_v1:";

function readAdminCache(userId) {
  try {
    const value = JSON.parse(window.localStorage.getItem(ADMIN_CACHE_PREFIX + userId) || "null");
    return value?.userId === userId ? value : null;
  } catch { return null; }
}

function writeAdminCache(userId) {
  try { window.localStorage.setItem(ADMIN_CACHE_PREFIX + userId, JSON.stringify({ userId, label: "Admin", updatedAt: Date.now() })); } catch {}
}

function clearAdminCache(userId) {
  try { if (userId) window.localStorage.removeItem(ADMIN_CACHE_PREFIX + userId); } catch {}
}

const copy = {
  en: {
    navigation: "Navigation",
    main: "MAIN MENU",
    home: "Home",
    games: "Gaming",
    blog: "Blog",
    products: "Digital Products",
    profile: "Profile",
    admin: "Admin",
    knowledge: "Knowledge",
    tools: "Tools",
    settings: "Settings",
    business: "Business",
    community: "Community",
    digitalProducts: "Digital Products",
    universe: "Family Universe",
    gameLibrary: "Game Library",
    mamahNgamuk: "Mamah Ngamuk",
    runJump: "Run & Jump",
    adminUsers: "User Management",
    weddingGallery: "Wedding Gallery",
    weddingEvent: "Wedding Event Time",
    guestbook: "Guestbook Messages",
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
    profile: "Profil",
    admin: "Admin",
    knowledge: "Pengetahuan",
    tools: "Alat",
    settings: "Pengaturan",
    business: "Bisnis",
    community: "Komunitas",
    digitalProducts: "Produk Digital",
    universe: "Universe Keluarga",
    gameLibrary: "Perpustakaan Game",
    mamahNgamuk: "Mamah Ngamuk",
    runJump: "Lari & Lompat",
    adminUsers: "Manajemen Pengguna",
    weddingGallery: "Galeri Pernikahan",
    weddingEvent: "Waktu Acara Undangan",
    guestbook: "Pesan Guestbook",
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
  const adminUserIdRef = useRef(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const navigationHistoryRef = useRef(false);
  const [portalReady, setPortalReady] = useState(false);
  const navigationRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    async function checkAdmin(session) {
      const userId = session?.user?.id || null;
      if (adminUserIdRef.current && adminUserIdRef.current !== userId) clearAdminCache(adminUserIdRef.current);
      adminUserIdRef.current = userId;
      if (!session?.access_token || !userId) {
        clearAdminCache(userId);
        if (active) setIsAdmin(false);
        return;
      }
      if (active && readAdminCache(userId)) setIsAdmin(true);
      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json();
        const authorized = response.ok && result.success === true;
        if (authorized) writeAdminCache(userId);
        else clearAdminCache(userId);
        if (active) setIsAdmin(authorized);
      } catch (error) {
        console.error("Admin check failed:", error);
        clearAdminCache(userId);
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
        clearAdminCache(adminUserIdRef.current);
        adminUserIdRef.current = null;
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
    window.history.pushState({ ...(window.history.state || {}), dfNavigationOpen: true }, "");
    navigationHistoryRef.current = true;
    function handleKey(event) {
      if (event.key === "Escape") {
        setNavigationOpen(false);
        if (navigationHistoryRef.current) {
          navigationHistoryRef.current = false;
          window.history.back();
        }
      }
    }
    function handlePopState() {
      if (navigationHistoryRef.current) {
        navigationHistoryRef.current = false;
        setNavigationOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("popstate", handlePopState);
      triggerRef.current?.focus();
    };
  }, [navigationOpen]);

  function closeNavigation() {
    setNavigationOpen(false);
    if (navigationHistoryRef.current) {
      navigationHistoryRef.current = false;
      window.history.back();
    }
  }

  function navigateFromDrawer() {
    if (navigationHistoryRef.current) {
      navigationHistoryRef.current = false;
      window.history.replaceState(
        Object.fromEntries(Object.entries(window.history.state || {}).filter(([key]) => key !== "dfNavigationOpen")),
        "",
        window.location.href
      );
    }
    setNavigationOpen(false);
  }

  useEffect(() => {
    setNavigationOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  function isActive(route) {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  }

  const navigationGroups = [
    { id: "gaming", label: t.games, icon: "games", items: [
      { label: t.gameLibrary, route: "/games", icon: "games" },
      { label: t.mamahNgamuk, route: "/games/mamah-ngamuk", icon: "games" },
      { label: t.runJump, route: "/games/run-jump", icon: "games" },
    ]},
    { id: "knowledge", label: t.knowledge, icon: "blog", items: [
      { label: t.knowledge, route: "/knowledge", icon: "blog" },
    ]},
    { id: "blog", label: t.blog, icon: "blog", items: [
      { label: t.blog, route: "/blog", icon: "blog" },
    ]},
    { id: "tools", label: t.tools, icon: "products", items: [
      { label: t.digitalProducts, route: "/digital-products", icon: "products" },
      { label: t.business, route: "/business", icon: "universe" },
      { label: t.community, route: "/community", icon: "universe" },
      { label: t.settings, route: "/settings", icon: "profile" },
    ]},
    { id: "universe", label: t.universe, icon: "universe", items: [
      { label: t.universe, route: "/df", icon: "universe" },
    ]},
  ];
  const activeGroupId = navigationGroups.find((group) => group.items.some((item) => isActive(item.route)))?.id || null;
  const adminItems = [
    { label: t.admin, route: "/admin", icon: "profile" },
    { label: t.adminUsers, route: "/admin/players", icon: "profile" },
    { label: t.weddingGallery, route: "/admin/wedding-gallery", icon: "universe" },
    { label: t.weddingEvent, route: "/admin/wedding-event", icon: "universe" },
    { label: t.guestbook, route: "/admin/wedding-guestbook", icon: "blog" },
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
              <Image className="df-site-brand-mark" src="/dajjalfamily_icon_192.png" alt="" width={42} height={42} priority />
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
          onClick={closeNavigation}
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
            <div className="df-site-navigation-brand-group"><Image src="/dajjalfamily_icon_192.png" alt="" width={34} height={34} /><span className="df-site-navigation-brand">DAJJAL FAMILY</span></div>
            <button type="button" className="df-site-navigation-close" aria-label={t.close} onClick={closeNavigation}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="df-site-navigation-content">
            <NavigationProfileCard onNavigate={navigateFromDrawer} />
            <p className="df-site-navigation-heading">{t.main}</p>
            <div className="df-site-navigation-groups">
              <Link className="df-site-navigation-group-trigger df-site-navigation-home" href={withLocalePrefix("/", language)} aria-current={isActive("/") ? "page" : undefined} onClick={navigateFromDrawer}>
                <NavigationIcon name="home" />
                <span>{t.home}</span>
              </Link>
              {navigationGroups.map((group) => {
                const expanded = (openGroup === null ? activeGroupId === group.id : openGroup === group.id);
                const groupId = `df-navigation-group-${group.id}`;
                return (
                  <section className="df-site-navigation-group" key={group.id}>
                    <button type="button" className="df-site-navigation-group-trigger" aria-expanded={expanded} aria-controls={groupId}
                      onClick={() => setOpenGroup((current) => current === group.id ? null : group.id)}>
                      <NavigationIcon name={group.icon} />
                      <span>{group.label}</span>
                      <svg className={`df-site-navigation-chevron${expanded ? " is-expanded" : ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                    <div id={groupId} className="df-site-navigation-submenu" data-expanded={expanded} aria-hidden={!expanded} inert={!expanded}>
                      {group.items.map((item) => (
                        <Link key={item.route} href={withLocalePrefix(item.route, language)} aria-current={isActive(item.route) ? "page" : undefined} onClick={navigateFromDrawer}>
                          <span>{item.label}</span>
                          {isActive(item.route) && <span className="df-site-navigation-active" aria-hidden="true">●</span>}
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}
              {isAdmin && <section className="df-site-navigation-group">
                <button type="button" className="df-site-navigation-group-trigger" aria-expanded={(openGroup === null ? adminItems.some((item) => isActive(item.route)) : openGroup === "admin")} aria-controls="df-navigation-group-admin"
                  onClick={() => setOpenGroup((current) => current === "admin" ? null : "admin")}>
                  <NavigationIcon name="profile" /><span>{t.admin}</span><svg className={`df-site-navigation-chevron${(openGroup === null ? adminItems.some((item) => isActive(item.route)) : openGroup === "admin") ? " is-expanded" : ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                <div id="df-navigation-group-admin" className="df-site-navigation-submenu" data-expanded={openGroup === null ? adminItems.some((item) => isActive(item.route)) : openGroup === "admin"} aria-hidden={!(openGroup === null ? adminItems.some((item) => isActive(item.route)) : openGroup === "admin")} inert={!(openGroup === null ? adminItems.some((item) => isActive(item.route)) : openGroup === "admin")}>
                  {adminItems.map((item) => <Link key={item.route} href={withLocalePrefix(item.route, language)} aria-current={isActive(item.route) ? "page" : undefined} onClick={navigateFromDrawer}><span>{item.label}</span>{isActive(item.route) && <span className="df-site-navigation-active" aria-hidden="true">●</span>}</Link>)}
                </div>
              </section>}
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
