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
    explore: "EXPLORE PROJECTS",
    createCoupleProfile: "CREATE COUPLE PROFILE",
    viewEvents: "VIEW EVENTS",
    events: "Family Events",
    eventsSub: "Special moments deserve their own place.",
    wedding: "Anak Dajjal & Malika Wedding Invitation",
    weddingText: "Visit the digital wedding invitation, explore event details, RSVP, and leave your wishes for the couple.",
    family: "Inside the Family",
    familySub: "Different characters. One extraordinary universe.",
    cards: [
      ["Dajjal & Veylora Profile", "Discover their characters, gamer identities, story, and journey together.", "/df/couple"],
      ["Couple Gallery", "Explore a collection of couple profiles, love stories, and special moments shared by the DAJJAL FAMILY community.", "/df/gallery-couple"],
      ["Game Library", "Discover and play the mini-games available in DAJJAL FAMILY.", "/games"],
    ],
    projects: "Featured Projects",
    projectsSub: "A growing collection of experiences from the DF universe.",
    projectCards: [
      ["Create a Couple Profile", "Create a personal page to keep your story and favorite moments together.", "/app/create-profile-couple"],
      ["Stories & Characters", "A space to discover the characters and stories that shape the DAJJAL FAMILY universe."],
      ["Coming Soon", "Look forward to new projects, features, and experiences being prepared for DAJJAL FAMILY."],
    ],
  },
  id: {
    eyebrow: "SELAMAT DATANG DI UNIVERSE KAMI",
    title: "DAJJAL FAMILY",
    subtitle: "UNIVERSE",
    intro: "Rumah bagi keluarga, karakter, game, cerita, proyek kreatif, dan momen tak terlupakan. Satu keluarga, cerita tanpa batas.",
    explore: "JELAJAHI PROYEK",
    createCoupleProfile: "BUAT PROFIL PASANGAN",
    viewEvents: "LIHAT ACARA",
    events: "Acara Keluarga",
    eventsSub: "Momen istimewa layak memiliki tempatnya sendiri.",
    wedding: "Undangan Pernikahan Anak Dajjal & Malika",
    weddingText: "Kunjungi undangan digital pernikahan, lihat informasi acara, konfirmasi kehadiran, serta sampaikan ucapan dan doa.",
    family: "Di Dalam Keluarga",
    familySub: "Karakter yang berbeda. Satu universe yang luar biasa.",
    cards: [
      ["Profil Dajjal & Veylora", "Kenali karakter, identitas gamer, kisah, dan perjalanan Dajjal bersama Veylora.", "/df/couple"],
      ["Galeri Couple", "Jelajahi kumpulan Couple Profile, kisah pasangan, dan momen spesial yang dibagikan oleh keluarga DAJJAL FAMILY.", "/df/gallery-couple"],
      ["Library Game", "Temukan dan mainkan berbagai mini-game yang tersedia di DAJJAL FAMILY.", "/games"],
    ],
    projects: "Proyek Unggulan",
    projectsSub: "Kumpulan pengalaman yang terus berkembang dari universe DF.",
    projectCards: [
      ["Buat Profil Pasangan", "Buat halaman pribadi untuk menyimpan cerita dan momen spesial kalian bersama.", "/app/create-profile-couple"],
      ["Cerita & Karakter", "Ruang untuk mengenal lebih jauh karakter dan kisah yang membentuk dunia DAJJAL FAMILY."],
      ["Segera Hadir", "Nantikan proyek, fitur, dan pengalaman baru yang sedang dipersiapkan untuk keluarga DAJJAL FAMILY."],
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
        <div className="df-hero-actions">
          <div className="df-hero-primary-stack">
            <Link href="#projects" className="df-button">{t.explore}</Link>
          </div>
          <Link href="#events" className="df-button df-button-secondary">{t.viewEvents}</Link>
        </div>
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
          })}
        </div>
      </section>

      <section className="df-section" id="events">
        <h2 className="df-section-heading">{t.events}</h2>
        <p className="df-section-subtitle">{t.eventsSub}</p>
        <div className="df-card-grid">
          <Link className="df-card" href={withLocalePrefix("/df/wedding-anak-dajjal", language)}>
            <span className="df-card-icon" aria-hidden="true">♕</span>
            <span className="df-card-copy"><strong>{t.wedding}</strong><span>{t.weddingText}</span></span>
            <span className="df-card-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
