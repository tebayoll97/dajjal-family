"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPlayerContext } from "@/lib/playerAccount";
import { useLanguage } from "../components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";
import { useLoginModal } from "../components/LoginModalProvider";

const translations = {
  en: {
    eyebrow: "THE GAME LIBRARY",
    title: "CHOOSE YOUR",
    accent: "ADVENTURE",
    description: "Discover new worlds, take on challenges, and make your mark in the Dajjal Family gaming universe.",
    available: "PLAY NOW",
    mamah: "MAMAH NGAMUK",
    mamahDesc: "Escape Mamah Veylora, dodge oncoming traffic, collect coins, and beat your personal best.",
    mamahType: "ENDLESS DODGE · ACCOUNT GAME",
    mamahArt: "01 / SURVIVAL",
    jumpArt: "02 / ENDLESS RUN",
    errorEyebrow: "ERROR",
    mamahAccess: "GOOGLE ACCOUNT REQUIRED TO SAVE PROGRESS",
    jump: "RUN! FOREST FIRE!",
    jumpDesc: "Run as far as you can, leap over obstacles, and survive the burning forest. No sign-in required.",
    jumpType: "ENDLESS RUNNER · PUBLIC ARCADE",
    jumpAccess: "FREE TO PLAY · NO LOGIN REQUIRED",
    play: "PLAY NOW",
    wait: "PLEASE WAIT...",
    errorTitle: "SOMETHING WENT WRONG",
    error: "Unable to continue. Please try again.",
    close: "GOT IT",
  },
  id: {
    eyebrow: "PERPUSTAKAAN PERMAINAN",
    title: "PILIH",
    accent: "PETUALANGANMU",
    description: "Jelajahi dunia baru, hadapi tantangan, dan ukir pencapaianmu di universe gaming Dajjal Family.",
    available: "MAIN SEKARANG",
    mamah: "MAMAH NGAMUK",
    mamahDesc: "Kabur dari Mamah Veylora, hindari kendaraan yang melaju, kumpulkan koin, dan pecahkan rekor pribadimu.",
    mamahType: "HINDARI RINTANGAN · GAME AKUN",
    mamahArt: "01 / BERTAHAN HIDUP",
    jumpArt: "02 / LARI TANPA AKHIR",
    errorEyebrow: "KESALAHAN",
    mamahAccess: "AKUN GOOGLE DIPERLUKAN UNTUK MENYIMPAN PROGRES",
    jump: "LARI! KEBAKARAN HUTAN!",
    jumpDesc: "Berlari sejauh mungkin, lewati berbagai rintangan, dan selamat dari hutan yang terbakar. Tanpa perlu login.",
    jumpType: "LARI TANPA AKHIR · ARCADE PUBLIK",
    jumpAccess: "GRATIS DIMAINKAN · TANPA LOGIN",
    play: "MAIN SEKARANG",
    wait: "MOHON TUNGGU...",
    errorTitle: "TERJADI KESALAHAN",
    error: "Tidak dapat melanjutkan. Silakan coba lagi.",
    close: "MENGERTI",
  },
};

export default function GamesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { openLoginModal } = useLoginModal();
  const t = translations[language] || translations.id;
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  async function handlePlayMamah() {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user || session.user.is_anonymous) {
        openLoginModal({ reason: "game", next: withLocalePrefix("/games/mamah-ngamuk?splash=1", language) });
        return;
      }
      const context = await getPlayerContext();
      if (context.status === "ready" && context.accountType === "google") {
        router.push(withLocalePrefix("/games/mamah-ngamuk?splash=1", language));
        return;
      }
      openLoginModal({ reason: "game", next: withLocalePrefix("/games/mamah-ngamuk?splash=1", language) });
    } catch (error) {
      console.error("Mamah Ngamuk launch error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="df-games-page">
      <div className="df-games-atmosphere" aria-hidden="true" />
      <div className="df-games-content">
        <header className="df-games-intro">
          <p className="df-games-eyebrow">{t.eyebrow}</p>
          <h1>{t.title} <span>{t.accent}</span></h1>
          <p className="df-games-lead">{t.description}</p>
        </header>

        <section className="df-games-grid" aria-label={t.eyebrow}>
          <article className="df-library-card df-library-card-mamah">
            <div className="df-library-art df-library-art-mamah" aria-hidden="true">
              <span className="df-library-art-orbit" />
              <span className="df-library-art-symbol">🧹</span>
              <span className="df-library-art-chip">{t.mamahArt}</span>
            </div>
            <div className="df-library-card-body">
              <div className="df-library-card-meta">
                <span className="df-library-index">01</span>
                <span>{t.mamahType}</span>
              </div>
              <h2>{t.mamah}</h2>
              <p className="df-library-description">{t.mamahDesc}</p>
              <p className="df-library-access">{t.mamahAccess}</p>
              <button type="button" onClick={handlePlayMamah} disabled={loading} className="df-library-action">
                {loading ? t.wait : t.play}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>

          <article className="df-library-card df-library-card-run">
            <div className="df-library-art df-library-art-run" aria-hidden="true">
              <span className="df-library-art-orbit" />
              <span className="df-library-art-symbol">🏃</span>
              <span className="df-library-art-chip">{t.jumpArt}</span>
            </div>
            <div className="df-library-card-body">
              <div className="df-library-card-meta">
                <span className="df-library-index">02</span>
                <span>{t.jumpType}</span>
              </div>
              <h2>{t.jump}</h2>
              <p className="df-library-description">{t.jumpDesc}</p>
              <p className="df-library-access">{t.jumpAccess}</p>
              <Link href={withLocalePrefix("/games/run-jump", language)} className="df-library-action">
                {t.play}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        </section>
      </div>

      {showError && (
        <div className="df-games-dialog-backdrop" onClick={() => setShowError(false)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="games-error-title" className="df-games-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="df-games-dialog-icon df-games-error-icon" aria-hidden="true">!</div>
            <p className="df-games-dialog-eyebrow">{t.errorEyebrow}</p>
            <h2 id="games-error-title">{t.errorTitle}</h2>
            <p>{t.error}</p>
            <button type="button" onClick={() => setShowError(false)} className="df-games-action-close">{t.close}</button>
          </section>
        </div>
      )}
    </main>
  );
}
