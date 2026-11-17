"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

const tracks = [
  { title: "Beauty And Darkness", artist: "Dajjal", src: "/audio/Dajjal%20-%20Beauty%20and%20Darkness.mp3", cover: "https://drive.google.com/thumbnail?id=1rDfD_mmCLT2-sEBKVDFV2xavmoBQy6UD&sz=w1200", theme: "dajjal" },
  { title: "Kau Yang Paling Berarti", artist: "Veylora", src: "/audio/Veylora%20-%20Teba%20yang%20paling%20berarti.mp3", cover: "https://drive.google.com/thumbnail?id=10p_O8BsPjQUT9z47JBU5XBDLSiPgvmVW&sz=w1200", theme: "veylora" },
];
const words = {
  id: { eyebrow: "SOUNDTRACK KITA", title: "Musik yang punya cerita", intro: "Dua lagu, dua sudut pandang, satu kisah Dajjal × Veylora.", play: "Putar", pause: "Jeda", prev: "Lagu sebelumnya", next: "Lagu berikutnya", seek: "Posisi lagu", volume: "Volume", blocked: "Tekan putar untuk memulai musik", error: "Audio tidak dapat diputar. Periksa koneksi lalu coba lagi.", track: "Lagu", of: "dari" },
  en: { eyebrow: "OUR SOUNDTRACK", title: "Music with a story", intro: "Two songs, two perspectives, one Dajjal × Veylora story.", play: "Play", pause: "Pause", prev: "Previous track", next: "Next track", seek: "Track position", volume: "Volume", blocked: "Press play to start the music", error: "Audio could not be played. Check your connection and try again.", track: "Track", of: "of" },
};
const clock = (n) => Number.isFinite(n) && n > 0 ? Math.floor(n / 60) + ":" + String(Math.floor(n % 60)).padStart(2, "0") : "0:00";

export default function CoupleMusicPlayer() {
  const { language } = useLanguage();
  const t = words[language] || words.id;
  const audioRef = useRef(null);
  const playingRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const audio = new Audio(tracks[0].src);
    audio.preload = "metadata";
    audio.volume = 0.75;
    audioRef.current = audio;
    const updateTime = () => setTime(audio.currentTime || 0);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const ended = () => { playingRef.current = true; setPlaying(true); setIndex((i) => (i + 1) % tracks.length); };
    const failed = () => { playingRef.current = false; setPlaying(false); setMessage(t.error); };
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", failed);
    audio.play().then(() => { playingRef.current = true; setPlaying(true); }).catch(() => { setMessage(t.blocked); });
    return () => {
      playingRef.current = false;
      audio.pause();
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", failed);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = tracks[index].src;
    if (audio.getAttribute("src") !== src) {
      audio.src = src;
      audio.load();
      setTime(0);
      setDuration(0);
      if (playingRef.current) audio.play().catch(() => { playingRef.current = false; setPlaying(false); setMessage(t.error); });
    }
  }, [index]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingRef.current) {
      audio.pause(); playingRef.current = false; setPlaying(false); setMessage("");
    } else {
      audio.play().then(() => { playingRef.current = true; setPlaying(true); setMessage(""); }).catch(() => setMessage(t.error));
    }
  };
  const changeTrack = (step) => {
    playingRef.current = true;
    setPlaying(true);
    setIndex((i) => (i + step + tracks.length) % tracks.length);
  };
  const seek = (event) => {
    if (!audioRef.current || !Number.isFinite(audioRef.current.duration)) return;
    audioRef.current.currentTime = Number(event.target.value);
    setTime(Number(event.target.value));
  };
  const track = tracks[index];
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <section className="df-couple-music-player" id="df-couple-music-player" aria-labelledby="df-couple-music-title">
      <div className="df-couple-music-heading">
        <p className="df-couple-eyebrow">{t.eyebrow}</p>
        <h2 id="df-couple-music-title">{t.title}</h2>
        <p>{t.intro}</p>
      </div>
      <div className="df-couple-music-card" data-track-theme={track.theme}>
        <div className="df-couple-music-artwork">
          <img src={track.cover} alt={track.title + " — " + track.artist + " cover"} />
          <span aria-hidden="true">DF MUSIC</span>
        </div>
        <div className="df-couple-music-content">
          <div className="df-couple-music-track-meta"><span>{t.track} {String(index + 1).padStart(2, "0")} {t.of} 02</span><span>{track.artist}</span></div>
          <h3>{track.title}</h3>
          <p className="df-couple-music-artist">{track.artist}</p>
          <div className="df-couple-music-progress">
            <input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(time, duration || 0)} onChange={seek} aria-label={t.seek} style={{ "--music-progress": progress + "%" }} />
            <div className="df-couple-music-time"><span>{clock(time)}</span><span>{clock(duration)}</span></div>
          </div>
          <div className="df-couple-music-controls">
            <button type="button" onClick={() => changeTrack(-1)} aria-label={t.prev} title={t.prev}>|‹</button>
            <button className="df-couple-music-play" type="button" onClick={toggle} aria-label={playing ? t.pause : t.play} title={playing ? t.pause : t.play}><span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span></button>
            <button type="button" onClick={() => changeTrack(1)} aria-label={t.next} title={t.next}>›|</button>
            <label className="df-couple-music-volume"><span aria-hidden="true">♪</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label={t.volume} /></label>
          </div>
          <p className="df-couple-music-message" role="status" aria-live="polite">{message || " "}</p>
        </div>
      </div>
    </section>
  );
}
