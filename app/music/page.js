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
    play: "Putar", pause: "Jeda", previous: "Lagu sebelumnya", next: "Lagu berikutnya",
    empty: "Belum ada musik yang dipublikasikan.",
    emptyHint: "Katalog akan menampilkan musik setelah admin menerbitkannya.",
    loading: "Memuat katalog musik...", error: "Musik tidak dapat diputar. Periksa koneksi lalu coba lagi.",
    now: "SEDANG DIPUTAR", all: "DAFTAR LAGU", noArtist: "Artis tidak dicantumkan",
    volume: "Volume", seek: "Posisi lagu", track: "LAGU",
  },
  en: {
    eyebrow: "DAJJAL FAMILY · MUSIC",
    title: "Music Library",
    intro: "Discover and listen to selected music from DAJJAL FAMILY.",
    search: "Search title, artist, or genre...",
    play: "Play", pause: "Pause", previous: "Previous track", next: "Next track",
    empty: "No published music yet.",
    emptyHint: "Tracks will appear here after an admin publishes them.",
    loading: "Loading music catalog...", error: "Music could not be played. Check your connection and try again.",
    now: "NOW PLAYING", all: "PLAYLIST", noArtist: "Artist not listed",
    volume: "Volume", seek: "Track position", track: "TRACK",
  },
};

