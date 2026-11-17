"use client";

import { useLanguage } from "../../components/LanguageProvider";

const copy = {
  id: {
    eyebrow: "CERITA DARI DAJJAL FAMILY",
    title: "DAJJAL",
    connector: "×",
    partner: "VEYLORA",
    subtitle: "Dua karakter. Satu universe bersama.",
    intro: "Ruang khusus untuk mengenal identitas, dunia visual, dan cerita Dajjal bersama Veylora.",
    identityLabel: "IDENTITAS KARAKTER",
    dajjalTitle: "Dajjal",
    dajjalRole: "THE CRIMSON PRESENCE",
    dajjalDescription: "Identitas visual dengan nuansa merah gelap, hitam, dan atmosfer sinematik yang kuat.",
    veyloraTitle: "Veylora",
    veyloraRole: "THE AZURE PRESENCE",
    veyloraDescription: "Identitas visual dengan nuansa biru terang, putih, dan atmosfer yang bercahaya.",
    storyEyebrow: "SATU CERITA BERSAMA",
    storyTitle: "Dua identitas, satu ruang untuk bercerita.",
    storyText: "Halaman ini menyatukan profil Dajjal dan Veylora dalam satu bagian dari Universe Keluarga Dajjal. Setiap karakter tetap memiliki identitas visualnya sendiri, sementara halaman ini menjadi tempat untuk menampilkan kisah dan karya mereka bersama.",
    signature: "Dibangun dari dua identitas yang berbeda.",
    footer: "DAJJAL FAMILY · COUPLE PROFILE",
    characters: "Karakter",
    universe: "Universe",
    languages: "Bahasa",
    characterValue: "02",
    universeValue: "01",
    languageValue: "ID · EN",
  },
  en: {
    eyebrow: "A DAJJAL FAMILY STORY",
    title: "DAJJAL",
    connector: "×",
    partner: "VEYLORA",
    subtitle: "Two characters. One shared universe.",
    intro: "A dedicated space to explore the identities, visual worlds, and shared story of Dajjal and Veylora.",
    identityLabel: "CHARACTER IDENTITIES",
    dajjalTitle: "Dajjal",
    dajjalRole: "THE CRIMSON PRESENCE",
    dajjalDescription: "A visual identity shaped by deep red, black, and a bold cinematic atmosphere.",
    veyloraTitle: "Veylora",
    veyloraRole: "THE AZURE PRESENCE",
    veyloraDescription: "A visual identity shaped by bright blue, white, and a luminous atmosphere.",
    storyEyebrow: "ONE SHARED STORY",
    storyTitle: "Two identities, one space to tell their story.",
    storyText: "This page brings Dajjal and Veylora together as part of the Dajjal Family Universe. Each character keeps a distinct visual identity, while this shared space brings their stories and creative work together.",
    signature: "Built around two distinct identities.",
    footer: "DAJJAL FAMILY · COUPLE PROFILE",
    characters: "Characters",
    universe: "Universe",
    languages: "Languages",
    characterValue: "02",
    universeValue: "01",
    languageValue: "ID · EN",
  },
};

export default function CoupleProfilePage() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;

  return (
    <main className="df-couple-page">
      <div className="df-couple-shell">
        <header className="df-couple-hero">
          <p className="df-couple-eyebrow">{t.eyebrow}</p>
          <h1 className="df-couple-title">
            <span>{t.title}</span>
            <span className="df-couple-connector" aria-hidden="true">{t.connector}</span>
            <span>{t.partner}</span>
          </h1>
          <p className="df-couple-subtitle">{t.subtitle}</p>
          <p className="df-couple-intro">{t.intro}</p>
          <div className="df-couple-orbit" aria-hidden="true">
            <span className="df-couple-orbit-core">D <i>×</i> V</span>
          </div>
          <div className="df-couple-metrics" aria-label={t.eyebrow}>
            <div><strong>{t.characterValue}</strong><span>{t.characters}</span></div>
            <div><strong>{t.universeValue}</strong><span>{t.universe}</span></div>
            <div><strong>{t.languageValue}</strong><span>{t.languages}</span></div>
          </div>
        </header>

        <section className="df-couple-section" aria-labelledby="df-couple-identities">
          <div className="df-couple-section-heading">
            <p className="df-couple-eyebrow">{t.identityLabel}</p>
            <h2 id="df-couple-identities">{t.dajjalTitle} &amp; {t.veyloraTitle}</h2>
          </div>

          <div className="df-couple-character-grid">
            <article className="df-couple-character-card" data-character="dajjal">
              <div className="df-couple-character-mark" aria-hidden="true">D</div>
              <div className="df-couple-character-copy">
                <p className="df-couple-character-role">{t.dajjalRole}</p>
                <h3>{t.dajjalTitle}</h3>
                <p>{t.dajjalDescription}</p>
              </div>
              <span className="df-couple-character-index" aria-hidden="true">01</span>
            </article>

            <article className="df-couple-character-card" data-character="veylora">
              <div className="df-couple-character-mark" aria-hidden="true">V</div>
              <div className="df-couple-character-copy">
                <p className="df-couple-character-role">{t.veyloraRole}</p>
                <h3>{t.veyloraTitle}</h3>
                <p>{t.veyloraDescription}</p>
              </div>
              <span className="df-couple-character-index" aria-hidden="true">02</span>
            </article>
          </div>
        </section>

        <section className="df-couple-story" aria-labelledby="df-couple-story-title">
          <div className="df-couple-story-symbol" aria-hidden="true">D <span>×</span> V</div>
          <div className="df-couple-story-copy">
            <p className="df-couple-eyebrow">{t.storyEyebrow}</p>
            <h2 id="df-couple-story-title">{t.storyTitle}</h2>
            <p>{t.storyText}</p>
            <span className="df-couple-signature">{t.signature}</span>
          </div>
        </section>

        <footer className="df-couple-footer">
          <span>{t.footer}</span>
          <span>DAJJAL FAMILY UNIVERSE</span>
        </footer>
      </div>
    </main>
  );
}
