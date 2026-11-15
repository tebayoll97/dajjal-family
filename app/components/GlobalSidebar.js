"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";

const items = [
  { route: "/", icon: "⌂", id: "Beranda", en: "Home" },
  { route: "/games", icon: "▣", id: "Game", en: "Games" },
  { route: "/df", icon: "✦", id: "Family Universe", en: "Family Universe" },
  { route: "/profile", icon: "◎", id: "Profil", en: "Profile" },
  { route: "/settings", icon: "⚙", id: "Pengaturan", en: "Settings", group: "tools" },
  { route: "/df/wedding", icon: "✧", id: "Wedding", en: "Wedding", group: "tools" },
];

export default function GlobalSidebar() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language } = useLanguage();
  const active = (route) => route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(route + "/");
  const main = items.filter((item) => !item.group);
  const tools = items.filter((item) => item.group);
  const renderItems = (list) => list.map((item) => (
    <Link key={item.route} href={withLocalePrefix(item.route, language)} aria-current={active(item.route) ? "page" : undefined} className="df-global-side-link">
      <span className="df-global-side-icon" aria-hidden="true">{item.icon}</span>
      <span>{language === "id" ? item.id : item.en}</span>
      {active(item.route) && <span className="df-global-side-current" aria-hidden="true">●</span>}
    </Link>
  ));
  return (
    <aside className="df-global-sidebar" aria-label={language === "id" ? "Navigasi utama" : "Main navigation"}>
      <div className="df-global-sidebar-brand"><span className="df-global-sidebar-mark">DF</span><span><strong>DAJJAL FAMILY</strong><small>ONE FAMILY. MANY POSSIBILITIES.</small></span></div>
      <p className="df-global-sidebar-label">{language === "id" ? "MENU UTAMA" : "MAIN MENU"}</p>
      <nav className="df-global-sidebar-links">{renderItems(main)}</nav>
      <p className="df-global-sidebar-label df-global-sidebar-tools">{language === "id" ? "ALAT" : "TOOLS"}</p>
      <nav className="df-global-sidebar-links">{renderItems(tools)}</nav>
      <div className="df-global-sidebar-foot">DAJJALFAMILY.COM</div>
    </aside>
  );
}
