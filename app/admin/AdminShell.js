"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { useTheme } from "@/app/components/ThemeProvider";
import { AdminAuthProvider } from "@/app/components/AdminAuthProvider";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { stripLocalePrefix } from "@/lib/localePath";
import { Badge, Button, ConfirmDialog, PageHeader } from "@/app/components/ui";
import "./admin.css";

const navIconPaths = {
home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/></>,
users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
music: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></>,
image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
cloud: <><path d="M20 16.2A4.5 4.5 0 0 0 18 7.5a6 6 0 0 0-11.6 1.7A4 4 0 0 0 7 17h12"/></>,
palette: <><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.8 1.8 0 0 1 1.3-3.1H18a3 3 0 0 0 3-3c0-4.7-4-8.5-9-8.5Z"/><path d="M7.5 10h.01M10 7.5h.01M14 7.5h.01M16.5 10h.01"/></>
};
function AdminNavIcon({name}) { return <svg className="df-admin-nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{navIconPaths[name] || navIconPaths.file}</svg>; }

const groups = [
  { id: "workspace", idLabel: "Ruang kerja", enLabel: "Workspace", items: [
    { href: "/admin", icon: "home", id: "Ringkasan", en: "Overview" },
  ]},
  { id: "people", idLabel: "Pengguna", enLabel: "People", items: [
    { href: "/admin/players", icon: "users", id: "Manajemen Pengguna", en: "User Management" },
    { href: "/admin/contact-center", icon: "mail", id: "Contact Center", en: "Contact Center" },
  ]},
  { id: "content", idLabel: "Konten", enLabel: "Content", items: [
    { href: "/admin/blog", icon: "file", id: "Pengelolaan Blog", en: "Blog Management" },
    { href: "/admin/music", icon: "music", id: "Music Library", en: "Music Library" },
  ]},
  { id: "couple", idLabel: "Couple", enLabel: "Couple", items: [
    { href: "/admin/manage-couple", icon: "heart", id: "Kelola Couple Profile", en: "Couple Profiles" },
  ]},
  { id: "wedding", idLabel: "Wedding", enLabel: "Wedding", items: [
    { href: "/admin/wedding-gallery", icon: "image", id: "Galeri Pernikahan", en: "Wedding Gallery" },
    { href: "/admin/wedding-event", icon: "calendar", id: "Waktu Acara", en: "Event Schedule" },
    { href: "/admin/wedding-guestbook", icon: "book", id: "Buku Tamu", en: "Guestbook" },
  ]},
  { id: "system", idLabel: "Sistem", enLabel: "System", items: [
    { href: "/admin/storage", icon: "cloud", id: "Central Storage", en: "Central Storage" },
    { href: "/admin/theme", icon: "palette", id: "Theme Manager", en: "Theme Manager" },
  ]},
];

const titles = {
  "/admin": ["Dashboard Admin", "Admin Dashboard"],
  "/admin/players": ["Manajemen Pengguna", "User Management"],
  "/admin/blog": ["Pengelolaan Blog", "Blog Management"],
  "/admin/contact-center": ["Contact Center", "Contact Center"],
  "/admin/music": ["Music Library", "Music Library"],
  "/admin/music/new": ["Tambah Musik", "Add Music"],
  "/admin/manage-couple": ["Kelola Couple Profile", "Manage Couple Profiles"],
  "/admin/wedding-gallery": ["Galeri Pernikahan", "Wedding Gallery"],
  "/admin/wedding-event": ["Pengaturan Acara", "Event Settings"],
  "/admin/wedding-guestbook": ["Buku Tamu", "Guestbook"],
  "/admin/storage": ["Central Storage", "Central Storage"],
  "/admin/theme": ["Theme Manager", "Theme Manager"],
};

function getPageTitle(path, language) {
  if (titles[path]) return titles[path][language === "en" ? 1 : 0];
  if (/^\/admin\/music\/[^/]+\/lyrics/.test(path)) return "Lyrics Studio";
  if (/^\/admin\/music\/[^/]+/.test(path)) return language === "id" ? "Detail Musik" : "Music Details";
  return language === "id" ? "Admin Control Center" : "Admin Control Center";
}

export default function AdminShell({ children }) {
  const pathname = usePathname() || "/admin";
  const path = stripLocalePrefix(pathname);
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme, ready: themeReady } = useTheme();
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mobileDrawerRef = useRef(null);
  const drawerToggleRef = useRef(null);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isLogin = path === "/admin/login";
  const pageTitle = useMemo(() => getPageTitle(path, language), [path, language]);
  const localized = (route) => `/${language === "en" ? "en" : "id"}${route}`;

  useEffect(() => {
    if (!isLogin) document.title = `${pageTitle} | Dajjal Family Admin`;
  }, [isLogin, pageTitle]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const drawer = mobileDrawerRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    document.body.style.overflow = "hidden";
    drawer?.querySelector(".df-admin-nav-home")?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const focusable = Array.from(drawer.querySelectorAll(focusableSelector))
        .filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) {
        event.preventDefault();
        drawer.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      drawerToggleRef.current?.focus();
    };
  }, [drawerOpen]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError("");
    try {
      const { error } = await supabaseAdminClient.auth.signOut();
      if (error) throw error;
      setSignOutConfirmOpen(false);
      router.replace(localized("/admin/login"));
    } catch (error) {
      setLogoutError(error?.message || (language === "id" ? "Gagal keluar dari sesi admin." : "Unable to sign out."));
      setSigningOut(false);
    }
  }

  if (isLogin) return <div className="df-admin-login-frame">{children}</div>;

  return (
    <div id="df-admin-shell" className="df-admin-shell">
      <a className="df-admin-skip" href="#df-admin-main">{language === "id" ? "Lewati navigasi" : "Skip navigation"}</a>
      <aside id="df-admin-desktop-drawer" className="df-admin-sidebar df-shell-drawer df-admin-desktop-drawer" data-open={drawerOpen} aria-label={language === "id" ? "Navigasi admin" : "Admin navigation"}>
        <Link href={localized("/admin")} className="df-admin-brand">
          <span className="df-admin-brand-mark" aria-hidden="true">DF</span>
          <span><strong>DAJJAL FAMILY</strong><small>ADMIN CONTROL CENTER</small></span>
        </Link>
        <div className="df-admin-sidebar-scroll">
          <div className="df-admin-sidebar-scroll">
          <a href="https://dajjalfamily.com" className="df-admin-nav-link df-admin-nav-home"><span className="df-admin-nav-icon"><AdminNavIcon name="home" /></span><span>Home</span></a>
        <div className="df-admin-sidebar-label">{language === "id" ? "MENU UTAMA" : "MAIN MENU"}</div>
        <nav className="df-admin-nav">
          {groups.map((group) => (
            <section className="df-admin-nav-group" key={group.id} aria-label={language === "id" ? group.idLabel : group.enLabel}>
              <h2>{language === "id" ? group.idLabel : group.enLabel}</h2>
              {group.items.map((item) => {
                const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href + "/"));
                return (
                  <Link key={item.href} href={localized(item.href)} onClick={() => setDrawerOpen(false)} className={active ? "df-admin-nav-link is-active" : "df-admin-nav-link"} aria-current={active ? "page" : undefined}>
                    <span className="df-admin-nav-icon"><AdminNavIcon name={item.icon} /></span>
                    <span>{language === "id" ? item.id : item.en}</span>
                    {active && <span className="df-admin-nav-active" aria-hidden="true" />}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>
        </div>
        <div className="df-admin-sidebar-foot">
          <Badge>{language === "id" ? "Area admin terproteksi" : "Protected admin workspace"}</Badge>
          <span>DAJJAL FAMILY · 2026</span>
        </div>
      </aside>

      <aside id="df-admin-mobile-drawer" ref={mobileDrawerRef} tabIndex={-1} className="df-admin-sidebar df-shell-drawer df-admin-mobile-drawer" data-open={drawerOpen} aria-label={language === "id" ? "Navigasi admin" : "Admin navigation"} aria-hidden={!drawerOpen}>
        <Link href={localized("/admin")} className="df-admin-brand" onClick={() => setDrawerOpen(false)}>
          <span className="df-admin-brand-mark" aria-hidden="true">DF</span>
          <span><strong>DAJJAL FAMILY</strong><small>ADMIN CONTROL CENTER</small></span>
        </Link>
        <a href="https://dajjalfamily.com" className="df-admin-nav-link df-admin-nav-home"><span className="df-admin-nav-icon"><AdminNavIcon name="home" /></span><span>Home</span></a>
        <div className="df-admin-sidebar-label">{language === "id" ? "MENU UTAMA" : "MAIN MENU"}</div>
        <nav className="df-admin-nav" aria-label={language === "id" ? "Menu utama admin" : "Admin main menu"}>
          {groups.map((group) => (
            <section className="df-admin-nav-group" key={group.id} aria-label={language === "id" ? group.idLabel : group.enLabel}>
              <h2>{language === "id" ? group.idLabel : group.enLabel}</h2>
              {group.items.map((item) => {
                const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href + "/"));
                return <Link key={item.href} href={localized(item.href)} onClick={() => setDrawerOpen(false)} className={active ? "df-admin-nav-link is-active" : "df-admin-nav-link"} aria-current={active ? "page" : undefined}><span className="df-admin-nav-icon"><AdminNavIcon name={item.icon} /></span><span>{language === "id" ? item.id : item.en}</span>{active && <span className="df-admin-nav-active" aria-hidden="true" />}</Link>;
              })}
            </section>
          ))}
        </nav>
        </div>
        <div className="df-admin-sidebar-foot"><Badge>{language === "id" ? "Area admin terproteksi" : "Protected admin workspace"}</Badge><span>DAJJAL FAMILY · 2026</span></div>
      </aside>

      {drawerOpen && <button type="button" className="df-admin-drawer-backdrop" aria-label={language === "id" ? "Tutup navigasi" : "Close navigation"} onClick={() => setDrawerOpen(false)} />}

      <div className="df-admin-workspace">
        <div role="banner" className="df-admin-topbar">
          <div className="df-admin-topbar-copy">
            <span className="df-admin-overline">DAJJAL FAMILY / ADMIN</span>
            {path !== "/admin" && <p className="df-admin-current-route">{pageTitle}</p>}
          </div>
          <div className="df-admin-topbar-actions">
            <button ref={drawerToggleRef} type="button" className="ui-button ui-button-secondary ui-button-sm df-admin-drawer-toggle" onClick={() => setDrawerOpen((value) => !value)} aria-expanded={drawerOpen} aria-controls="df-admin-mobile-drawer" aria-label={language === "id" ? "Buka navigasi admin" : "Open admin navigation"}>☰</button>
            <Badge variant="info">{language === "id" ? "ADMIN" : "ADMIN AREA"}</Badge>
            <Button variant="secondary" size="sm" onClick={() => setLanguage(language === "id" ? "en" : "id")} aria-label={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}>{language.toUpperCase()}</Button>
            <Button variant="secondary" size="sm" onClick={toggleTheme} disabled={!themeReady} aria-label={language === "id" ? `Ubah ke tema ${theme === "dark" ? "terang" : "gelap"}` : `Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={language === "id" ? "Ubah tema tampilan" : "Change appearance theme"}>{theme === "dark" ? "☀ Light" : "☾ Dark"}</Button>
            <Button variant="danger" size="sm" loading={signingOut} onClick={() => setSignOutConfirmOpen(true)}>{language === "id" ? "Keluar" : "Sign out"}</Button>
          </div>
        </div>

        {path === "/admin" && (
          <section className="df-admin-dashboard-intro" aria-labelledby="df-admin-dashboard-title">
            <span className="df-admin-overline">{language === "id" ? "PUSAT KENDALI" : "CONTROL CENTER"}</span>
            <h1 id="df-admin-dashboard-title">{pageTitle}</h1>
            <p>{language === "id" ? "Kelola ekosistem Dajjal Family dari satu pusat kendali." : "Manage the Dajjal Family ecosystem from one control center."}</p>
          </section>
        )}

        


        {logoutError && <p className="df-admin-global-error" role="alert">{logoutError}</p>}
        <ConfirmDialog
          open={signOutConfirmOpen}
          onClose={() => { if (!signingOut) setSignOutConfirmOpen(false); }}
          onConfirm={signOut}
          title={language === "id" ? "Konfirmasi Keluar" : "Confirm Sign Out"}
          description={language === "id" ? "Apakah kamu yakin ingin keluar dari Admin Dashboard?" : "Are you sure you want to sign out of the Admin Dashboard?"}
          confirmLabel={language === "id" ? "Ya, Keluar" : "Yes, Sign Out"}
          cancelLabel={language === "id" ? "Tidak" : "Cancel"}
          loading={signingOut}
        />
        <div id="df-admin-main" className="df-admin-main"><AdminAuthProvider>{children}</AdminAuthProvider></div>
        <footer className="df-admin-footer"><span>DAJJAL FAMILY ADMIN</span><span>{language === "id" ? "Pusat kendali ekosistem" : "Ecosystem control center"}</span></footer>
      </div>
    </div>
  );
}
