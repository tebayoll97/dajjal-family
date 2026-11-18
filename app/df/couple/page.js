"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import CoupleMusicPlayer from "../../components/CoupleMusicPlayer";

const photos = {
  dajjal: "https://drive.google.com/thumbnail?id=1G1loww4fM-pU5lU-BR1psW6P9LNMzyVe&sz=w1600",
  veylora: "https://drive.google.com/thumbnail?id=1rL-oAVIsUkD_pfkZpn2YmnCJr6inT7Ax&sz=w1600",
  cover: "https://drive.google.com/thumbnail?id=1ft9M6JyMrdXsLncSVOm7yXiEEHH9LRQ_&sz=w1600",
  moments: [
    "https://drive.google.com/thumbnail?id=1g4NzLY5eQDYBFp6-N4lLrgSC5ZhWl_Vq&sz=w1600",
    "https://drive.google.com/thumbnail?id=1OYQRWGIC-8xFZ_ht5MAd0XEY5NFvjddf&sz=w1600",
    "https://drive.google.com/thumbnail?id=1PsOBoHdLz4jAo3uUcbAbUfLGFSa85mB1&sz=w1600",
    "https://drive.google.com/thumbnail?id=1jXKn092u_HPqQykM0h9Y7PuSm1LBNmWL&sz=w1600",
    "https://drive.google.com/thumbnail?id=1tJUIYmBegfZMith78OdDcIbWGnsAfX_u&sz=w1600",
    "https://drive.google.com/thumbnail?id=1ghZfNeLMW7mtrcUAWrg2llYeOaLcMpCl&sz=w1600",
  ],
  portraits: [
    "https://drive.google.com/thumbnail?id=1urhdPV8db9uBbqWG2u94UqWpUYjfPTed&sz=w1600",
    "https://drive.google.com/thumbnail?id=1uMesA4WgX8CPLCVnSA3s_b58CtfpW7dr&sz=w1600",
  ],
};

