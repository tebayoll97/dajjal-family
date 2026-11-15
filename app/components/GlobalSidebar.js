"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";
import { useLanguage } from "./LanguageProvider";

const labels = {
  id: { main: "MENU UTAMA", tools: "ALAT", home: "Beranda", games: "Game", universe: "Universe Keluarga", profile: "Profil", settings: "Pengaturan", wedding: "Wedding", promise: "JANJI DF", promiseText: "Semesta digital yang terus berkembang, dibangun dari gagasan, pengalaman, dan manusia.", world: "DUNIA PENUH KEMUNGKINAN", worldText: "Jelajahi gagasan, pengalaman, dan proyek yang terus berkembang." },
  en: { main: "MAIN MENU", tools: "TOOLS", home: "Home", games: "Games", universe: "Family Universe", profile: "Profile", settings: "Settings", wedding: "Wedding", promise: "THE DF PROMISE", promiseText: "A growing digital universe built around ideas, experiences, and people.", world: "A WORLD OF POSSIBILITIES", worldText: "Explore ideas, experiences, and projects made to grow." },
};

export default function GlobalSidebar() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language } = useLanguage();
  const t = labels[language] || labels.id;
  const groups = [
    { title: t.main, items: [
      { label: t.home, route: "/", icon: "⌂" },
      { label: t.games, route: "/games", icon: "▣" },
      { label: t.universe, route: "/df", icon: "▤" },
      { label: t.profile, route: "/profile", icon: "◎" },
    ]},
    { title: t.tools, items: [
      { label: t.settings, route: "/settings", icon: "⚙" },
      { label: t.wedding, route: "/df/wedding", icon: "✧" },
    ]},
  ];
  const active = (route) => route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(route + "/");
  return (
    <aside className="df-global-sidebar">
      <Link href={withLocalePrefix("/", language)} className="df-global-sidebar-brand">
        <span className="df-global-sidebar-mark">DF</span>
        <span><strong>DAJJAL FAMILY</strong><small>ONE FAMILY. MANY POSSIBILITIES.</small></span>
      </Link>
      {groups.map((group) => (
        <section className="df-global-sidebar-group" key={group.title}>
          <p className="df-global-sidebar-heading">{group.title}</p>
          <nav aria-label={group.title}>
            {group.items.map((item) => (
              <Link key={item.route} href={withLocalePrefix(item.route, language)} aria-current={active(item.route) ? "page" : undefined}>
                <span className="df-global-sidebar-icon" aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
        </section>
      ))}
      <div className="df-global-sidebar-bottom">
        <div className="df-global-sidebar-card"><span>{t.promise}</span><strong>One Family.<br/>Many Possibilities.</strong><p>{t.promiseText}</p></div>
        <div className="df-global-sidebar-card"><span>{t.world}</span><p>{t.worldText}</p></div>
        <small>DAJJALFAMILY.COM</small>
      </div>
    </aside>
  );
}
