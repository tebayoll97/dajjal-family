"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { withLocalePrefix, stripLocalePrefix } from "@/lib/localePath";
import { useLanguage } from "./LanguageProvider";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language, setLanguage } = useLanguage();
  const links = [
    { route: "/", id: "Beranda", en: "Home", icon: "⌂" },
    { route: "/games", id: "Game", en: "Games", icon: "▣" },
    { route: "/profile", id: "Profil", en: "Profile", icon: "◎" },
  ];
  const active = (route) => route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(route + "/");

  return (
    <header className="df-site-header">
      <div className="df-site-header-inner">
        <Link href={withLocalePrefix("/", language)} className="df-site-brand" aria-label="Dajjal Family home">
          <span className="df-site-brand-mark" aria-hidden="true">DF</span>
          <span className="df-site-brand-copy"><strong>DAJJAL FAMILY</strong><small>ONE FAMILY. MANY POSSIBILITIES.</small></span>
        </Link>
        <div className="df-site-actions">
          <ThemeToggle />
          <div className="df-site-language" role="group" aria-label={language === "id" ? "Bahasa" : "Language"}>
            <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"}>ID</button>
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
        </div>
      </div>
      <nav className="df-mobile-primary-nav" aria-label={language === "id" ? "Navigasi ringkas" : "Quick navigation"}>
        {links.map((item) => <Link key={item.route} href={withLocalePrefix(item.route, language)} aria-current={active(item.route) ? "page" : undefined}><span aria-hidden="true">{item.icon}</span>{language === "id" ? item.id : item.en}</Link>)}
      </nav>
    </header>
  );
}
