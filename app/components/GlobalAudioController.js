"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import audioEngine from "@/lib/audio/AudioEngine";
import { getAudioSettings } from "@/lib/audio/audioSettings";

export default function GlobalAudioController() {
  const pathname = usePathname() || "";
  const isCoupleRoute = /(?:^|\/)df\/couple\/?$/.test(pathname);

  useEffect(() => {
    const initialSettings = getAudioSettings();

    audioEngine.setMuted(false);
    audioEngine.setMusicVolume(
      initialSettings.musicEnabled ? initialSettings.musicVolume : 0
    );
    audioEngine.setSfxVolume(
      initialSettings.sfxEnabled ? initialSettings.sfxVolume : 0
    );

    // Couple Profile owns its soundtrack; prevent the global ambient layer
    // from playing over the selected Dajjal × Veylora tracks.
    if (isCoupleRoute) audioEngine.stopMusic();

    function handleAudioSettingsChange(event) {
      const settings = event.detail?.settings;
      const changes = event.detail?.changes;

      if (!settings) return;

      audioEngine.setMuted(false);
      audioEngine.setMusicVolume(
        settings.musicEnabled ? settings.musicVolume : 0
      );
      audioEngine.setSfxVolume(
        settings.sfxEnabled ? settings.sfxVolume : 0
      );

      if (isCoupleRoute) {
        audioEngine.stopMusic();
      } else if (changes?.musicEnabled === true) {
        audioEngine.startMusic();
      } else if (changes?.musicEnabled === false) {
        audioEngine.stopMusic();
      }
    }

    window.addEventListener(
      "dajjal-audio-settings-change",
      handleAudioSettingsChange
    );

    return () => {
      window.removeEventListener(
        "dajjal-audio-settings-change",
        handleAudioSettingsChange
      );
    };
  }, [isCoupleRoute]);

  return null;
}
