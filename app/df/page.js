"use client";

// Keep this route explicitly on the client: it reads the shared language context.

import Link from "next/link";
import { useLanguage } from "../components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

const copy = {
  en: {
    eyebrow: "WELCOME TO OUR UNIVERSE",
    title: "DAJJAL FAMILY",
    subtitle: "UNIVERSE",
    intro: "A home for our family, characters, games, stories, creative projects, and unforgettable moments. One family, endless stories.",
    family: "Inside the Family",
    familySub: "Different characters. One extraordinary universe.",
    cards: [
      ["The Family", "Meet the characters and personalities behind the Dajjal Family universe.", "/df/couple"],
      ["Gallery", "A collection of memorable moments, portraits, and family memories.", "/df/gallery-couple"],
      ["Games", "Explore the games and adventures inside our universe.", "/games"],
    ],
    projects: "Featured Projects",
    projectsSub: "A growing collection of experiences from the DF universe.",
    projectCards: [
      ["DF Digital Experiences", "Special pages, creative experiments, and interactive family projects.", "/app/create-profile-couple"],
      ["Stories & Characters", "Discover the personalities and stories that shape our universe."],
      ["Coming Soon", "More experiences will be added to the DF universe."],
    ],
  },
  id: {
    eyebrow: "SELAMAT DATANG DI UNIVERSE KAMI",
    title: "DAJJAL FAMILY",
    subtitle: "UNIVERSE",
    intro: "Rumah bagi keluarga, karakter, game, cerita, proyek kreatif, dan momen tak terlupakan. Satu keluarga, cerita tanpa batas.",
    family: "Di Dalam Keluarga",
    familySub: "Karakter yang berbeda. Satu universe yang luar biasa.",
    cards: [
      ["Keluarga", "Kenali karakter dan kepribadian di balik universe Dajjal Family.", "/df/couple"],
      ["Galeri", "Kumpulan momen berkesan, potret, dan kenangan keluarga.", "/df/gallery-couple"],
      ["Game", "Jelajahi game dan petualangan di dalam universe kami.", "/games"],
    ],
    projects: "Proyek Unggulan",
    projectsSub: "Kumpulan pengalaman yang terus berkembang dari universe DF.",
    projectCards: [
      ["Pengalaman Digital DF", "Halaman khusus, eksperimen kreatif, dan proyek keluarga interaktif.", "/app/create-profile-couple"],
      ["Cerita & Karakter", "Kenali kepribadian dan cerita yang membentuk universe kami."],
      ["Segera Hadir", "Lebih banyak pengalaman akan ditambahkan ke universe DF."],
    ],
  },
};

export default function DajjalFamilyHome() {
  const { language } = useLanguage();
  const t = copy[language] || copy.en;

  return (
    <main className="df-home">
      <section className="df-hero">
        <p className="df-eyebrow">{t.eyebrow}</p>
        <h1>{t.title}<span>{t.subtitle}</span></h1>
        <p className="df-hero-copy">{t.intro}</p>
      </section>

      <section className="df-section" id="family">
        <h2 className="df-section-heading">{t.family}</h2>
        <p className="df-section-subtitle">{t.familySub}</p>
        <div className="df-card-grid">
          {t.cards.map((card, index) => (
            <Link className="df-card" href={withLocalePrefix(card[2], language)} key={card[0]}>
              <span className="df-card-icon" aria-hidden="true">{["♛", "✧", "⚔"][index]}</span>
              <span className="df-card-copy"><strong>{card[0]}</strong><span>{card[1]}</span></span>
              <span className="df-card-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="df-section" id="projects">
        <h2 className="df-section-heading">{t.projects}</h2>
        <p className="df-section-subtitle">{t.projectsSub}</p>
        <div className="df-card-grid">
          {t.projectCards.map((card, index) => {
            const content = <>
              <span className="df-card-icon" aria-hidden="true">{["✦", "♜", "◇"][index]}</span>
              <span className="df-card-copy"><strong>{card[0]}</strong><span>{card[1]}</span></span>
              {card[2] && <span className="df-card-arrow" aria-hidden="true">↗</span>}
            </>;
            return card[2]
              ? <Link className="df-card" href={withLocalePrefix(card[2], language)} key={card[0]}>{content}</Link>
              : <article className="df-card" key={card[0]}>{content}</article>;
          }}
        </div>
      </section>

    </main>
  );
}
