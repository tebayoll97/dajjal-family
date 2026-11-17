"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getThemeTokens } from "@/app/theme/themeTokens";
import {
  DEFAULT_PALETTE_ID,
  THEME_MODE_STORAGE_KEY,
  isThemeMode,
  resolveThemeMode,
} from "@/app/theme/themeRegistry";

const ThemeContext = createContext(null);

// The published preset is server-resolved; visitor preference controls appearance mode only.
const PUBLISHED_PRESET_FALLBACK = DEFAULT_PALETTE_ID;

function applyTheme(mode, palette = PUBLISHED_PRESET_FALLBACK) {
  const resolvedMode = resolveThemeMode(mode);
  const root = document.documentElement;
  root.dataset.theme = resolvedMode;
  root.dataset.themeMode = mode;
  root.dataset.themePreset = palette;
  root.style.colorScheme = resolvedMode;

  Object.entries(getThemeTokens(palette, resolvedMode)).forEach(([token, value]) => {
    root.style.setProperty(token, value);
  });

  return resolvedMode;
}

export function ThemeProvider({ children, initialPalette = PUBLISHED_PRESET_FALLBACK }) {
  const [theme, setTheme] = useState("dark");
  const [themeMode, setThemeModeState] = useState("system");
  const [palette] = useState(initialPalette);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    const initialMode = isThemeMode(savedMode) ? savedMode : "system";

    setThemeModeState(initialMode);
    setTheme(applyTheme(initialMode, initialPalette));
    setReady(true);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = () => {
      const currentMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (!isThemeMode(currentMode) || currentMode === "system") {
        setTheme(applyTheme("system", initialPalette));
      }
    };
    media.addEventListener?.("change", onSystemChange);
    return () => media.removeEventListener?.("change", onSystemChange);
  }, [initialPalette]);

  const setThemeMode = (nextMode) => {
    if (nextMode !== "dark" && nextMode !== "light") return;
    setThemeModeState(nextMode);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    setTheme(applyTheme(nextMode, palette));
  };

  const toggleTheme = () => {
    setThemeMode(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      palette,
      setThemeMode,
      toggleTheme,
      ready,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
