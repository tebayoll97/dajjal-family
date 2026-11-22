"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import "./music-public.css";
import { BottomNavigation, Pagination } from "../components/ui";

const copy = {
  id: {
    eyebrow: "DAJJAL FAMILY · MUSIC", title: "Music Library",
    intro: "Temukan dan dengarkan musik pilihan dari DAJJAL FAMILY.",
    search: "Cari judul, artis, atau genre...", play: "Putar", pause: "Jeda",
    previous: "Lagu sebelumnya", next: "Lagu berikutnya", empty: "Belum ada musik yang dipublikasikan.",
    emptyHint: "Katalog akan menampilkan musik setelah admin menerbitkannya.",
    loading: "Memuat katalog musik...", error: "Musik tidak dapat diputar. Periksa koneksi lalu coba lagi.",
    now: "SEDANG DIPUTAR", all: "DAFTAR LAGU", noArtist: "Artis tidak dicantumkan",
    volume: "Volume", seek: "Posisi lagu", track: "LAGU",
    repeatQueue: "Putar ulang Antrian", repeatSong: "Putar ulang Lagu",
    repeatOff: "Jangan diulang", playOnce: "Mainkan sekali",
    shuffle: "Putar acak", sequential: "Putar berurutan", volumeLevel: "Tingkat volume",
    favorites: "Favorit", favoritesEmpty: "Belum ada lagu favorit.", navHome: "Beranda", navTracks: "Lagu", navSearch: "Cari",
    previousPage: "Sebelumnya", nextPage: "Berikutnya", pageLabel: (number) => `Halaman ${number}`, pageStatus: (page, total) => `Halaman ${page} dari ${total}`,
  },
  en: {
    eyebrow: "DAJJAL FAMILY · MUSIC", title: "Music Library",
    intro: "Discover and listen to selected music from DAJJAL FAMILY.",
    search: "Search title, artist, or genre...", play: "Play", pause: "Pause",
    previous: "Previous track", next: "Next track", empty: "No published music yet.",
    emptyHint: "Tracks will appear here after an admin publishes them.",
    loading: "Loading music catalog...", error: "Music could not be played. Check your connection and try again.",
    now: "NOW PLAYING", all: "PLAYLIST", noArtist: "Artist not listed",
    volume: "Volume", seek: "Track position", track: "TRACK",
    repeatQueue: "Repeat Queue", repeatSong: "Repeat Song", repeatOff: "No Repeat",
    playOnce: "Play Once", shuffle: "Shuffle playback", sequential: "Play in order",
    volumeLevel: "Volume level",
    favorites: "Favorites", favoritesEmpty: "No favorite tracks yet.", navHome: "Home", navTracks: "Tracks", navSearch: "Search",
    previousPage: "Previous", nextPage: "Next", pageLabel: (number) => `Page ${number}`, pageStatus: (page, total) => `Page ${page} of ${total}`,
  },
};

