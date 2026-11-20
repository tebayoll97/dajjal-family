"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import "./music-public.css";

const copy = {
  id: {
    eyebrow: "DAJJAL FAMILY · MUSIC",
    title: "Music Library",
    intro: "Temukan dan dengarkan musik pilihan dari DAJJAL FAMILY.",
    search: "Cari judul, artis, atau genre...",
    play: "Putar", pause: "Jeda", empty: "Belum ada musik yang dipublikasikan.",
    emptyHint: "Katalog akan menampilkan musik setelah admin menerbitkannya.",
    loading: "Memuat katalog musik...", error: "Katalog musik belum dapat dimuat.",
    now: "SEDANG DIPUTAR", all: "Semua musik", noArtist: "Artis tidak dicantumkan",
  },
  en: {
    eyebrow: "DAJJAL FAMILY · MUSIC",
    title: "Music Library",
    intro: "Discover and listen to selected music from DAJJAL FAMILY.",
    search: "Search title, artist, or genre...",
    play: "Play", pause: "Pause", empty: "No published music yet.",
    emptyHint: "Tracks will appear here after an admin publishes them.",
    loading: "Loading music catalog...", error: "The music catalog could not be loaded.",
    now: "NOW PLAYING", all: "All music", noArtist: "Artist not listed",
  },
};

function clock(value) {
  const seconds = Number(value) || 0;
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

export default function PublicMusicPage() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const audioRef = useRef(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [activeId, setActiveId] = useState("");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/music", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || t.error);
        if (active) setItems(result.items || []);
      } catch (error) {
        if (active) setNotice(error.message || t.error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [t.error]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = () => setCurrentTime(audio.currentTime || 0);
    const meta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);
    const ended = () => setPlaying(false);
    audio.addEventListener("timeupdate", time);
    audio.addEventListener("loadedmetadata", meta);
    audio.addEventListener("durationchange", meta);
    audio.addEventListener("play", play);
    audio.addEventListener("pause", pause);
    audio.addEventListener("ended", ended);
    return () => {
      audio.removeEventListener("timeupdate", time);
      audio.removeEventListener("loadedmetadata", meta);
      audio.removeEventListener("durationchange", meta);
      audio.removeEventListener("play", play);
      audio.removeEventListener("pause", pause);
      audio.removeEventListener("ended", ended);
    };
  }, []);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => [item.title, item.artist, item.genre, ...(item.tags || [])].some((value) => String(value || "").toLowerCase().includes(q)));
  }, [items, query]);

  async function selectTrack(item) {
    const audio = audioRef.current;
    if (!audio) return;
    if (activeId === item.id) {
      if (audio.paused) {
        try { await audio.play(); } catch { setNotice(t.error); }
      } else audio.pause();
      return;
    }
    setActiveId(item.id);
    setCurrentTime(0);
    setDuration(Number(item.audio_duration_seconds) || 0);
    audio.src = "/api/music/" + item.id + "/stream";
    audio.load();
    try { await audio.play(); setNotice(""); }
    catch { setNotice(t.error); }
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Number(event.target.value);
    setCurrentTime(audio.currentTime);
  }

  const activeTrack = items.find((item) => item.id === activeId);

  return (
    <main className="music-public-page">
      <div className="music-public-shell">
        <header className="music-public-header">
          <p className="music-public-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </header>

        <section className="music-public-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </section>

        {notice && <p className="music-public-notice" role="alert">{notice}</p>}
        {loading ? <p className="music-public-state">{t.loading}</p> : visibleItems.length === 0 ? (
          <section className="music-public-empty"><span>♫</span><h2>{t.empty}</h2><p>{t.emptyHint}</p></section>
        ) : (
          <section className="music-public-list" aria-label={t.all}>
            {visibleItems.map((item) => (
              <article className={"music-public-item" + (activeId === item.id ? " is-active" : "")} key={item.id}>
                {item.cover_mime_type ? (
                  <img className="music-public-cover" src={"/api/music/" + item.id + "/cover"} alt="" loading="lazy" />
                ) : <div className="music-public-cover music-public-cover-fallback" aria-hidden="true">♫</div>}
                <div className="music-public-track">
                  <h2>{item.title}</h2>
                  <p>{item.artist || t.noArtist} · {item.genre}</p>
                  <span>{clock(item.audio_duration_seconds)}</span>
                </div>
                <button type="button" className="music-public-play" onClick={() => selectTrack(item)} aria-label={(activeId === item.id && playing ? t.pause : t.play) + " " + item.title}>
                  {activeId === item.id && playing ? "Ⅱ" : "▶"}
                </button>
              </article>
            ))}
          </section>
        )}

        {activeTrack && (
          <section className="music-public-player" aria-label={t.now}>
            <div className="music-public-player-top"><span>{t.now}</span><strong>{activeTrack.title}</strong></div>
            <input type="range" min="0" max={Math.max(1, duration || activeTrack.audio_duration_seconds || 1)} step="1" value={Math.min(currentTime, duration || activeTrack.audio_duration_seconds || 1)} onChange={seek} aria-label="Seek music" />
            <div className="music-public-times"><span>{clock(currentTime)}</span><span>{clock(duration || activeTrack.audio_duration_seconds)}</span></div>
          </section>
        )}
        <audio ref={audioRef} preload="none" />
      </div>
    </main>
  );
}
