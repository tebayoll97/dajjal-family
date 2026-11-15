"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";
import ThemeToggle from "./ThemeToggle";
import AccountEntry from "./AccountEntry";
import audioEngine from "@/lib/audio/AudioEngine";
import { getAudioSettings, saveAudioSettings } from "@/lib/audio/audioSettings";

const copy = {
  en: { home: "Home", games: "Games", profile: "Profile", admin: "Admin", settings: "Settings", language: "Language", musicOn: "Turn background music off", musicOff: "Turn background music on" },
  id: { home: "Beranda", games: "Game", profile: "Profil", admin: "Admin", settings: "Pengaturan", language: "Bahasa", musicOn: "Matikan musik latar", musicOff: "Nyalakan musik latar" },
};

export default function Header() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.id;
  const [isAdmin, setIsAdmin] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    const settings = getAudioSettings();
    setMusicEnabled(settings.musicEnabled);
    audioEngine.setMuted(false);
    audioEngine.setMusicVolume(settings.musicEnabled ? settings.musicVolume : 0);
    audioEngine.setSfxVolume(settings.sfxEnabled ? settings.sfxVolume : 0);
    setAudioLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;
    async function checkAdmin(session) {
      if (!session?.access_token) {
        if (active) setIsAdmin(false);
        return;
      }
      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json();
        if (active) setIsAdmin(response.ok && result.success === true);
      } catch (error) {
        console.error("Admin check failed:", error);
        if (active) setIsAdmin(false);
      }
    }
    async function initialize() {
      const { data: { session } } = await supabaseAdminClient.auth.getSession();
      await checkAdmin(session);
    }
    initialize();
    const { data: { subscription } } = supabaseAdminClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        return;
      }
      if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) checkAdmin(session);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  function toggleMusic() {
    if (!audioLoaded) return;
    const current = getAudioSettings();
    const nextEnabled = !current.musicEnabled;
    const updated = { ...current, musicEnabled: nextEnabled };
    saveAudioSettings(updated);
    setMusicEnabled(nextEnabled);
    audioEngine.setMuted(false);
    audioEngine.setMusicVolume(nextEnabled ? updated.musicVolume : 0);
    if (nextEnabled) audioEngine.startMusic();
    else audioEngine.stopMusic();
  }

  const navLinks = [
    { label: t.home, href: withLocalePrefix("/", language), route: "/" },
    { label: t.games, href: withLocalePrefix("/games", language), route: "/games" },
    { label: t.profile, href: withLocalePrefix("/profile", language), route: "/profile" },
    ...(isAdmin ? [{ label: t.admin, href: withLocalePrefix("/admin", language), route: "/admin" }] : []),
  ];

  function isActive(route) {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  }

  return (
    <header className="df-site-header">
      <div className="df-site-header-inner">
        <Link href={withLocalePrefix("/", language)} className="df-site-brand" aria-label="Dajjal Family home">
          <span className="df-site-brand-mark" aria-hidden="true">DF</span>
          <span className="df-site-brand-copy">
            <strong>DAJJAL FAMILY</strong>
            <small>ONE FAMILY. MANY POSSIBILITIES.</small>
          </span>
        </Link>

        <nav className="df-site-nav" aria-label={language === "id" ? "Navigasi utama" : "Main navigation"}>
          {navLinks.map((item) => (
            <Link key={item.route} href={item.href} aria-current={isActive(item.route) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="df-site-actions">
          <div className="df-site-language" role="group" aria-label={t.language}>
            <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"}>ID</button>
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
          <button className="df-site-icon-button" type="button" onClick={toggleMusic} disabled={!audioLoaded}
            aria-label={musicEnabled ? t.musicOn : t.musicOff} aria-pressed={musicEnabled} title="Background music">
            <span aria-hidden="true">{musicEnabled ? "♫" : "♪"}</span>
          </button>
          <ThemeToggle />
          <Link className="df-site-icon-button" href={withLocalePrefix("/settings", language)} aria-label={t.settings} title={t.settings}>⚙</Link>
          <span className="df-site-account"><AccountEntry /></span>
        </div>
      </div>
    </header>
  );
}
