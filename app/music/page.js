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
    volume: "Volume", seek: "Posisi lagu", track: "LAGU", repeatQueue: "Putar ulang Antrian", repeatSong: "Putar ulang Lagu", repeatOff: "Jangan diulang", playOnce: "Mainkan sekali", shuffle: "Putar acak", sequential: "Putar berurutan", volumeLevel: "Tingkat volume",
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
    volume: "Volume", seek: "Track position", track: "TRACK", repeatQueue: "Repeat Queue", repeatSong: "Repeat Song", repeatOff: "No Repeat", playOnce: "Play Once", shuffle: "Shuffle playback", sequential: "Play in order", volumeLevel: "Volume level",
  },
};

function Icon({ name, size = 22 }) {
  const paths = {
    shuffle: <><path d="m16 3 5 5-5 5"/><path d="M4 7h2.5c5 0 6 10 11 10H21"/><path d="m16 14 5 5-5 5"/><path d="M4 17h2.5c1.7 0 2.8-1.4 3.8-3"/></>, ordered: <><path d="M4 6h16M4 12h16M4 18h16"/><path d="m17 3 3 3-3 3"/></>, previous: <><path d="M6 5v14"/><path d="m19 5-10 7 10 7z" fill="currentColor" stroke="none"/></>, next: <><path d="M18 5v14"/><path d="m5 5 10 7-10 7z" fill="currentColor" stroke="none"/></>, play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>, pause: <><path d="M8 5v14M16 5v14"/></>, queue: <><path d="M3 7h13a5 5 0 0 1 5 5"/><path d="m17 3 4 4-4 4"/><path d="M3 17h13a5 5 0 0 0 5-5"/><path d="m7 13-4 4 4 4"/></>, repeat: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></>, repeatOne: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/><path d="M12 10v5m-1.5-3.5L12 10l1.5 1.5"/></>, repeatOff: <><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/><path d="m4 4 16 16"/></>, once: <><path d="M4 12h15"/><path d="m14 6 6 6-6 6"/></>, volume: <><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></>,
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
  const shuffleQueueRef = useRef([]);
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
  }, [t.error, repeatMode, items, activeId, shuffle]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      if (repeatMode === "song") { audio.currentTime = 0; audio.play().catch(() => setNotice(t.error)); return; }
      if (repeatMode === "once") return;
      const index = items.findIndex((item) => item.id === activeId);
      if (shuffle && items.length > 1) { const next = takeShuffleTrack(); if (next) playTrack(next); return; }
      if (index >= 0 && index < items.length - 1) playTrack(items[index + 1]);
      else if (repeatMode === "queue" && items.length) playTrack(items[0]);
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
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = repeatMode === "song";
    }
  }, [volume, repeatMode]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.artist, item.genre, ...(item.tags || [])]
        .some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [items, query]);

  useEffect(() => {
    shuffleQueueRef.current = items.filter((item) => item.id !== activeId).map((item) => item.id).sort(() => Math.random() - 0.5);
  }, [shuffle, items, activeId]);

  const activeTrack = items.find((item) => item.id === activeId) || null;
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const progressDuration = duration || Number(activeTrack?.audio_duration_seconds) || 0;

  function takeShuffleTrack() {
    if (!shuffleQueueRef.current.length && repeatMode === "queue") {
      shuffleQueueRef.current = items.filter((item) => item.id !== activeId).map((item) => item.id).sort(() => Math.random() - 0.5);
    }
    const id = shuffleQueueRef.current.shift();
    return items.find((item) => item.id === id) || null;
  }

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
    if (shuffle) shuffleQueueRef.current = shuffleQueueRef.current.filter((id) => id !== item.id);
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
    let nextIndex;
    if (activeIndex < 0) nextIndex = step > 0 ? 0 : items.length - 1;
    else if (shuffle && step > 0 && items.length > 1) { const next = takeShuffleTrack(); if (!next) return; await playTrack(next); return; }
    else { nextIndex = activeIndex + step; if (nextIndex < 0 || nextIndex >= items.length) { if (repeatMode === "queue") nextIndex = (nextIndex + items.length) % items.length; else return; } }
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
                      <h2 key={activeTrack?.id || "empty"}><span>{activeTrack?.title || t.title}</span>{(activeTrack?.title || t.title).length > 24 && <span aria-hidden="true">{activeTrack?.title || t.title}</span>}</h2>
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
                  <button className={"music-public-mode" + (shuffle ? " is-enabled" : "")} type="button" onClick={() => setShuffle((value) => !value)} aria-pressed={shuffle} aria-label={shuffle ? t.sequential : t.shuffle} title={shuffle ? t.sequential : t.shuffle}><Icon name={shuffle ? "ordered" : "shuffle"}/></button>
                  <button type="button" onClick={() => moveTrack(-1)} disabled={!items.length} aria-label={t.previous}><Icon name="previous"/></button>
                  <button className="music-public-main-play" type="button" onClick={() => activeTrack ? playTrack(activeTrack) : moveTrack(1)} disabled={!items.length} aria-label={playing ? t.pause : t.play}><Icon name={playing ? "pause" : "play"} size={25}/></button>
                  <button type="button" onClick={() => moveTrack(1)} disabled={!items.length} aria-label={t.next}><Icon name="next"/></button>
                  <div className="music-public-repeat-wrap"><button className={"music-public-mode" + (repeatMode !== "off" ? " is-enabled" : "")} type="button" onClick={() => setRepeatOpen((value) => !value)} aria-expanded={repeatOpen} aria-label={t.repeatQueue}><Icon name={repeatMode === "queue" ? "queue" : repeatMode === "song" ? "repeatOne" : repeatMode === "once" ? "once" : "repeatOff"}/></button>
                    {repeatOpen && <div className="music-public-popover music-public-repeat-menu" role="menu">{[["queue","queue",t.repeatQueue],["song","repeatOne",t.repeatSong],["off","repeatOff",t.repeatOff],["once","once",t.playOnce]].map(([mode,icon,label])=><button type="button" role="menuitemradio" aria-checked={repeatMode===mode} className={repeatMode===mode?"is-selected":""} key={mode} onClick={()=>{setRepeatMode(mode);setRepeatOpen(false);}}><Icon name={icon} size={21}/><span>{label}</span>{repeatMode===mode&&<span className="music-public-selected-mark">✓</span>}</button>)}</div>}
                  </div>
                </div>
                <div className="music-public-volume-row"><button className="music-public-volume-trigger" type="button" onClick={()=>setVolumeOpen((value)=>!value)} aria-expanded={volumeOpen} aria-label={t.volume + " " + Math.round(volume*100) + "%"}><Icon name="volume" size={18}/><span>{Math.round(volume*100)}%</span></button>
                  {volumeOpen && <><button className="music-public-popover-dismiss" type="button" aria-label="Close volume control" onClick={()=>setVolumeOpen(false)}></button><div className="music-public-volume-popover"><Icon name="volume" size={21}/><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event)=>setVolume(Number(event.target.value))} aria-label={t.volumeLevel}/><Icon name="volume" size={19}/></div></>}
                </div>
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
