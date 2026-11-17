"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPlayerContext } from "@/lib/playerAccount";
import { useLanguage } from "../components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

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
    accountTitle: "GOOGLE LOGIN REQUIRED",
    accountDesc: "MAMAH NGAMUK needs a Google account to save your coins and Best Distance securely.",
    google: "SIGN IN WITH GOOGLE",
    openingGoogle: "OPENING GOOGLE...",
    cancel: "CANCEL",
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
    accountTitle: "LOGIN GOOGLE DIPERLUKAN",
    accountDesc: "MAMAH NGAMUK membutuhkan akun Google agar koin dan Best Distance kamu tersimpan dengan aman.",
    google: "LOGIN DENGAN GOOGLE",
    openingGoogle: "MEMBUKA GOOGLE...",
    cancel: "BATAL",
  },
};

export default function GamesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.id;
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function handlePlayMamah() {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user || session.user.is_anonymous) {
        setShowGooglePrompt(true);
        return;
      }
      const context = await getPlayerContext();
      if (context.status === "ready" && context.accountType === "google") {
        router.push(withLocalePrefix("/games/mamah-ngamuk?splash=1", language));
        return;
      }
      setShowGooglePrompt(true);
    } catch (error) {
      console.error("Mamah Ngamuk launch error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLoginFromPrompt() {
    if (googleBusy) return;
    setGoogleBusy(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const nextPath = withLocalePrefix("/games/mamah-ngamuk?splash=1", language);
      const redirectTo = `${window.location.origin}${withLocalePrefix("/login", language)}?next=${encodeURIComponent(nextPath)}`;
      const options = { redirectTo, queryParams: { access_type: "offline", prompt: "select_account" } };
      if (session?.user?.is_anonymous) {
        const { error } = await supabase.auth.linkIdentity({ provider: "google", options });
        if (error) throw error;
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options });
      if (error) throw error;
    } catch (error) {
      console.error("Google login from Game Library failed:", error);
      setGoogleBusy(false);
      setShowError(true);
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
              <span className="df-library-art-chip">01 / SURVIVAL</span>
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
              <span className="df-library-art-chip">02 / ENDLESS RUN</span>
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

      {showGooglePrompt && (
        <div className="df-games-dialog-backdrop" onClick={() => setShowGooglePrompt(false)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="mamah-google-title" className="df-games-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="df-games-dialog-icon" aria-hidden="true">🔐</div>
            <p className="df-games-dialog-eyebrow">ACCOUNT ACCESS</p>
            <h2 id="mamah-google-title">{t.accountTitle}</h2>
            <p>{t.accountDesc}</p>
            <button type="button" onClick={handleGoogleLoginFromPrompt} disabled={googleBusy} className="df-games-google-action">
              <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.45 9.5 24 9.5z" transform="translate(0 4)"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.95 46.98 31.75 46.98 24.55z"/><path fill="#FBBC05" d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.48-6.19z" transform="translate(0 4)"/><path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.93-5.8l-7.73-6c-2.14 1.45-4.87 2.3-8.2 2.3-6.55 0-12.07-4.22-14.04-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -4)"/></svg>
              {googleBusy ? t.openingGoogle : t.google}
            </button>
            <button type="button" onClick={() => setShowGooglePrompt(false)} disabled={googleBusy} className="df-games-cancel">{t.cancel}</button>
          </section>
        </div>
      )}

      {showError && (
        <div className="df-games-dialog-backdrop" onClick={() => setShowError(false)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="games-error-title" className="df-games-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="df-games-dialog-icon df-games-error-icon" aria-hidden="true">!</div>
            <p className="df-games-dialog-eyebrow">ERROR</p>
            <h2 id="games-error-title">{t.errorTitle}</h2>
            <p>{t.error}</p>
            <button type="button" onClick={() => setShowError(false)} className="df-games-action-close">{t.close}</button>
          </section>
        </div>
      )}
    </main>
  );
}
