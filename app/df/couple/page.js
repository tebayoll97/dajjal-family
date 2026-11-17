"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";

const photos = {
  dajjal: "https://drive.google.com/uc?export=view&id=1urhdPV8db9uBbqWG2u94UqWpUYjfPTed",
  veylora: "https://drive.google.com/uc?export=view&id=1uMesA4WgX8CPLCVnSA3s_b58CtfpW7dr",
  cover: "https://drive.google.com/thumbnail?id=1ft9M6JyMrdXsLncSVOm7yXiEEHH9LRQ_&sz=w1600",
  moments: [
    "https://drive.google.com/uc?export=view&id=1OYQRWGIC-8xFZ_ht5MAd0XEY5NFvjddf",
    "https://drive.google.com/uc?export=view&id=1ghZfNeLMW7mtrcUAWrg2llYeOaLcMpCl",
    "https://drive.google.com/uc?export=view&id=1tJUIYmBegfZMith78OdDcIbWGnsAfX_u",
    "https://drive.google.com/uc?export=view&id=1PsOBoHdLz4jAo3uUcbAbUfLGFSa85mB1",
  ],
  portraits: [
    "https://drive.google.com/uc?export=view&id=1G1loww4fM-pU5lU-BR1psW6P9LNMzyVe",
    "https://drive.google.com/uc?export=view&id=1rL-oAVIsUkD_pfkZpn2YmnCJr6inT7Ax",
  ],
};

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
    veyloraTitle: "Veylora",
    dajjalRole: "THE CRIMSON PRESENCE",
    veyloraRole: "THE AZURE PRESENCE",
    dajjalDescription: "Identitas visual dengan nuansa merah gelap, hitam, dan atmosfer sinematik yang kuat.",
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
    visualEyebrow: "CIRI VISUAL",
    visualTitle: "Identitas yang mudah dikenali",
    hair: "Rambut",
    eyes: "Mata",
    outfit: "Busana khas",
    palette: "Palet karakter",
    dajjalHair: "Merah gelap",
    dajjalEyes: "Merah",
    dajjalOutfit: "Hitam dengan aksen merah",
    dajjalPalette: "Crimson · Black",
    veyloraHair: "Perak-putih panjang",
    veyloraEyes: "Biru",
    veyloraOutfit: "Putih-biru dengan detail emas dan fur",
    veyloraPalette: "Azure · White",
    featuredLabel: "POTRET UTAMA",
    galleryEyebrow: "GALERI BERSAMA",
    galleryTitle: "Momen Dajjal × Veylora",
    galleryIntro: "Kumpulan potret dan momen dari perjalanan visual mereka.",
    momentsLabel: "COUPLE MOMENTS",
    portraitLabel: "PORTRAIT KARAKTER",
    momentNames: ["Romantis", "Casual", "Cinematic", "Momen pilihan"],
    portraitNames: ["Portrait Dajjal", "Portrait Veylora"],
    openPhoto: "Buka foto",
    closePhoto: "Tutup foto",
    previousPhoto: "Foto sebelumnya",
    nextPhoto: "Foto berikutnya",
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
    veyloraTitle: "Veylora",
    dajjalRole: "THE CRIMSON PRESENCE",
    veyloraRole: "THE AZURE PRESENCE",
    dajjalDescription: "A visual identity shaped by deep red, black, and a bold cinematic atmosphere.",
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
    visualEyebrow: "VISUAL SIGNATURE",
    visualTitle: "Distinctive character identities",
    hair: "Hair",
    eyes: "Eyes",
    outfit: "Signature outfit",
    palette: "Character palette",
    dajjalHair: "Dark reddish",
    dajjalEyes: "Red",
    dajjalOutfit: "Black with red accents",
    dajjalPalette: "Crimson · Black",
    veyloraHair: "Long silver-white",
    veyloraEyes: "Blue",
    veyloraOutfit: "White-blue with gold and fur details",
    veyloraPalette: "Azure · White",
    featuredLabel: "FEATURED PORTRAIT",
    galleryEyebrow: "SHARED GALLERY",
    galleryTitle: "Dajjal × Veylora moments",
    galleryIntro: "A collection of portraits and moments from their visual journey.",
    momentsLabel: "COUPLE MOMENTS",
    portraitLabel: "CHARACTER PORTRAITS",
    momentNames: ["Romantic", "Casual", "Cinematic", "Selected moment"],
    portraitNames: ["Dajjal portrait", "Veylora portrait"],
    openPhoto: "Open photo",
    closePhoto: "Close photo",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
  },
};

