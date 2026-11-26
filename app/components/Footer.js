"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "./LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

const copy = {
  en: {
    tagline: "A connected digital universe for gaming, knowledge, creativity, and community.",
    explore: "Explore", community: "Community & Support", legal: "Legal",
    games: "Gaming", knowledge: "Knowledge", blog: "Blog", products: "Digital Products", business: "Business", universe: "Family Universe",
    communityHub: "Community", guidelines: "Community Guidelines", help: "Help Center", contact: "Contact", profile: "Profile",
    privacy: "Privacy Policy", terms: "Terms & Conditions", cookies: "Cookie Policy", disclaimer: "Disclaimer",
    rights: "All rights reserved.", statement: "ONE FAMILY. MANY POSSIBILITIES.",
  },
  id: {
    tagline: "Semesta digital yang menghubungkan gaming, pengetahuan, kreativitas, dan komunitas.",
    explore: "Jelajahi", community: "Komunitas & Bantuan", legal: "Legal",
    games: "Gaming", knowledge: "Pengetahuan", blog: "Blog", products: "Produk Digital", business: "Bisnis", universe: "Universe Keluarga",
    communityHub: "Komunitas", guidelines: "Pedoman Komunitas", help: "Pusat Bantuan", contact: "Kontak", profile: "Profil",
    privacy: "Kebijakan Privasi", terms: "Syarat & Ketentuan", cookies: "Kebijakan Cookie", disclaimer: "Disclaimer",
    rights: "Hak cipta dilindungi.", statement: "SATU KELUARGA. BANYAK KEMUNGKINAN.",
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const groups = [
    { id: "explore", title: t.explore, links: [
      [t.games, "/games"], [t.knowledge, "/knowledge"], [t.blog, "/blog"],
      [t.products, "/digital-products"], [t.business, "/business"], [t.universe, "/df"],
    ]},
    { id: "community", title: t.community, links: [
      [t.communityHub, "/community"], [t.guidelines, "/community-guidelines"],
      [t.help, "/help"], [t.contact, "/contact"], [t.profile, "/profile"],
    ]},
    { id: "legal", title: t.legal, links: [
      [t.privacy, "/privacy-policy"], [t.terms, "/terms"],
      [t.cookies, "/cookie-policy"], [t.disclaimer, "/disclaimer"],
    ]},
  ];

  return (
    <footer className="df-site-footer">
      <div className="df-site-footer-inner">
        <div className="df-site-footer-main">
          <div className="df-site-footer-brand">
            <Link href={withLocalePrefix("/", language)} className="df-site-brand">
              <Image className="df-site-brand-mark" src="/dajjalfamily_icon_192.png" alt="" width={44} height={44} />
              <span className="df-site-brand-copy">
                <strong>DAJJAL FAMILY</strong>
                <small>ONE FAMILY. MANY POSSIBILITIES.</small>
              </span>
            </Link>
            <p>{t.tagline}</p>
          </div>
          <nav className="df-site-footer-groups" aria-label={language === "id" ? "Navigasi footer" : "Footer navigation"}>
            {groups.map((group) => (
              <section className="df-site-footer-group" key={group.id} aria-labelledby={"df-footer-" + group.id}>
                <h2 id={"df-footer-" + group.id}>{group.title}</h2>
                <ul>
                  {group.links.map(([label, route]) => (
                    <li key={route}><Link href={withLocalePrefix(route, language)}>{label}</Link></li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
        <div className="df-site-footer-bottom">
          <span>{t.statement}</span>
          <small>© {new Date().getFullYear()} DAJJAL FAMILY. {t.rights}</small>
        </div>
      </div>
    </footer>
  );
}