function clock(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
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
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/music", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || t.error);
        if (active) setItems(Array.isArray(result.items) ? result.items : []);
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
    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onError = () => { if (audio.src) { setPlaying(false); setNotice(t.error); } };
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [t.error]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = repeat;
    }
  }, [volume, repeat]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.artist, item.genre, ...(item.tags || [])]
        .some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, query]);

  const activeTrack = items.find((item) => item.id === activeId) || null;
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const progressDuration = duration || Number(activeTrack?.audio_duration_seconds) || 0;

  async function playTrack(item) {
    const audio = audioRef.current;
    if (!audio || !item) return;
    if (activeId === item.id) {
      if (audio.paused) {
        try { await audio.play(); setNotice(""); }
        catch { setNotice(t.error); }
      } else audio.pause();
      return;
    }
    setActiveId(item.id);
    setCurrentTime(0);
    setDuration(Number(item.audio_duration_seconds) || 0);
    setNotice("");
    audio.src = "/api/music/" + encodeURIComponent(item.id) + "/stream";
    audio.load();
    try { await audio.play(); }
    catch { setNotice(t.error); }
  }

  async function moveTrack(step) {
    if (!items.length) return;
    const nextIndex = activeIndex < 0
      ? (step > 0 ? 0 : items.length - 1)
      : shuffle && step > 0 && items.length > 1
        ? (() => { const choices = items.map((_, index) => index).filter((index) => index !== activeIndex); return choices[Math.floor(Math.random() * choices.length)]; })()
        : (activeIndex + step + items.length) % items.length;
    await playTrack(items[nextIndex]);
  }

  function toggleFavorite() {
    if (!activeTrack) return;
    setFavoriteIds((current) => current.includes(activeTrack.id)
      ? current.filter((id) => id !== activeTrack.id)
      : [...current, activeTrack.id]);
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio || !progressDuration) return;
    audio.currentTime = Number(event.target.value);
    setCurrentTime(audio.currentTime);
  }

  return (
    <main className="music-public-page df-token-page">
      <div className="music-public-shell ui-page">
        <header className="music-public-header ui-page-header">
          <p className="music-public-eyebrow ui-eyebrow">{t.eyebrow}</p>
          <h1 className="ui-heading-h1">{t.title}</h1>
          <p className="ui-subtitle">{t.intro}</p>
        </header>

        <section className="music-public-search" aria-label={t.search}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </section>

        {notice && <p className="music-public-notice" role="alert">{notice}</p>}

        {loading ? <p className="music-public-state">{t.loading}</p> : visibleItems.length === 0 ? (
          <section className="music-public-empty">
            <span aria-hidden="true">♫</span><h2>{t.empty}</h2><p>{t.emptyHint}</p>
          </section>
        ) : (
          <>
            <section className="music-public-feature" aria-label={t.now}>
              <div className="music-public-artwork">
                {activeTrack?.cover_mime_type ? (
                  <img key={activeTrack.id} src={"/api/music/" + activeTrack.id + "/cover"} alt={activeTrack.title + " cover"} />
                ) : (
                  <div className="music-public-artwork-fallback" aria-hidden="true">♫</div>
                )}
                <span>DF MUSIC</span>
              </div>

              <div className="music-public-player-content">
                <div className="music-public-track-meta">
                  <span>{activeTrack ? t.track + " " + String(activeIndex + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0") : t.now}</span>
                  <span>{activeTrack?.genre || "DAJJAL FAMILY"}</span>
                </div>
                <div className="music-public-title-group">
                  <div className="music-public-title-row">
                    <div className={"music-public-title-marquee" + ((activeTrack?.title || t.title).length > 24 ? " is-long" : "")}>
                      <h2 key={activeTrack?.id || "empty"}><span>{activeTrack?.title || t.title}</span><span aria-hidden="true">{activeTrack?.title || t.title}</span></h2>
                    </div>
                    <button className={"music-public-favorite" + (activeTrack && favoriteIds.includes(activeTrack.id) ? " is-favorite" : "")} type="button" onClick={toggleFavorite} disabled={!activeTrack} aria-label="Toggle favorite">
                      {activeTrack && favoriteIds.includes(activeTrack.id) ? "♥" : "♡"}
                    </button>
                  </div>
                  <p>{activeTrack ? (activeTrack.artist || t.noArtist) : t.intro}</p>
                </div>
                <div className="music-public-progress">
                  <input type="range" min="0" max={Math.max(1, progressDuration)} step="1"
                    value={Math.min(currentTime, progressDuration || 0)} onChange={seek}
                    disabled={!activeTrack || !progressDuration} aria-label={t.seek}
                    style={{ "--music-progress": progressDuration ? (currentTime / progressDuration) * 100 + "%" : "0%" }} />
                  <div className="music-public-times"><span>{clock(currentTime)}</span><span>{clock(progressDuration)}</span></div>
                </div>
                <div className="music-public-controls">
                  <button className={"music-public-mode" + (shuffle ? " is-enabled" : "")} type="button" onClick={() => setShuffle((value) => !value)} aria-pressed={shuffle} aria-label="Shuffle">⤨</button>
                  <button type="button" onClick={() => moveTrack(-1)} disabled={!items.length} aria-label={t.previous}>|‹</button>
                  <button className="music-public-main-play" type="button" onClick={() => activeTrack ? playTrack(activeTrack) : moveTrack(1)} disabled={!items.length} aria-label={playing ? t.pause : t.play}>{playing ? "Ⅱ" : "▶"}</button>
                  <button type="button" onClick={() => moveTrack(1)} disabled={!items.length} aria-label={t.next}>›|</button>
                  <button className={"music-public-mode" + (repeat ? " is-enabled" : "")} type="button" onClick={() => setRepeat((value) => !value)} aria-pressed={repeat} aria-label="Repeat">↻</button>
                </div>
                <label className="music-public-volume"><span aria-hidden="true">♪</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label={t.volume} /></label>
              </div>
            </section>

            <section className="music-public-playlist" aria-label={t.all}>
              <div className="music-public-playlist-heading">
                <h2>{t.all}</h2><span>{visibleItems.length} / {items.length}</span>
              </div>
              {visibleItems.map((item) => {
                const active = item.id === activeId;
                return (
                  <button className={"music-public-track" + (active ? " is-active" : "")}
                    type="button" key={item.id} onClick={() => playTrack(item)}
                    aria-current={active ? "true" : undefined}>
                    <span className="music-public-track-number">{String(items.findIndex((entry) => entry.id === item.id) + 1).padStart(2, "0")}</span>
                    <span className="music-public-track-copy"><strong>{item.title}</strong><small>{item.artist || t.noArtist} · {item.genre || "—"}</small></span>
                    <span className="music-public-track-duration">{clock(item.audio_duration_seconds)}</span>
                    <span className="music-public-track-action" aria-hidden="true">{active && playing ? <span className="music-public-equalizer"><i /><i /><i /><i /></span> : "▶"}</span>
                  </button>
                );
              })}
            </section>
          </>
        )}
        <audio ref={audioRef} preload="none" />
      </div>
    </main>
  );
}