export default function CoupleProfilePage() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    if (!activePhoto) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActivePhoto(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto]);

  const openPhoto = (src, alt) => setActivePhoto({ src, alt });

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
          <button className="df-couple-featured-photo" type="button" onClick={() => openPhoto(photos.cover, t.featuredLabel)} aria-label={t.openPhoto + ": " + t.featuredLabel}>
            <img className="df-couple-featured-background" src={photos.cover} alt="Dajjal and Veylora together" fetchPriority="high" />
            <img className="df-couple-featured-character df-couple-featured-dajjal" src={photos.dajjal} alt="" aria-hidden="true" />
            <img className="df-couple-featured-character df-couple-featured-veylora" src={photos.veylora} alt="" aria-hidden="true" />
            <span>{t.featuredLabel}</span>
          </button>
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
              <button className="df-couple-character-art" type="button" onClick={() => openPhoto(photos.dajjal, t.dajjalTitle)} aria-label={t.openPhoto + ": " + t.dajjalTitle}>
                <img src={photos.dajjal} alt={t.dajjalTitle + " character render"} loading="lazy" />
              </button>
              <div className="df-couple-character-copy">
                <p className="df-couple-character-role">{t.dajjalRole}</p>
                <h3>{t.dajjalTitle}</h3>
                <p>{t.dajjalDescription}</p>
              </div>
              <span className="df-couple-character-index" aria-hidden="true">01</span>
            </article>
            <article className="df-couple-character-card" data-character="veylora">
              <button className="df-couple-character-art" type="button" onClick={() => openPhoto(photos.veylora, t.veyloraTitle)} aria-label={t.openPhoto + ": " + t.veyloraTitle}>
                <img src={photos.veylora} alt={t.veyloraTitle + " character render"} loading="lazy" />
              </button>
              <div className="df-couple-character-copy">
                <p className="df-couple-character-role">{t.veyloraRole}</p>
                <h3>{t.veyloraTitle}</h3>
                <p>{t.veyloraDescription}</p>
              </div>
              <span className="df-couple-character-index" aria-hidden="true">02</span>
            </article>
          </div>
        </section>

        <section className="df-couple-details" aria-labelledby="df-couple-details-title">
          <div className="df-couple-section-heading">
            <p className="df-couple-eyebrow">{t.visualEyebrow}</p>
            <h2 id="df-couple-details-title">{t.visualTitle}</h2>
          </div>
          <div className="df-couple-detail-grid">
            <article className="df-couple-detail-card" data-character="dajjal">
              <div className="df-couple-detail-heading"><span className="df-couple-detail-index">01 / DAJJAL</span><h3>{t.dajjalTitle}</h3></div>
              <dl>
                <div><dt>{t.hair}</dt><dd>{t.dajjalHair}</dd></div>
                <div><dt>{t.eyes}</dt><dd>{t.dajjalEyes}</dd></div>
                <div><dt>{t.outfit}</dt><dd>{t.dajjalOutfit}</dd></div>
                <div><dt>{t.palette}</dt><dd>{t.dajjalPalette}</dd></div>
              </dl>
            </article>
            <article className="df-couple-detail-card" data-character="veylora">
              <div className="df-couple-detail-heading"><span className="df-couple-detail-index">02 / VEYLORA</span><h3>{t.veyloraTitle}</h3></div>
              <dl>
                <div><dt>{t.hair}</dt><dd>{t.veyloraHair}</dd></div>
                <div><dt>{t.eyes}</dt><dd>{t.veyloraEyes}</dd></div>
                <div><dt>{t.outfit}</dt><dd>{t.veyloraOutfit}</dd></div>
                <div><dt>{t.palette}</dt><dd>{t.veyloraPalette}</dd></div>
              </dl>
            </article>
          </div>
        </section>

        <section className="df-couple-gallery" aria-labelledby="df-couple-gallery-title">
          <div className="df-couple-section-heading">
            <p className="df-couple-eyebrow">{t.galleryEyebrow}</p>
            <h2 id="df-couple-gallery-title">{t.galleryTitle}</h2>
            <p className="df-couple-gallery-intro">{t.galleryIntro}</p>
          </div>
          <div className="df-couple-gallery-group">
            <h3>{t.momentsLabel}</h3>
            <div className="df-couple-moments-grid">
              {photos.moments.map((src, index) => (
                <button className="df-couple-gallery-item" type="button" key={src} onClick={() => openPhoto(src, t.momentNames[index])} aria-label={t.openPhoto + ": " + t.momentNames[index]}>
                  <img src={src} alt={t.momentNames[index] + " — Dajjal and Veylora"} loading="lazy" />
                  <span>{t.momentNames[index]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="df-couple-gallery-group">
            <h3>{t.portraitLabel}</h3>
            <div className="df-couple-portraits-grid">
              {photos.portraits.map((src, index) => (
                <button className="df-couple-portrait-item" type="button" key={src} onClick={() => openPhoto(src, t.portraitNames[index])} aria-label={t.openPhoto + ": " + t.portraitNames[index]}>
                  <img src={src} alt={t.portraitNames[index]} loading="lazy" />
                  <span>{t.portraitNames[index]}</span>
                </button>
              ))}
            </div>
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

      {activePhoto && (
        <div className="df-couple-lightbox" role="presentation">
          <button className="df-couple-lightbox-backdrop" type="button" onClick={() => setActivePhoto(null)} aria-label={t.closePhoto} />
          <div className="df-couple-lightbox-panel" role="dialog" aria-modal="true" aria-label={activePhoto.alt} onClick={(event) => event.stopPropagation()}>
            <button className="df-couple-lightbox-close" type="button" onClick={() => setActivePhoto(null)} aria-label={t.closePhoto}>×</button>
            <img src={activePhoto.src} alt={activePhoto.alt} />
            <p>{activePhoto.alt}</p>
          </div>
        </div>
      )}
    </main>
  );
}
