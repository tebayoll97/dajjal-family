"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { useTheme } from "@/app/components/ThemeProvider";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { stripLocalePrefix } from "@/lib/localePath";
import { Badge, Button, ConfirmDialog, PageHeader } from "@/app/components/ui";
import "./admin.css";

const groups = [
  { id: "workspace", idLabel: "Ruang kerja", enLabel: "Workspace", items: [
    { href: "/admin", icon: "⌂", id: "Ringkasan", en: "Overview" },
  ]},
  { id: "people", idLabel: "Pengguna", enLabel: "People", items: [
    { href: "/admin/players", icon: "♙", id: "Manajemen Pengguna", en: "User Management" },
    { href: "/admin/contact-center", icon: "✉", id: "Contact Center", en: "Contact Center" },
  ]},
  { id: "content", idLabel: "Konten", enLabel: "Content", items: [
    { href: "/admin/music", icon: "♫", id: "Music Library", en: "Music Library" },
  ]},
  { id: "couple", idLabel: "Couple", enLabel: "Couple", items: [
    { href: "/admin/manage-couple", icon: "♡", id: "Kelola Couple Profile", en: "Couple Profiles" },
  ]},
  { id: "wedding", idLabel: "Wedding", enLabel: "Wedding", items: [
    { href: "/admin/wedding-gallery", icon: "▧", id: "Galeri Pernikahan", en: "Wedding Gallery" },
    { href: "/admin/wedding-event", icon: "◷", id: "Waktu Acara", en: "Event Schedule" },
    { href: "/admin/wedding-guestbook", icon: "▤", id: "Buku Tamu", en: "Guestbook" },
  ]},
  { id: "system", idLabel: "Sistem", enLabel: "System", items: [
    { href: "/admin/storage", icon: "☁", id: "Central Storage", en: "Central Storage" },
    { href: "/admin/theme", icon: "◐", id: "Theme Manager", en: "Theme Manager" },
  ]},
];

const titles = {
  "/admin": ["Dashboard Admin", "Admin Dashboard"],
  "/admin/players": ["Manajemen Pengguna", "User Management"],
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
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isLogin = path === "/admin/login";
  const pageTitle = useMemo(() => getPageTitle(path, language), [path, language]);
  const localized = (route) => `/${language === "en" ? "en" : "id"}${route}`;

  useEffect(() => {
    if (!isLogin) document.title = `${pageTitle} | Dajjal Family Admin`;
  }, [isLogin, pageTitle]);

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
      <aside className="df-admin-sidebar" aria-label={language === "id" ? "Navigasi admin" : "Admin navigation"}>
        <Link href={localized("/admin")} className="df-admin-brand">
          <span className="df-admin-brand-mark" aria-hidden="true">DF</span>
          <span><strong>DAJJAL FAMILY</strong><small>ADMIN CONTROL CENTER</small></span>
        </Link>
        <div className="df-admin-sidebar-label">{language === "id" ? "MENU UTAMA" : "MAIN MENU"}</div>
        <nav className="df-admin-nav">
          {groups.map((group) => (
            <section className="df-admin-nav-group" key={group.id} aria-label={language === "id" ? group.idLabel : group.enLabel}>
              <h2>{language === "id" ? group.idLabel : group.enLabel}</h2>
              {group.items.map((item) => {
                const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href + "/"));
                return (
                  <Link key={item.href} href={localized(item.href)} className={active ? "df-admin-nav-link is-active" : "df-admin-nav-link"} aria-current={active ? "page" : undefined}>
                    <span className="df-admin-nav-icon" aria-hidden="true">{item.icon}</span>
                    <span>{language === "id" ? item.id : item.en}</span>
                    {active && <span className="df-admin-nav-active" aria-hidden="true" />}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>
        <div className="df-admin-sidebar-foot">
          <Badge variant="success">{language === "id" ? "Sesi admin aktif" : "Admin session active"}</Badge>
          <span>DAJJAL FAMILY · 2026</span>
        </div>
      </aside>

      <div className="df-admin-workspace">
        <div role="banner" className="df-admin-topbar">
          <div className="df-admin-topbar-copy">
            <span className="df-admin-overline">DAJJAL FAMILY / ADMIN</span>
            {path === "/admin" ? <PageHeader className="df-admin-page-heading" title={pageTitle} description={language === "id" ? "Kelola ekosistem Dajjal Family dari satu pusat kendali." : "Manage the Dajjal Family ecosystem from one control center."} /> : <p className="df-admin-current-route">{pageTitle}</p>}
          </div>
          <div className="df-admin-topbar-actions">
            <Badge variant="success"><span className="df-admin-status-dot" />{language === "id" ? "AMAN" : "SECURE"}</Badge>
            <Button variant="secondary" size="sm" onClick={() => setLanguage(language === "id" ? "en" : "id")} aria-label={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}>{language.toUpperCase()}</Button>
            <Button variant="secondary" size="sm" onClick={toggleTheme} disabled={!themeReady} aria-label={language === "id" ? `Ubah ke tema ${theme === "dark" ? "terang" : "gelap"}` : `Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={language === "id" ? "Ubah tema tampilan" : "Change appearance theme"}>{theme === "dark" ? "☀ Light" : "☾ Dark"}</Button>
            <Button variant="danger" size="sm" loading={signingOut} onClick={() => setSignOutConfirmOpen(true)}>{language === "id" ? "Keluar" : "Sign out"}</Button>
          </div>
        </div>

        <nav className="df-admin-mobile-nav" aria-label={language === "id" ? "Menu admin" : "Admin menu"}>
          {groups.flatMap((group) => group.items).map((item) => {
            const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href + "/"));
            return <Link key={item.href} href={localized(item.href)} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}><span aria-hidden="true">{item.icon}</span><span>{language === "id" ? item.id : item.en}</span></Link>;
          })}
        </nav>

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
        <div id="df-admin-main" className="df-admin-main">{children}</div>
        <footer className="df-admin-footer"><span>DAJJAL FAMILY ADMIN</span><span>{language === "id" ? "Pusat kendali ekosistem" : "Ecosystem control center"}</span></footer>
      </div>
    </div>
  );
}
