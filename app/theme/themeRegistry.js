/**
 * Global Theme Preset Registry.
 * Global presets are independent from visitor appearance mode.
 * Page-owned and isolated experiences remain outside global publishing.
 */
export const DEFAULT_PALETTE_ID = "tecno";
export const THEME_MODE_STORAGE_KEY = "dajjal-family-theme";
// Retained as a deprecated export for compatibility; visitor palette overrides are no longer read.
export const THEME_PALETTE_STORAGE_KEY = "dajjal-family-palette";

export const THEME_REGISTRY = Object.freeze({
  tecno: Object.freeze({
    id: "tecno",
    label: "TECNO",
    scope: "global",
    appearanceModes: ["dark", "light"],
    status: "built-in",
    tokenMap: "tecno",
  }),
  "dajjal-veylora": Object.freeze({
    id: "dajjal-veylora",
    label: "Dajjal × Veylora",
    scope: "global",
    appearanceModes: ["dark", "light"],
    status: "built-in",
    tokenMap: "dajjal-veylora",
  }),
  couple: Object.freeze({
    id: "couple",
    label: "Dajjal × Veylora",
    scope: "page",
    appearanceModes: ["dark", "light"],
    status: "page-owned",
  }),
  wedding: Object.freeze({
    id: "wedding",
    label: "Wedding",
    scope: "isolated",
    appearanceModes: ["dark", "light"],
    status: "protected",
  }),
  games: Object.freeze({
    id: "games",
    label: "Games",
    scope: "isolated",
    appearanceModes: ["dark", "light"],
    status: "protected",
  }),
});

export function isThemeMode(value) {
  return value === "dark" || value === "light" || value === "system";
}

export function isThemePalette(value) {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(THEME_REGISTRY, value);
}

export function isGlobalThemePalette(value) {
  return isThemePalette(value) && THEME_REGISTRY[value].scope === "global";
}

export function resolveThemeMode(value) {
  if (value === "dark" || value === "light") return value;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
