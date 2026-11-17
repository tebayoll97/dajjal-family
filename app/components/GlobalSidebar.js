"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";
import { useLanguage } from "./LanguageProvider";

const labels = {
  id: { main: "MENU UTAMA", gaming: "Gaming", library: "Perpustakaan Game", mamah: "Mamah Ngamuk", run: "Lari & Lompat", knowledge: "Pengetahuan", blog: "Blog", tools: "Tools", products: "Produk Digital", business: "Bisnis", community: "Komunitas", settings: "Pengaturan", universe: "Universe Keluarga", profile: "Profil", promise: "JANJI DF", promiseText: "Semesta digital yang terus berkembang, dibangun dari gagasan, pengalaman, dan manusia.", world: "DUNIA PENUH KEMUNGKINAN", worldText: "Jelajahi gagasan, pengalaman, dan proyek yang terus berkembang." },
  en: { main: "MAIN MENU", gaming: "Gaming", library: "Game Library", mamah: "Mamah Ngamuk", run: "Run & Jump", knowledge: "Knowledge", blog: "Blog", tools: "Tools", products: "Digital Products", business: "Business", community: "Community", settings: "Settings", universe: "Family Universe", profile: "Profile", promise: "THE DF PROMISE", promiseText: "A growing digital universe built around ideas, experiences, and people.", world: "A WORLD OF POSSIBILITIES", worldText: "Explore ideas, experiences, and projects made to grow." },
};

export default function GlobalSidebar() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language } = useLanguage();
  const t = labels[language] || labels.id;
  const groups = [
    { title: t.main, items: [
      { label: t.gaming, route: "/games", icon: "🎮" },
      { label: t.knowledge, route: "/knowledge", icon: "✦" },
      { label: t.blog, route: "/blog", icon: "▤" },
      { label: t.products, route: "/digital-products", icon: "◇" },
      { label: t.business, route: "/business", icon: "⌂" },
      { label: t.community, route: "/community", icon: "◎" },
      { label: t.universe, route: "/df", icon: "◈" },
    ]},
    { title: t.tools, items: [{ label: t.settings, route: "/settings", icon: "⚙" }] },
  ];
  const active = (route) => route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(route + "/");
  return (
    <aside className="df-global-sidebar">
      <Link href={withLocalePrefix("/", language)} className="df-global-sidebar-brand">
        <Image className="df-global-sidebar-mark" src="/dajjalfamily_icon_192.png" alt="" width={42} height={42} />
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
