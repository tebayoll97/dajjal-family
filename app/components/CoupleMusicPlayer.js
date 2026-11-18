"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

const tracks = [
  {
    title: "Beauty And Darkness",
    artist: "Dajjal",
    src: "/audio/Dajjal%20-%20Beauty%20and%20Darkness.mp3",
    cover: "https://drive.google.com/thumbnail?id=1rDfD_mmCLT2-sEBKVDFV2xavmoBQy6UD&sz=w1200",
    theme: "dajjal",
  },
  {
    title: "Kau Yang Paling Berarti",
    artist: "Veylora",
    src: "/audio/Veylora%20-%20Teba%20yang%20paling%20berarti.mp3",
    cover: "https://drive.google.com/thumbnail?id=10p_O8BsPjQUT9z47JBU5XBDLSiPgvmVW&sz=w1200",
    theme: "veylora",
  },
];

const words = {
  id: {
    eyebrow: "OUR LOVE, OUR SOUNDTRACK",
    title: "Kalau kisah kita punya lagu… 🎶",
    intro: "Satu lagu mewakili sisi gelap yang penuh misteri, satu lagi membawa kehangatan yang sulit dijelaskan. Dua karakter, dua suasana, dan playlist kecil yang selalu punya alasan untuk diputar. ❤️",
    play: "Putar",
    pause: "Jeda",
    prev: "Lagu sebelumnya",
    next: "Lagu berikutnya",
    seek: "Posisi lagu",
    volume: "Volume",
    blocked: "Tekan putar untuk memulai musik",
    error: "Audio tidak dapat diputar. Periksa koneksi lalu coba lagi.",
    track: "Lagu",
    of: "dari",
    playlist: "DAFTAR LAGU",
    now: "SEDANG DIPUTAR",
    ready: "Pilih untuk memutar",
    select: "Putar lagu",
  },
  en: {
    eyebrow: "OUR LOVE, OUR SOUNDTRACK",
    title: "If Our Story Had a Song… 🎶",
    intro: "One song represents a dark and mysterious side, while the other brings a warmth that's hard to explain. Two characters, two moods, and a little playlist that always has a reason to be played. ❤️",
    play: "Play",
    pause: "Pause",
    prev: "Previous track",
    next: "Next track",
    seek: "Track position",
    volume: "Volume",
    blocked: "Press play to start the music",
    error: "Audio could not be played. Check your connection and try again.",
    track: "Track",
    of: "of",
    playlist: "PLAYLIST",
    now: "NOW PLAYING",
    ready: "Select to play",
    select: "Play track",
  },
};

const clock = (value) =>
  Number.isFinite(value) && value > 0
    ? Math.floor(value / 60) + ":" + String(Math.floor(value % 60)).padStart(2, "0")
    : "0:00";

