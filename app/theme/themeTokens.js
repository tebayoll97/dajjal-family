/**
 * Semantic token maps for built-in global palettes.
 * Page-owned palettes (such as Couple) remain scoped in their page CSS.
 */
import { DEFAULT_PALETTE_ID, THEME_REGISTRY } from "./themeRegistry";

export const THEME_TOKEN_MAPS = Object.freeze({
  default: Object.freeze({
    dark: Object.freeze({
      "--df-bg": "#080711",
      "--df-surface": "#151020",
      "--df-surface-raised": "#1b1528",
      "--df-surface-overlay": "#241c34",
      "--df-text": "#f7f4ff",
      "--df-text-secondary": "#c3b8d2",
      "--df-text-muted": "#978da7",
      "--df-border": "rgba(195,184,210,.16)",
      "--df-border-strong": "rgba(195,184,210,.28)",
      "--df-primary": "#7e22ce",
      "--df-primary-hover": "#9333ea",
      "--df-primary-soft": "rgba(168,85,247,.14)",
      "--df-secondary": "#6366f1",
      "--df-accent": "#22d3ee",
      "--df-focus": "#c084fc",
      "--df-success": "#22c55e",
      "--df-warning": "#f59e0b",
      "--df-danger": "#ef4444",
      "--df-info": "#38bdf8",
      "--df-on-primary": "#ffffff",
    }),
    light: Object.freeze({
      "--df-bg": "#f5f6fb",
      "--df-surface": "#ffffff",
      "--df-surface-raised": "#f0eff8",
      "--df-surface-overlay": "#ffffff",
      "--df-text": "#19172a",
      "--df-text-secondary": "#55536a",
      "--df-text-muted": "#747188",
      "--df-border": "rgba(91,76,145,.18)",
      "--df-border-strong": "rgba(91,76,145,.28)",
      "--df-primary": "#6b21a8",
      "--df-primary-hover": "#581c87",
      "--df-primary-soft": "rgba(107,33,168,.09)",
      "--df-secondary": "#4f46e5",
      "--df-accent": "#0e7490",
      "--df-focus": "#6d28d9",
      "--df-success": "#15803d",
      "--df-warning": "#a16207",
      "--df-danger": "#b91c1c",
      "--df-info": "#0369a1",
      "--df-on-primary": "#ffffff",
    }),
  }),
});

export function getThemeTokens(palette, mode) {
  const entry = THEME_REGISTRY[palette];
  const mapId = entry?.scope === "global" ? entry.tokenMap : THEME_REGISTRY[DEFAULT_PALETTE_ID].tokenMap;
  const selected = THEME_TOKEN_MAPS[mapId] || THEME_TOKEN_MAPS.default;
  return selected[mode] || selected.dark;
}
