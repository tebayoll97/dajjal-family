"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";
import "./CoupleCreatePromo.css";

export default function CoupleCreatePromo({ profileSlug = "", locale = "id" } = {}) {
  const { language } = useLanguage();
  const en = language === "en";
  const [status, setStatus] = useState("");

  async function shareProfile() {
    const publicPath = profileSlug
      ? `/${locale === "en" ? "en" : "id"}/couple/${encodeURIComponent(profileSlug)}`
      : window.location.pathname + window.location.search + window.location.hash;
    const url = new URL(publicPath, window.location.origin).toString();
    const title = en ? "Our Couple Profile" : "Profil Pasangan Kami";
    const text = en ? "Take a look at our Couple Profile." : "Lihat profil pasangan kami.";
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setStatus(en ? "Share sheet opened." : "Menu berbagi dibuka.");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setStatus(en ? "Profile link copied." : "Tautan profil berhasil disalin.");
        return;
      }
      window.prompt(en ? "Copy this profile link:" : "Salin tautan profil ini:", url);
      setStatus(en ? "Copy the link to share your profile." : "Salin tautan untuk membagikan profil.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStatus(en ? "Unable to share automatically. Copy the page URL from your browser." : "Tidak dapat membagikan otomatis. Salin URL halaman dari browser.");
      }
    }
  }

  return (
    <section className="df-couple-create-promo" aria-labelledby="df-couple-create-promo-title">
      <div className="df-couple-create-promo-copy">
        <p className="df-couple-eyebrow">DAJJAL FAMILY · COUPLE PROFILE</p>
        <h2 id="df-couple-create-promo-title">{en ? "Create your couple profile!" : "Ayo buat profil pasanganmu!"}</h2>
        <p>{en ? "Create a personal page to keep your story and favorite moments together." : "Buat halaman pribadi untuk menyimpan cerita dan momen spesial kalian bersama."}</p>
      </div>
      <div className="df-couple-create-promo-actions">
        <Link className="df-couple-create-promo-primary" href={withLocalePrefix("/df/profile-couple-maker", language)}>
          {en ? "Create Couple Profile" : "Buat Profil Pasangan"}
        </Link>
        <button className="df-couple-create-promo-share" type="button" onClick={shareProfile}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2"/></svg>
          {en ? "Share Profile" : "Bagikan Profil"}
        </button>
      </div>
      <p className="df-couple-create-promo-status" role="status" aria-live="polite">{status}</p>
    </section>
  );
}