function Icon({ name, size = 22 }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    shuffle: <><path d="M16 3h5v5"/><path d="M4 7h2.5c5 0 6 10 11 10H21"/><path d="m16 14 5 5-5 5"/><path d="M4 17h2.5c1.7 0 2.8-1.4 3.8-3"/></>,
    ordered: <><path d="M4 6h16M4 12h16M4 18h16"/><path d="m17 3 3 3-3 3"/></>,
    previous: <><path d="M6 5v14"/><path d="m19 5-10 7 10 7z" fill="currentColor" stroke="none"/></>,
    next: <><path d="M18 5v14"/><path d="m5 5 10 7-10 7z" fill="currentColor" stroke="none"/></>,
    play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M8 5v14M16 5v14"/></>,
    queue: <><path d="M3 7h13a5 5 0 0 1 5 5"/><path d="m17 3 4 4-4 4"/><path d="M3 17h13a5 5 0 0 0 5-5"/><path d="m7 13-4 4 4 4"/></>,
    repeatOne: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/><path d="M12 10v5m-1.5-3.5L12 10l1.5 1.5"/></>,
    repeatOff: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/><path d="m4 4 16 16"/></>,
    once: <><path d="M4 12h15"/><path d="m14 6 6 6-6 6"/></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></>,
    heart: <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.4Z"/>,
    heartFill: <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.4Z" fill="currentColor"/>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
    listMusic: <><path d="M4 6h12M4 12h12M4 18h7"/><path d="M19 4v11.5a2.5 2.5 0 1 1-2-2.45V6l5-1v8.5a2.5 2.5 0 1 1-2-2.45V4z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function clock(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

export default function PublicMusicPage() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const audioRef = useRef(null);
  const stateRef = useRef({});
  const playTrackRef = useRef(null);
  const shuffleQueueRef = useRef([]);
  const fadeFrameRef = useRef(0);
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
  const [repeatMode, setRepeatMode] = useState("queue");
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const searchInputRef = useRef(null);

  stateRef.current = { items, activeId, repeatMode, shuffle, volume, playing };

  function fadeTo(target, onComplete, durationMs = 420) {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(fadeFrameRef.current);
    const start = audio.volume;
    const end = Math.max(0, Math.min(1, target));
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / durationMs);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = start + (end - start) * eased;
      if (progress < 1) fadeFrameRef.current = requestAnimationFrame(tick);
      else { audio.volume = end; onComplete?.(); }
    };
    fadeFrameRef.current = requestAnimationFrame(tick);
  }

  function shuffledIds(excludeId) {
    return items.filter((item) => item.id !== excludeId).map((item) => item.id)
      .sort(() => Math.random() - 0.5);
  }

  function takeShuffleTrack() {
    let queue = shuffleQueueRef.current.filter((id) => id !== stateRef.current.activeId);
    if (!queue.length && stateRef.current.repeatMode === "queue") queue = shuffledIds(stateRef.current.activeId);
    shuffleQueueRef.current = queue;
    const nextId = queue.shift();
    return items.find((item) => item.id === nextId) || null;
  }

  async function playTrack(item, { forceRestart = false } = {}) {
    const audio = audioRef.current;
    if (!audio || !item) return;
    if (stateRef.current.activeId === item.id && !forceRestart) {
      if (audio.paused) {
        setNotice("");
        const target = stateRef.current.volume;
        audio.volume = 0;
        try {
          await audio.play();
          setPlaying(true);
          fadeTo(target);
        } catch { audio.volume = target; setNotice(t.error); }
      } else {
        fadeTo(0, () => { audio.pause(); audio.volume = stateRef.current.volume; });
      }
      return;
    }
    const startNewTrack = async () => {
      setActiveId(item.id);
      setCurrentTime(0);
      setDuration(Number(item.audio_duration_seconds) || 0);
      setNotice("");
      audio.src = "/api/music/" + encodeURIComponent(item.id) + "/stream";
      audio.load();
      audio.volume = 0;
      try {
        await audio.play();
        setPlaying(true);
        fadeTo(stateRef.current.volume);
      } catch {
        audio.volume = stateRef.current.volume;
        setPlaying(false);
        setNotice(t.error);
      }
    };
    if (!audio.paused && audio.currentTime > 0) fadeTo(0, startNewTrack);
    else await startNewTrack();
    if (stateRef.current.shuffle) {
      shuffleQueueRef.current = shuffleQueueRef.current.filter((id) => id !== item.id);
    }
  }

  playTrackRef.current = playTrack;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/music", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || t.error);
        if (!active) return;
        const published = Array.isArray(result.items) ? result.items : [];
        setItems(published);
        if (published.length) {
          setActiveId(published[0].id);
          setDuration(Number(published[0].audio_duration_seconds) || 0);
        }
      } catch (error) {
        if (active) setNotice(error.message || t.error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [t.error]);

  // Attempt autoplay only after the latest published track has been rendered into the audio player.
  useEffect(() => {
    if (!activeId || !items.length || !audioRef.current) return;
    const audio = audioRef.current;
    if (audio.src && decodeURIComponent(audio.src).includes(encodeURIComponent(activeId))) return;
    const selected = items.find((item) => item.id === activeId);
    if (!selected) return;
    audio.src = "/api/music/" + encodeURIComponent(selected.id) + "/stream";
    audio.load();
    audio.volume = 0;
    audio.play().then(() => {
      setNotice("");
      setPlaying(true);
      fadeTo(volume);
    }).catch(() => {
      audio.volume = volume;
      setPlaying(false);
      // Autoplay may be blocked by browser policy; selected track and cover remain visible.
    });
  }, [activeId, items, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      const current = stateRef.current;
      if (current.repeatMode === "song") {
        audio.currentTime = 0;
        audio.volume = 0;
        audio.play().then(() => fadeTo(current.volume)).catch(() => setNotice(t.error));
        return;
      }
      if (current.repeatMode === "once") { setPlaying(false); return; }
      let next = null;
      if (current.shuffle && current.items.length > 1) {
        let queue = shuffleQueueRef.current.filter((id) => id !== current.activeId);
        if (!queue.length && current.repeatMode === "queue") {
          queue = current.items.filter((item) => item.id !== current.activeId).map((item) => item.id).sort(() => Math.random() - 0.5);
        }
        shuffleQueueRef.current = queue;
        const nextId = queue.shift();
        shuffleQueueRef.current = queue;
        next = current.items.find((item) => item.id === nextId) || null;
      } else {
        const index = current.items.findIndex((item) => item.id === current.activeId);
        if (index >= 0 && index < current.items.length - 1) next = current.items[index + 1];
        else if (current.repeatMode === "queue" && current.items.length) next = current.items[0];
      }
      if (next) playTrackRef.current?.(next, { forceRestart: true });
      else setPlaying(false);
    };
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
    if (audioRef.current && !playing) audioRef.current.volume = volume;
  }, [volume, playing]);

  useEffect(() => () => {
    cancelAnimationFrame(fadeFrameRef.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute("src"); }
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("df-music-favorites") || "[]");
      if (Array.isArray(stored)) setFavoriteIds(stored.filter((id) => typeof id === "string"));
    } catch { /* Ignore unavailable or malformed local preferences. */ }
    setFavoritesReady(true);
  }, []);

  useEffect(() => {
    if (!favoritesReady) return;
    try { window.localStorage.setItem("df-music-favorites", JSON.stringify(favoriteIds)); }
    catch { /* Favorites remain usable for the current session when storage is unavailable. */ }
  }, [favoriteIds, favoritesReady]);

  useEffect(() => { setPage((current) => Math.min(current, Math.max(1, Math.ceil(visibleItems.length / 10)))); }, [visibleItems.length]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = !q ? items : items.filter((item) =>
      [item.title, item.artist, item.genre, ...(item.tags || [])]
        .some((value) => String(value || "").toLowerCase().includes(q))
    );
    return showFavorites ? matched.filter((item) => favoriteIds.includes(item.id)) : matched;
  }, [items, query, showFavorites, favoriteIds]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const pageItems = visibleItems.slice((page - 1) * pageSize, page * pageSize);

  const activeTrack = items.find((item) => item.id === activeId) || null;
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const progressDuration = duration || Number(activeTrack?.audio_duration_seconds) || 0;

  function moveTrack(step) {
    if (!items.length) return;
    if (shuffle && step > 0 && items.length > 1) {
      const next = takeShuffleTrack();
      if (next) playTrack(next, { forceRestart: true });
      return;
    }
    let index = activeIndex < 0 ? (step > 0 ? 0 : items.length - 1) : activeIndex + step;
    if (index < 0 || index >= items.length) {
      if (repeatMode === "queue") index = (index + items.length) % items.length;
      else return;
    }
    playTrack(items[index], { forceRestart: true });
  }

  function changeVolume(nextVolume) {
    const value = Math.max(0, Math.min(1, Number(nextVolume)));
    setVolume(value);
    if (audioRef.current) {
      if (playing) { cancelAnimationFrame(fadeFrameRef.current); audioRef.current.volume = value; }
      else audioRef.current.volume = value;
    }
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio || !progressDuration) return;
    audio.currentTime = Number(event.target.value);
    setCurrentTime(audio.currentTime);
  }

  const repeatIcon = repeatMode === "queue" ? "queue" : repeatMode === "song" ? "repeatOne" : repeatMode === "once" ? "once" : "repeatOff";

  return (
    <main className="music-public-page df-token-page">
      <div className="music-public-shell ui-page">
        <header id="music-public-home" className="music-public-header ui-page-header">
          <p className="music-public-eyebrow ui-eyebrow">{t.eyebrow}</p>
          <h1 className="ui-heading-h1">{t.title}</h1>
          <p className="ui-subtitle">{t.intro}</p>
        </header>

        <section className="music-public-search" aria-label={t.search}>
          <span aria-hidden="true"><Icon name="search" size={18}/></span>
          <input ref={searchInputRef} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={t.search} aria-label={t.search}/>
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={17}/></button>}
        </section>

        {notice && <p className="music-public-notice" role="alert">{notice}</p>}

        {loading ? <p className="music-public-state">{t.loading}</p> : items.length === 0 ? (
          <section className="music-public-empty"><h2>{t.empty}</h2><p>{t.emptyHint}</p></section>
        ) : (
          <>
            <section className="music-public-feature" aria-label={t.now}>
              <div className="music-public-artwork">
                {activeTrack?.cover_mime_type
                  ? <img key={activeTrack.id} src={"/api/music/" + encodeURIComponent(activeTrack.id) + "/cover"} alt={activeTrack.title + " cover"}/>
                  : <div className="music-public-artwork-fallback" aria-hidden="true">DF</div>}
                {playing && <div className="music-public-cover-animation" role="status" aria-label={language === "en" ? "Music playing" : "Musik sedang diputar"}><i/><i/><i/><i/><i/></div>}
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
                      <h2 key={activeTrack?.id || "empty"}><span>{activeTrack?.title || t.title}</span>{(activeTrack?.title || t.title).length > 24 && <span aria-hidden="true">{activeTrack?.title || t.title}</span>}</h2>
                    </div>
                    <button className={"music-public-favorite" + (activeTrack && favoriteIds.includes(activeTrack.id) ? " is-favorite" : "")} type="button" onClick={() => activeTrack && setFavoriteIds((current) => current.includes(activeTrack.id) ? current.filter((id) => id !== activeTrack.id) : [...current, activeTrack.id])} disabled={!activeTrack} aria-label="Toggle favorite">
                      <Icon name={activeTrack && favoriteIds.includes(activeTrack.id) ? "heartFill" : "heart"} size={20}/>
                    </button>
                  </div>
                  <p>{activeTrack ? (activeTrack.artist || t.noArtist) : t.intro}</p>
                </div>
                <div className="music-public-progress">
                  <input type="range" min="0" max={Math.max(1, progressDuration)} step="1" value={Math.min(currentTime, progressDuration || 0)} onChange={seek} disabled={!activeTrack || !progressDuration} aria-label={t.seek} style={{ "--music-progress": progressDuration ? (currentTime / progressDuration) * 100 + "%" : "0%" }}/>
                  <div className="music-public-times"><span>{clock(currentTime)}</span><span>{clock(progressDuration)}</span></div>
                </div>
                <div className="music-public-controls">
                  <button className="music-public-icon-button" type="button" onClick={() => { setShuffle((current) => { const next = !current; shuffleQueueRef.current = next ? shuffledIds(activeId) : []; return next; }); }} aria-pressed={shuffle} aria-label={shuffle ? t.sequential : t.shuffle} title={shuffle ? t.sequential : t.shuffle}><Icon name={shuffle ? "shuffle" : "ordered"}/></button>
                  <div className="music-public-volume-wrap">
                    <button className="music-public-volume-trigger" type="button" onClick={() => setVolumeOpen((value) => !value)} aria-expanded={volumeOpen} aria-label={t.volume + " " + Math.round(volume * 100) + "%"}><Icon name="volume" size={19}/><span>{Math.round(volume * 100)}%</span></button>
                    {volumeOpen && <><button className="music-public-popover-dismiss" type="button" aria-label="Close volume control" onClick={() => setVolumeOpen(false)}/><div className="music-public-volume-popover" onTouchStart={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()}><Icon name="volume" size={20}/><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => changeVolume(event.target.value)} onPointerDown={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} aria-label={t.volumeLevel}/><Icon name="volume" size={19}/></div></>}
                  </div>
                  <button className="music-public-icon-button" type="button" onClick={() => moveTrack(-1)} disabled={!items.length} aria-label={t.previous}><Icon name="previous"/></button>
                  <button className="music-public-main-play" type="button" onClick={() => activeTrack ? playTrack(activeTrack) : moveTrack(1)} disabled={!items.length} aria-label={playing ? t.pause : t.play}><Icon name={playing ? "pause" : "play"} size={24}/></button>
                  <button className="music-public-icon-button" type="button" onClick={() => moveTrack(1)} disabled={!items.length} aria-label={t.next}><Icon name="next"/></button>
                  <div className="music-public-repeat-wrap">
                    <button className="music-public-icon-button" type="button" onClick={() => setRepeatOpen((value) => !value)} aria-expanded={repeatOpen} aria-label={t.repeatQueue}><Icon name={repeatIcon}/></button>
                    {repeatOpen && <div className="music-public-popover music-public-repeat-menu" role="menu">
                      {[["queue","queue",t.repeatQueue],["song","repeatOne",t.repeatSong],["off","repeatOff",t.repeatOff],["once","once",t.playOnce]].map(([mode, icon, label]) => <button type="button" role="menuitemradio" aria-checked={repeatMode === mode} className={repeatMode === mode ? "is-selected" : ""} key={mode} onClick={() => { setRepeatMode(mode); setRepeatOpen(false); }}><Icon name={icon} size={21}/><span>{label}</span>{repeatMode === mode && <span className="music-public-selected-mark">✓</span>}</button>)}
                    </div>}
                  </div>
                </div>
              </div>
            </section>

            <section id="music-public-playlist" className="music-public-playlist" aria-label={showFavorites ? t.favorites : t.all}>
              <div className="music-public-playlist-heading"><h2>{showFavorites ? t.favorites : t.all}</h2><span>{visibleItems.length} / {items.length}</span></div>
              {visibleItems.length === 0 ? <p className="music-public-filter-empty">{showFavorites ? t.favoritesEmpty : t.empty}</p> : null}
              {pageItems.map((item) => {
                const active = item.id === activeId;
                return <button className={"music-public-track" + (active ? " is-active" : "")} type="button" key={item.id} onClick={() => playTrack(item, { forceRestart: true })} aria-current={active ? "true" : undefined}>
                  <span className="music-public-track-number">{String(items.findIndex((entry) => entry.id === item.id) + 1).padStart(2, "0")}</span>
                  <span className="music-public-track-copy"><strong>{item.title}</strong><small>{item.artist || t.noArtist} · {item.genre || "—"}</small></span>
                  <span className="music-public-track-duration">{clock(item.audio_duration_seconds)}</span>
                  <span className="music-public-track-action" aria-hidden="true">{active && playing ? <span className="music-public-equalizer"><i/><i/><i/><i/></span> : <Icon name="play" size={16}/>}</span>
                </button>;
              })}
              {visibleItems.length > pageSize && <div className="music-public-pagination-wrap"><span>{t.pageStatus(page, totalPages)}</span><Pagination page={page} totalPages={totalPages} onPageChange={(nextPage) => { setPage(nextPage); document.getElementById("music-public-playlist")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} ariaLabel={language === "en" ? "Track pages" : "Halaman daftar lagu"} previousLabel={t.previousPage} nextLabel={t.nextPage} pageLabel={t.pageLabel} className="music-public-pagination"/></div>}
            </section>
          </>
        )}
        <audio ref={audioRef} preload="none"/>
        {!loading && items.length > 0 && <BottomNavigation fixed ariaLabel={language === "en" ? "Music navigation" : "Navigasi musik"} items={[
          { key: "home", label: t.navHome, icon: <Icon name="home" size={21}/>, onClick: () => document.getElementById("music-public-home")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
          { key: "tracks", label: t.navTracks, icon: <Icon name="listMusic" size={21}/>, onClick: () => document.getElementById("music-public-playlist")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
          { key: "favorites", label: t.favorites, icon: <Icon name="heart" size={21}/>, active: showFavorites, onClick: () => { setShowFavorites((value) => !value); setPage(1); document.getElementById("music-public-playlist")?.scrollIntoView({ behavior: "smooth", block: "start" }); } },
          { key: "search", label: t.navSearch, icon: <Icon name="search" size={21}/>, onClick: () => { searchInputRef.current?.focus(); searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); } },
        ]} centerAction={{ label: playing ? t.pause : t.play, icon: <Icon name={playing ? "pause" : "play"} size={23}/>, active: playing, disabled: !activeTrack, onClick: () => activeTrack ? playTrack(activeTrack) : moveTrack(1) }} />}
      </div>
    </main>
  );
}
