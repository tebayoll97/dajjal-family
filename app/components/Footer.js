"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

const copy = {
  en: {
    tagline: "One Account. One Profile. Multiple Experiences. One Universe.",
    about: "About", games: "Games", knowledge: "Knowledge", contact: "Contact",
    characters: "Our Characters", rights: "All rights reserved.",
    statement: "A DIGITAL UNIVERSE BUILT TO GROW.",
  },
  id: {
    tagline: "Satu Akun. Satu Profil. Banyak Pengalaman. Satu Universe.",
    about: "Tentang", games: "Game", knowledge: "Pengetahuan", contact: "Kontak",
    characters: "Karakter Kami", rights: "Hak cipta dilindungi.",
    statement: "SEMESTA DIGITAL YANG TERUS BERKEMBANG.",
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const links = [
    [t.about, "/about"],
    [t.games, "/games"],
    [t.knowledge, "/knowledge"],
    [t.characters, "/characters/dajjal"],
    [t.contact, "/contact"],
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
