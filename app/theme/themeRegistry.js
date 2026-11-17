/**
 * Dajjal Family Theme Registry.
 *
 * Palette identity is independent from appearance mode.
 * Page-owned experiences may declare their own palette scope without
 * changing the global palette selected for the rest of the website.
 */
export const DEFAULT_PALETTE_ID = "default";
export const THEME_MODE_STORAGE_KEY = "dajjal-family-theme";
export const THEME_PALETTE_STORAGE_KEY = "dajjal-family-palette";

export const THEME_REGISTRY = Object.freeze({
  default: Object.freeze({
    id: "default",
    label: "Default Dajjal Family",
    scope: "global",
    appearanceModes: ["dark", "light"],
    status: "built-in",
    tokenMap: "default",
  }),
  couple: Object.freeze({
    id: "couple",
    label: "Dajjal × Veylora",
    scope: "page",
    appearanceModes: ["dark", "light"],
    status: "built-in",
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

export function resolveThemeMode(value) {
  if (value === "dark" || value === "light") return value;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
