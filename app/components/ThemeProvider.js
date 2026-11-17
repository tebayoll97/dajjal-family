"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getThemeTokens } from "@/app/theme/themeTokens";
import {
  DEFAULT_PALETTE_ID,
  THEME_MODE_STORAGE_KEY,
  THEME_PALETTE_STORAGE_KEY,
  isThemeMode,
  isThemePalette,
  resolveThemeMode,
} from "@/app/theme/themeRegistry";

const ThemeContext = createContext(null);

function applyTheme(mode, palette) {
  const resolvedMode = resolveThemeMode(mode);
  const root = document.documentElement;
  root.dataset.theme = resolvedMode;
  root.dataset.themeMode = mode;
  root.dataset.themePalette = palette;
  root.style.colorScheme = resolvedMode;

  Object.entries(getThemeTokens(palette, resolvedMode)).forEach(([token, value]) => {
    root.style.setProperty(token, value);
  });

  return resolvedMode;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [themeMode, setThemeModeState] = useState("system");
  const [palette, setPaletteState] = useState(DEFAULT_PALETTE_ID);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    const savedPalette = localStorage.getItem(THEME_PALETTE_STORAGE_KEY);
    const initialMode = isThemeMode(savedMode) ? savedMode : "system";
    const initialPalette = isThemePalette(savedPalette) ? savedPalette : DEFAULT_PALETTE_ID;

    setThemeModeState(initialMode);
    setPaletteState(initialPalette);
    setTheme(applyTheme(initialMode, initialPalette));
    setReady(true);

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = () => {
      const currentMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      const currentPalette = localStorage.getItem(THEME_PALETTE_STORAGE_KEY);
      if (!isThemeMode(currentMode) || currentMode === "system") {
        const activePalette = isThemePalette(currentPalette) ? currentPalette : DEFAULT_PALETTE_ID;
        setTheme(applyTheme("system", activePalette));
      }
    };
    media.addEventListener?.("change", onSystemChange);
    return () => media.removeEventListener?.("change", onSystemChange);
  }, []);

  const setThemeMode = (nextMode) => {
    if (!isThemeMode(nextMode)) return;
    setThemeModeState(nextMode);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    setTheme(applyTheme(nextMode, palette));
  };

  const toggleTheme = () => {
    setThemeMode(theme === "dark" ? "light" : "dark");
  };

  const setPalette = (nextPalette) => {
    if (!isThemePalette(nextPalette)) return;
    setPaletteState(nextPalette);
    localStorage.setItem(THEME_PALETTE_STORAGE_KEY, nextPalette);
    applyTheme(themeMode, nextPalette);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      palette,
      setThemeMode,
      setPalette,
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