const copy = {
  id: {
    eyebrow: "CERITA DARI DAJJAL FAMILY",
    title: "DAJJAL",
    connector: "×",
    partner: "VEYLORA",
    subtitle: "Dua elemen berbeda, tapi kok selalu ingin berdekatan? ❤️",
    intro: "Selamat datang di dunia Dajjal dan Veylora. Tempat si pembantai bertemu si nggak tegaan, dan hal-hal sederhana bisa berubah menjadi kenangan istimewa.",
    identityLabel: "IDENTITAS KARAKTER",
    dajjalTitle: "Dajjal",
    veyloraTitle: "Veylora",
    dajjalRole: "THE CRIMSON TROUBLEMAKER",
    veyloraRole: "THE AZURE SWEETHEART",
    dajjalDescription: "Tatapannya mungkin terlihat dingin, auranya terasa mengintimidasi, dan jangan tanya soal reputasinya. 😈",
    veyloraDescription: "Kalo lagi kangen bisa bikin satu bumi beku. Harusnya main Darkwar Survival, malah jadi main Whiteout Survival. 🤭",
    storyEyebrow: "OUR LITTLE STORY",
    storyTitle: "Dua dunia, satu cerita yang terus berlanjut. ❤️",
    storyText: "Siapa sangka, dua karakter dengan sifat dan dunia yang begitu berbeda bisa punya begitu banyak cerita bersama? Ada tawa, kejahilan, drama kecil, dan tentu saja… sedikit kekacauan. Tapi justru itulah yang membuat perjalanan Dajjal dan Veylora terasa istimewa. Dan ceritanya belum selesai. 🥰",
    signature: "Dua karakter, satu cerita, dan masih banyak halaman yang belum ditulis. ❤️",
    footer: "DAJJAL FAMILY · COUPLE PROFILE",
    anniversaryLabel: "SUDAH SELAMA INI, DAN MASIH MAU TERUS BERSAMA ❤️",
    anniversaryIntro: "Setiap detik punya cerita. Setiap hari punya kenangan. Dan perjalanan kita masih terus berjalan. 🥰",
    timeUnits: ["Hari", "Jam", "Menit", "Detik"],
    visualEyebrow: "THEIR SIGNATURE LOOKS",
    visualTitle: "Beda gaya, sama-sama punya pesona. ✨",
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
    galleryEyebrow: "OUR LITTLE WORLD",
    galleryTitle: "Kumpulan momen yang nggak akan terlupakan. ❤️",
    galleryIntro: "Dari tingkah konyol sampai momen manis, semuanya punya cerita sendiri. Inilah potongan-potongan kecil dari dunia Dajjal dan Veylora. Kadang romantis, kadang nangis, kadang garing, kadang sedikit gak waras… tapi selalu berkesan. 🤭",
    momentsLabel: "OUR CHAOTIC MOMENTS",
    portraitLabel: "THEIR ICONIC PORTRAITS",
    momentNames: ["Veylora Capek Jalan Kaki", "Aku Gak Bisa Dansa!", "Ah Basah-Basah!", "Selfi Di Warung", "Dingin, pengen yang anget!", "Bolos Ke Kantin"],
    portraitNames: ["Portrait †Ðαjjαし•†", "Portrait †Veyしorα•†"],
    openPhoto: "Buka foto",
    closePhoto: "Tutup foto",
    previousPhoto: "Foto sebelumnya",
    nextPhoto: "Foto berikutnya",
    slideLabel: "Slide",
    whisperTitle: "Sini aku bisikin",
    whisperSubtitle: "Come Closer, Let Me Whisper",
    whisperGroup: "A LITTLE SECRET",
    whisperHint: "A voice note, just for you.",
    whisperPlaying: "Veylora sedang membisikkan sesuatu…",
    whisperEnded: "Some whispers are too sweet to forget. ❤️",
    whisperPlay: "Putar bisikan",
    whisperPause: "Jeda bisikan",
    whisperError: "Voice note belum tersedia atau gagal diputar.",
  },
  en: {
    eyebrow: "A DAJJAL FAMILY STORY",
    title: "DAJJAL",
    connector: "×",
    partner: "VEYLORA",
    subtitle: "Two different elements, yet why do they always want to be close? ❤️",
    intro: "Welcome to the world of Dajjal and Veylora, where the ruthless slayer meets the soft-hearted one, and even the simplest moments can turn into precious memories.",
    identityLabel: "CHARACTER IDENTITIES",
    dajjalTitle: "Dajjal",
    veyloraTitle: "Veylora",
    dajjalRole: "THE CRIMSON TROUBLEMAKER",
    veyloraRole: "THE AZURE SWEETHEART",
    dajjalDescription: "His gaze may seem cold, his presence intimidating, and don't even get me started on his reputation. 😈",
    veyloraDescription: "When she misses someone, she could freeze the entire planet. She was supposed to play Darkwar Survival, but somehow ended up playing Whiteout Survival instead. 🤭",
    storyEyebrow: "OUR LITTLE STORY",
    storyTitle: "Two worlds, one story that keeps unfolding. ❤️",
    storyText: "Who would've thought that two characters with such different personalities and worlds could share so many stories together? There is laughter, mischief, little dramas, and of course… a little chaos. But that's exactly what makes Dajjal and Veylora's journey so special. And their story isn't over yet. 🥰",
    signature: "Two characters, one story, and so many pages yet to be written. ❤️",
    footer: "DAJJAL FAMILY · COUPLE PROFILE",
    anniversaryLabel: "THIS LONG TOGETHER, AND STILL CHOOSING EACH OTHER ❤️",
    anniversaryIntro: "Every second has a story. Every day brings a memory. And our journey is still unfolding. 🥰",
    timeUnits: ["Days", "Hours", "Minutes", "Seconds"],
    visualEyebrow: "THEIR SIGNATURE LOOKS",
    visualTitle: "Different styles, equally captivating. ✨",
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
    galleryEyebrow: "OUR LITTLE WORLD",
    galleryTitle: "A collection of moments we’ll never forget. ❤️",
    galleryIntro: "From silly antics to sweet moments, every little thing has its own story. These are little glimpses into Dajjal and Veylora's world. Sometimes romantic, sometimes tearful, sometimes cheesy, and sometimes a little crazy… but always memorable. 🤭",
    momentsLabel: "OUR CHAOTIC MOMENTS",
    portraitLabel: "THEIR ICONIC PORTRAITS",
    momentNames: ["Veylora Is Tired of Walking", "I Can't Dance!", "Oh, We're Soaked!", "Selfie at the Food Stall", "It's Cold, I Want Something Warm!", "Skipping Class to Go to the Canteen"],
    portraitNames: ["Portrait †Ðαjjαし•†", "Portrait †Veyしorα•†"],
    openPhoto: "Open photo",
    closePhoto: "Close photo",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    slideLabel: "Slide",
    whisperTitle: "Come Closer, Let Me Whisper",
    whisperSubtitle: "Sini aku bisikin",
    whisperGroup: "A LITTLE SECRET",
    whisperHint: "A voice note, just for you.",
    whisperPlaying: "Veylora is whispering something…",
    whisperEnded: "Some whispers are too sweet to forget. ❤️",
    whisperPlay: "Play the whisper",
    whisperPause: "Pause the whisper",
    whisperError: "The voice note is unavailable or could not be played.",
  },
};