export default function CoupleMusicPlayer({ onPlaybackStateChange }) {
  const { language } = useLanguage();
  const t = words[language] || words.id;

  const audioRef = useRef(null);
  const shouldPlayRef = useRef(false);
  const playingRef = useRef(false);
  const playRequestRef = useRef(0);
  const playInFlightRef = useRef(false);
  const awaitingInteractionRef = useRef(false);
  const interactionAttemptedRef = useRef(false);
  const resumeAfterBackgroundRef = useRef(false);
  const duckedRef = useRef(false);
  const fadeFrameRef = useRef(0);
  const fadeTokenRef = useRef(0);
  const volumeRef = useRef(0.75);
  const toggleRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [message, setMessage] = useState("");

  const getTargetVolume = () => volumeRef.current * (duckedRef.current ? 0.05 : 1);

  const fadeVolume = (target, durationMs = 700) => new Promise((resolve) => {
    const audio = audioRef.current;
    if (!audio) {
      resolve();
      return;
    }
    if (fadeFrameRef.current) cancelAnimationFrame(fadeFrameRef.current);
    const token = ++fadeTokenRef.current;
    const from = audio.volume;
    const startedAt = performance.now();
    const step = (now) => {
      if (token !== fadeTokenRef.current || audioRef.current !== audio) {
        resolve();
        return;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      audio.volume = from + (target - from) * progress;
      if (progress < 1) {
        fadeFrameRef.current = requestAnimationFrame(step);
      } else {
        fadeFrameRef.current = 0;
        resolve();
      }
    };
    fadeFrameRef.current = requestAnimationFrame(step);
  });

  // One page-scoped audio element. Attempt autoplay on entry; browsers may
  // require a user gesture, in which case the visible Play control is fallback.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0;
    audio.src = tracks[0].src;
    audio.load();
    audioRef.current = audio;

    const handleExternalToggle = () => toggleRef.current?.();
    window.addEventListener("df-couple-music-toggle", handleExternalToggle);

    const updateTime = () => setTime(audio.currentTime || 0);
    const updateDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const ended = () => {
      playingRef.current = false;
      setPlaying(false);
      shouldPlayRef.current = true;
      setIndex((current) => (current + 1) % tracks.length);
    };

    const failed = () => {
      playRequestRef.current += 1;
      shouldPlayRef.current = false;
      playingRef.current = false;
      setPlaying(false);
      setMessage(t.error);
    };

    const attemptPlayback = () => {
      // The same audio element is the single source of truth for both tracks.
      if (!shouldPlayRef.current || !audio.paused || audio.ended || playInFlightRef.current) {
        if (!audio.paused && !audio.ended) {
          playingRef.current = true;
          setPlaying(true);
        }
        return Promise.resolve(false);
      }

      playInFlightRef.current = true;
      const requestId = ++playRequestRef.current;
      return audio.play().then(() => {
        if (requestId !== playRequestRef.current || audioRef.current !== audio) return false;
        playingRef.current = true;
        shouldPlayRef.current = true;
        awaitingInteractionRef.current = false;
        setPlaying(true);
        setMessage("");
        await fadeVolume(getTargetVolume(), 900);
        return true;
      }).catch(() => {
        if (requestId !== playRequestRef.current || audioRef.current !== audio) return false;
        shouldPlayRef.current = false;
        playingRef.current = false;
        if (!interactionAttemptedRef.current) awaitingInteractionRef.current = true;
        setPlaying(false);
        setMessage(t.blocked);
        return false;
      }).finally(() => {
        playInFlightRef.current = false;
      });
    };

    const handleFirstInteraction = () => {
      if (!awaitingInteractionRef.current || interactionAttemptedRef.current) return;
      interactionAttemptedRef.current = true;
      awaitingInteractionRef.current = false;
      ["scroll", "touchstart", "pointerdown", "wheel"].forEach((eventName) => {
        window.removeEventListener(eventName, handleFirstInteraction);
      });
      // A scroll/touch gesture may count as user activation in the browser.
      // If it does not, the visible Play button remains the fallback.
      shouldPlayRef.current = true;
      attemptPlayback();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Remember playback intent without creating another player or stopping
        // audio that Android/browser may continue playing in the background.
        resumeAfterBackgroundRef.current = shouldPlayRef.current && !audio.paused;
        return;
      }

      if (!resumeAfterBackgroundRef.current || !shouldPlayRef.current) return;
      resumeAfterBackgroundRef.current = false;
      if (audio.paused) attemptPlayback();
    };

    audio.addEventListener("play", () => {
      playingRef.current = true;
      setPlaying(true);
    });
    audio.addEventListener("pause", () => {
      playingRef.current = false;
      setPlaying(false);
    });
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", failed);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    ["scroll", "touchstart", "pointerdown", "wheel"].forEach((eventName) => {
      window.addEventListener(eventName, handleFirstInteraction, { passive: true, once: false });
    });

    // Try autoplay on entry. If blocked, retry only on the first real
    // interaction; never create a second audio element or overlap playback.
    shouldPlayRef.current = true;
    attemptPlayback();

    const handleDucking = (event) => {
      const nextDucked = Boolean(event.detail?.active);
      duckedRef.current = nextDucked;
      if (fadeFrameRef.current) cancelAnimationFrame(fadeFrameRef.current);
      fadeVolume(getTargetVolume(), 500);
    };

    window.addEventListener("dajjal-couple-audio-duck", handleDucking);

    return () => {
      playRequestRef.current += 1;
      shouldPlayRef.current = false;
      playingRef.current = false;
      audio.pause();
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", failed);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("df-couple-music-toggle", handleExternalToggle);
      ["scroll", "touchstart", "pointerdown", "wheel"].forEach((eventName) => {
        window.removeEventListener(eventName, handleFirstInteraction);
      });
      window.removeEventListener("dajjal-couple-audio-duck", handleDucking);
      if (fadeFrameRef.current) cancelAnimationFrame(fadeFrameRef.current);
      fadeTokenRef.current += 1;
      audio.removeAttribute("src");
      audio.load();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, []);

  // Load the selected source. Continue only when playback was explicitly requested.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Track selection from a click loads the source synchronously in the
    // click handler, preserving the browser's user-activation permission.
    if (audio.getAttribute("src") === tracks[index].src) return;

    playRequestRef.current += 1;
    const requestId = playRequestRef.current;

    audio.pause();
    audio.src = tracks[index].src;
    audio.load();
    setTime(0);
    setDuration(0);

    if (!shouldPlayRef.current) return;

    audio.play()
      .then(() => {
        if (requestId !== playRequestRef.current || audioRef.current !== audio) return;
        playingRef.current = true;
        setPlaying(true);
        setMessage("");
        await fadeVolume(getTargetVolume(), 900);
      })
      .catch(() => {
        if (requestId !== playRequestRef.current) return;
        shouldPlayRef.current = false;
        playingRef.current = false;
        setPlaying(false);
        setMessage(t.error);
      });
  }, [index]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    volumeRef.current = volume;
    fadeVolume(getTargetVolume(), 350);
  }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || playInFlightRef.current) return;

    if (playingRef.current) {
      const requestId = ++playRequestRef.current;
      shouldPlayRef.current = false;
      playingRef.current = false;
      setPlaying(false);
      setMessage("");
      await fadeVolume(0, 550);
      if (requestId === playRequestRef.current && !shouldPlayRef.current && audioRef.current === audio) {
        audio.pause();
      }
      return;
    }

    shouldPlayRef.current = true;
    awaitingInteractionRef.current = false;
    interactionAttemptedRef.current = true;
    const requestId = ++playRequestRef.current;

    try {
      audio.volume = 0;
      await audio.play();
      if (requestId !== playRequestRef.current || audioRef.current !== audio) return;
      playingRef.current = true;
      setPlaying(true);
      setMessage("");
      await fadeVolume(getTargetVolume(), 900);
    } catch {
      if (requestId !== playRequestRef.current) return;
      shouldPlayRef.current = false;
      playingRef.current = false;
      setPlaying(false);
      setMessage(t.error);
    }
  };

  toggleRef.current = toggle;

  useEffect(() => {
    onPlaybackStateChange?.(playing);
  }, [playing, onPlaybackStateChange]);

  const selectTrack = (nextIndex) => {
    if (nextIndex === index) {
      if (!playingRef.current) toggle();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    shouldPlayRef.current = true;
    awaitingInteractionRef.current = false;
    interactionAttemptedRef.current = true;
    playingRef.current = false;
    setPlaying(false);
    setMessage("");

    // Set the new source and request playback during the user's click event.
    playRequestRef.current += 1;
    const requestId = playRequestRef.current;
    audio.pause();
    audio.volume = 0;
    audio.src = tracks[nextIndex].src;
    audio.load();
    setTime(0);
    setDuration(0);
    setIndex(nextIndex);

    audio.play()
      .then(() => {
        if (requestId !== playRequestRef.current || audioRef.current !== audio) return;
        playingRef.current = true;
        setPlaying(true);
        setMessage("");
        await fadeVolume(getTargetVolume(), 900);
      })
      .catch(() => {
        if (requestId !== playRequestRef.current) return;
        shouldPlayRef.current = false;
        playingRef.current = false;
        setPlaying(false);
        setMessage(t.error);
      });
  };

  const changeTrack = (step) => {
    selectTrack((index + step + tracks.length) % tracks.length);
  };

  const seek = (event) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Number(event.target.value);
    setTime(audio.currentTime);
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
        <div className="df-couple-music-artwork" key={"cover-" + index}>
          <img src={track.cover} alt={track.title + " — " + track.artist + " cover"} />
          <span aria-hidden="true">DF MUSIC</span>
        </div>

        <div className="df-couple-music-content">
          <div className="df-couple-music-track-meta">
            <span>{t.track} {String(index + 1).padStart(2, "0")} {t.of} 02</span>
            <span>{track.artist}</span>
          </div>

          <div className="df-couple-music-title-group" key={"title-" + index}>
            <h3>{track.title}</h3>
            <p className="df-couple-music-artist">{track.artist}</p>
          </div>

          <div className="df-couple-music-progress">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(time, duration || 0)}
              onChange={seek}
              disabled={!duration}
              aria-label={t.seek}
              style={{ "--music-progress": progress + "%" }}
            />
            <div className="df-couple-music-time">
              <span>{clock(time)}</span>
              <span>{clock(duration)}</span>
            </div>
          </div>

          <div className="df-couple-music-controls">
            <button type="button" onClick={() => changeTrack(-1)} aria-label={t.prev} title={t.prev}>|‹</button>
            <button className="df-couple-music-play" type="button" onClick={toggle} aria-label={playing ? t.pause : t.play} title={playing ? t.pause : t.play}>
              <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
            </button>
            <button type="button" onClick={() => changeTrack(1)} aria-label={t.next} title={t.next}>›|</button>
            <label className="df-couple-music-volume">
              <span aria-hidden="true">♪</span>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label={t.volume} />
            </label>
          </div>

          <p className="df-couple-music-message" role="status" aria-live="polite">{message || " "}</p>
        </div>

        <div className="df-couple-music-playlist" aria-label={t.playlist}>
          <h4>{t.playlist}</h4>
          {tracks.map((item, itemIndex) => {
            const active = itemIndex === index;
            return (
              <button
                className={"df-couple-music-track" + (active ? " is-active" : "")}
                type="button"
                key={item.src}
                onClick={() => selectTrack(itemIndex)}
                aria-current={active ? "true" : undefined}
                aria-label={active ? item.title + " — " + t.now : t.select + ": " + item.title}
              >
                <span className="df-couple-music-track-number">{String(itemIndex + 1).padStart(2, "0")}</span>
                <span className="df-couple-music-track-copy">
                  <strong>{item.title}</strong>
                  <small>{item.artist}</small>
                </span>
                <span className="df-couple-music-track-state">
                  {active ? (
                    <>
                      <span className={"df-couple-music-equalizer" + (playing ? " is-playing" : "")} aria-hidden="true"><i /><i /><i /></span>
                      <span>{playing ? t.now : t.play}</span>
                    </>
                  ) : (
                    <>
                      <span className="df-couple-music-track-play" aria-hidden="true">▶</span>
                      <span>{t.ready}</span>
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
