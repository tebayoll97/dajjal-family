"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

const copy = {
  en: {
    tagline: "One Account. One Profile. Multiple Experiences. One Universe.",
    universe: "Family Universe", games: "Games", settings: "Settings", wedding: "Wedding", profile: "Profile", rights: "All rights reserved.",
    statement: "A DIGITAL UNIVERSE BUILT TO GROW.",
  },
  id: {
    tagline: "Satu Akun. Satu Profil. Banyak Pengalaman. Satu Universe.",
    universe: "Universe Keluarga", games: "Game", settings: "Pengaturan", wedding: "Wedding", profile: "Profil", rights: "Hak cipta dilindungi.",
    statement: "SEMESTA DIGITAL YANG TERUS BERKEMBANG.",
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const links = [
    [t.universe, "/df"],
    [t.games, "/games"],
    [t.settings, "/settings"],
    [t.wedding, "/df/wedding"],
    [t.profile, "/profile"],
  ];

  return (
    <footer className="df-site-footer">
      <div className="df-site-footer-inner">
        <div className="df-site-footer-brand">
          <Link href={withLocalePrefix("/", language)} className="df-site-brand">
            <span className="df-site-brand-mark" aria-hidden="true">DF</span>
            <span className="df-site-brand-copy">
              <strong>DAJJAL FAMILY</strong>
              <small>ONE FAMILY. MANY POSSIBILITIES.</small>
            </span>
          </Link>
          <p>{t.tagline}</p>
        </div>
        <nav className="df-site-footer-nav" aria-label={language === "id" ? "Navigasi footer" : "Footer navigation"}>
          {links.map(([label, route]) => (
            <Link key={route} href={withLocalePrefix(route, language)}>{label}</Link>
          ))}
        </nav>
        <div className="df-site-footer-bottom">
          <span>{t.statement}</span>
          <small>© {new Date().getFullYear()} DAJJAL FAMILY. {t.rights}</small>
        </div>
      </div>
    </footer>
  );
}