const relationshipStart = new Date("2026-09-09T21:33:00+07:00").getTime();

function getRelationshipTime() {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - relationshipStart) / 1000));
  return [
    Math.floor(elapsedSeconds / 86400),
    Math.floor((elapsedSeconds % 86400) / 3600),
    Math.floor((elapsedSeconds % 3600) / 60),
    elapsedSeconds % 60,
  ];
}

export default function CoupleProfilePage() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const [activePhoto, setActivePhoto] = useState(null);
  const whisperAudioRef = useRef(null);
  const [whisperStatus, setWhisperStatus] = useState("idle");
  const momentsTrackRef = useRef(null);
  const [activeMoment, setActiveMoment] = useState(0);
  const [relationshipTime, setRelationshipTime] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const updateRelationshipTime = () => setRelationshipTime(getRelationshipTime());
    updateRelationshipTime();
    const intervalId = window.setInterval(updateRelationshipTime, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const scrollToMoment = (index) => {
    const track = momentsTrackRef.current;
    const slide = track?.children[index];
    if (!track || !slide) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetLeft = slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({
      left: targetLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const handleMomentsScroll = () => {
    const track = momentsTrackRef.current;
    if (!track) return;
    const trackLeft = track.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveMoment((current) => current === closestIndex ? current : closestIndex);
  };

  useEffect(() => {
    return () => {
      whisperAudioRef.current?.pause();
      whisperAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activePhoto) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        whisperAudioRef.current?.pause();
        whisperAudioRef.current = null;
        setWhisperStatus("idle");
        setActivePhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto]);

  const stopWhisper = () => {
    const audio = whisperAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      whisperAudioRef.current = null;
    }
    setWhisperStatus("idle");
  };

  const closePhoto = () => {
    stopWhisper();
    setActivePhoto(null);
  };

  const openPhoto = (src, alt) => {
    stopWhisper();
    setActivePhoto({ src, alt });
  };

  const playWhisper = () => {
    stopWhisper();
    const audio = new Audio("/audio/whispera.m4a");
    audio.preload = "auto";
    whisperAudioRef.current = audio;
    audio.addEventListener("ended", () => {
      if (whisperAudioRef.current === audio) setWhisperStatus("ended");
    }, { once: true });
    audio.addEventListener("error", () => {
      if (whisperAudioRef.current === audio) setWhisperStatus("error");
    }, { once: true });
    setWhisperStatus("playing");
    audio.play().catch(() => {
      if (whisperAudioRef.current === audio) setWhisperStatus("error");
    });
  };

  const openWhisper = () => {
    setActivePhoto({
      src: "https://drive.google.com/thumbnail?id=1yn6CR6e2A6N3a3yCEgy6QboDWeeVWxgT&sz=w1200",
      alt: t.whisperTitle,
      isWhisper: true,
    });
    playWhisper();
  };

  return (
    <main className="df-couple-page" data-theme-palette="couple">
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
            <span>{t.featuredLabel}</span>
          </button>
          <div className="df-couple-anniversary-heading">
            <p className="df-couple-eyebrow">{t.anniversaryLabel}</p>
            <p className="df-couple-intro">{t.anniversaryIntro}</p>
          </div>
          <section className="df-couple-metrics" aria-label={t.anniversaryLabel}>
            {relationshipTime.map((value, index) => (
              <div className="df-couple-metric" key={t.timeUnits[index]}>
                <strong>{value.toLocaleString(language === "en" ? "en-US" : "id-ID")}</strong>
                <span>{t.timeUnits[index]}</span>
              </div>
            ))}
          </section>
        </header>

        <CoupleMusicPlayer />

        <section className="df-couple-section" aria-labelledby="df-couple-identities">
          <div className="df-couple-section-heading">
            <p className="df-couple-eyebrow">{t.identityLabel}</p>
            <h2 id="df-couple-identities">{t.dajjalTitle} &amp; {t.veyloraTitle}</h2>
          </div>
          <div className="df-couple-character-grid">
            <article className="df-couple-character-card" data-character="dajjal">
              <div className="df-couple-character-heading">
                <p className="df-couple-character-role">{t.dajjalRole}</p>
              </div>
              <div className="df-couple-character-body">
                <button className="df-couple-character-art" type="button" onClick={() => openPhoto(photos.dajjal, t.dajjalTitle)} aria-label={t.openPhoto + ": " + t.dajjalTitle}>
                  <img src={photos.dajjal} alt={t.dajjalTitle + " character render"} loading="lazy" />
                </button>
                <div className="df-couple-character-copy">
                  <h3>{t.dajjalTitle}</h3>
                  <p>{t.dajjalDescription}</p>
                </div>
              </div>
              <span className="df-couple-character-index" aria-hidden="true">01</span>
            </article>
            <article className="df-couple-character-card" data-character="veylora">
              <div className="df-couple-character-heading">
                <p className="df-couple-character-role">{t.veyloraRole}</p>
              </div>
              <div className="df-couple-character-body">
                <button className="df-couple-character-art" type="button" onClick={() => openPhoto(photos.veylora, t.veyloraTitle)} aria-label={t.openPhoto + ": " + t.veyloraTitle}>
                  <img src={photos.veylora} alt={t.veyloraTitle + " character render"} loading="lazy" />
                </button>
                <div className="df-couple-character-copy">
                  <h3>{t.veyloraTitle}</h3>
                  <p>{t.veyloraDescription}</p>
                </div>
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
            <div className="df-couple-moments-carousel" role="region" aria-roledescription="carousel" aria-label={t.momentsLabel}>
              <div className="df-couple-moments-controls">
                <span className="df-couple-moments-count" aria-live="polite">
                  {String(activeMoment + 1).padStart(2, "0")} / {String(photos.moments.length).padStart(2, "0")}
                </span>
                <div className="df-couple-moments-arrows">
                  <button
                    className="df-couple-moments-arrow"
                    type="button"
                    onClick={() => scrollToMoment(Math.max(0, activeMoment - 1))}
                    disabled={activeMoment === 0}
                    aria-label={t.previousPhoto}
                  >
                    <span aria-hidden="true">‹</span>
                  </button>
                  <button
                    className="df-couple-moments-arrow"
                    type="button"
                    onClick={() => scrollToMoment(Math.min(photos.moments.length - 1, activeMoment + 1))}
                    disabled={activeMoment === photos.moments.length - 1}
                    aria-label={t.nextPhoto}
                  >
                    <span aria-hidden="true">›</span>
                  </button>
                </div>
              </div>
              <div
                className="df-couple-moments-track"
                ref={momentsTrackRef}
                onScroll={handleMomentsScroll}
                aria-label={t.momentsLabel}
                tabIndex={0}
              >
                {photos.moments.map((src, index) => (
                  <button className="df-couple-gallery-item" type="button" key={src} aria-label={t.openPhoto + ": " + t.momentNames[index] + " (" + (index + 1) + " of " + photos.moments.length + ")"} onClick={() => openPhoto(src, t.momentNames[index])}>
                    <img src={src} alt={t.momentNames[index] + " — Dajjal and Veylora"} loading="lazy" />
                    <span>{t.momentNames[index]}</span>
                  </button>
                ))}
              </div>
              <div className="df-couple-moments-pagination" aria-label={t.momentsLabel}>
                {photos.moments.map((src, index) => (
                  <button
                    key={src}
                    className="df-couple-moments-dot"
                    type="button"
                    onClick={() => scrollToMoment(index)}
                    aria-label={t.slideLabel + " " + (index + 1) + ": " + t.momentNames[index]}
                    aria-current={activeMoment === index ? "true" : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="df-couple-gallery-group">
            <h3>{t.portraitLabel}</h3>
            <div className="df-couple-portraits-grid">
              <button className="df-couple-portrait-item" type="button" onClick={openWhisper} aria-label={t.openPhoto + ": " + t.whisperTitle}>
                <img src="https://drive.google.com/thumbnail?id=1yn6CR6e2A6N3a3yCEgy6QboDWeeVWxgT&sz=w1200" alt={t.whisperTitle} loading="lazy" />
                <span>{t.whisperTitle}</span>
              </button>
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
          <button className="df-couple-lightbox-backdrop" type="button" onClick={closePhoto} aria-label={t.closePhoto} />
          <div className="df-couple-lightbox-panel" role="dialog" aria-modal="true" aria-label={activePhoto.alt} onClick={(event) => event.stopPropagation()}>
            <button className="df-couple-lightbox-close" type="button" onClick={closePhoto} aria-label={t.closePhoto}>×</button>
            {activePhoto.isWhisper ? (
              <div className="df-couple-whisper-scene" data-audio-state={whisperStatus}>
                <img src={activePhoto.src} alt={activePhoto.alt} />
                <div className="df-couple-whisper-overlay" aria-live="polite">
                  <svg className="df-couple-whisper-mark" viewBox="0 0 64 64" aria-hidden="true">
                    <path d="M10 35c8-1 12-6 16-15 2-4 6-4 7 1l-2 8c7-5 13-7 18-6 4 1 5 5 2 8-6 7-13 12-24 13H16" />
                    <path d="M42 13c4 1 7 4 8 8M48 7c7 2 11 7 13 13" />
                    <path d="M8 45c5 3 10 4 16 4" />
                  </svg>
                  <h2>{t.whisperTitle}</h2>
                  <p className="df-couple-whisper-subtitle">{t.whisperSubtitle}</p>
                  <div className="df-couple-whisper-heart" aria-hidden="true">
                    <svg viewBox="0 0 64 64">
                      <path d="M32 53S8 39 8 22C8 10 23 5 32 18 41 5 56 10 56 22c0 17-24 31-24 31Z" />
                      <path className="df-couple-heartbeat-line" d="M8 32h13l6-11 9 23 7-12h13" />
                    </svg>
                  </div>
                  <p className="df-couple-whisper-status">
                    {whisperStatus === "playing" ? t.whisperPlaying : whisperStatus === "ended" ? t.whisperEnded : whisperStatus === "error" ? t.whisperError : t.whisperHint}
                  </p>
                  <button className="df-couple-whisper-control" type="button" onClick={() => {
                    if (whisperStatus === "playing" && whisperAudioRef.current) {
                      whisperAudioRef.current.pause();
                      setWhisperStatus("paused");
                    } else if (whisperStatus === "paused" && whisperAudioRef.current) {
                      whisperAudioRef.current.play().then(() => setWhisperStatus("playing")).catch(() => setWhisperStatus("error"));
                    } else {
                      playWhisper();
                    }
                  }}>
                    {whisperStatus === "playing" ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM14 5h3v14h-3z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>
                    )}
                    <span>{whisperStatus === "playing" ? t.whisperPause : t.whisperPlay}</span>
                  </button>
                  <svg className="df-couple-whisper-wave" viewBox="0 0 120 24" aria-hidden="true">
                    <path d="M2 12h8l4-8 6 16 7-13 6 10 6-5h7l5-9 6 17 7-12 5 8 5-4h8l5-8 6 16 6-10 5 6h8" />
                  </svg>
                </div>
              </div>
            ) : (
              <>
                <img src={activePhoto.src} alt={activePhoto.alt} />
                <p>{activePhoto.alt}</p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
