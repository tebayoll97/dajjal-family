/**
 * Semantic token maps for global presets.
 * Couple page CSS remains page-scoped; global preset colors are separate maps.
 */
import { DEFAULT_PALETTE_ID, THEME_REGISTRY } from "./themeRegistry";

const tecno = Object.freeze({
  dark: Object.freeze({
    "--df-bg":"#080711","--df-surface":"#151020","--df-surface-raised":"#1b1528","--df-surface-overlay":"#241c34",
    "--df-text":"#f7f4ff","--df-text-secondary":"#c3b8d2","--df-text-muted":"#978da7",
    "--df-border":"rgba(195,184,210,.16)","--df-border-strong":"rgba(195,184,210,.28)",
    "--df-primary":"#7e22ce","--df-primary-hover":"#9333ea","--df-primary-soft":"rgba(168,85,247,.14)",
    "--df-secondary":"#6366f1","--df-accent":"#22d3ee","--df-focus":"#c084fc",
    "--df-success":"#22c55e","--df-warning":"#f59e0b","--df-danger":"#ef4444","--df-info":"#38bdf8","--df-on-primary":"#ffffff",
    "--df-home-brand-gradient":"linear-gradient(115deg,#a855f7 0%,#6366f1 52%,#22d3ee 100%)",
    "--df-home-brand-glow":"rgba(139,92,246,.18)","--df-home-orbit":"rgba(174,154,255,.3)","--df-home-orbit-accent":"#67e8f9",
  }),
  light: Object.freeze({
    "--df-bg":"#f5f6fb","--df-surface":"#ffffff","--df-surface-raised":"#f0eff8","--df-surface-overlay":"#ffffff",
    "--df-text":"#19172a","--df-text-secondary":"#55536a","--df-text-muted":"#747188",
    "--df-border":"rgba(91,76,145,.18)","--df-border-strong":"rgba(91,76,145,.28)",
    "--df-primary":"#6b21a8","--df-primary-hover":"#581c87","--df-primary-soft":"rgba(107,33,168,.09)",
    "--df-secondary":"#4f46e5","--df-accent":"#0e7490","--df-focus":"#6d28d9",
    "--df-success":"#15803d","--df-warning":"#a16207","--df-danger":"#b91c1c","--df-info":"#0369a1","--df-on-primary":"#ffffff",
    "--df-home-brand-gradient":"linear-gradient(115deg,#a855f7 0%,#6366f1 52%,#22d3ee 100%)",
    "--df-home-brand-glow":"rgba(139,92,246,.12)","--df-home-orbit":"rgba(109,40,217,.24)","--df-home-orbit-accent":"#0e7490",
  }),
});

const coupleTextAndStatus = {
  dark: {
    "--df-text":"#f7f4ff","--df-text-secondary":"#c3b8d2","--df-text-muted":"#978da7",
    "--df-border":"rgba(195,184,210,.16)","--df-border-strong":"rgba(195,184,210,.28)",
    "--df-success":"#22c55e","--df-warning":"#f59e0b","--df-danger":"#ef4444","--df-info":"#38bdf8","--df-on-primary":"#ffffff",
  },
  light: {
    "--df-text":"#19172a","--df-text-secondary":"#55536a","--df-text-muted":"#747188",
    "--df-border":"rgba(91,76,145,.18)","--df-border-strong":"rgba(91,76,145,.28)",
    "--df-success":"#15803d","--df-warning":"#a16207","--df-danger":"#b91c1c","--df-info":"#0369a1","--df-on-primary":"#ffffff",
  },
};

function coupleMode(mode) {
  const light = mode === "light";
  return Object.freeze({
    "--df-bg": light ? "#f3faff" : "#100b0e",
    "--df-surface": light ? "#ffffff" : "#160e12",
    "--df-surface-raised": light ? "#eaf6fd" : "#241018",
    "--df-surface-overlay": light ? "#ffffff" : "#241018",
    "--df-primary": light ? "#398fc5" : "#b51f3b",
    "--df-primary-hover": light ? "#2876a8" : "#94182f",
    "--df-primary-soft": light ? "rgba(57,143,197,.12)" : "rgba(181,31,59,.15)",
    "--df-secondary": light ? "#2876a8" : "#d34a62",
    "--df-accent": light ? "#2876a8" : "#d34a62",
    "--df-focus": light ? "#176b9f" : "#ef7188",
    "--df-home-brand-gradient": light ? "linear-gradient(115deg,#398fc5 0%,#2876a8 52%,#69bde8 100%)" : "linear-gradient(115deg,#b51f3b 0%,#d34a62 52%,#ef7188 100%)",
    "--df-home-brand-glow": light ? "rgba(57,143,197,.16)" : "rgba(181,31,59,.18)",
    "--df-home-orbit": light ? "rgba(57,143,197,.28)" : "rgba(211,74,98,.3)",
    "--df-home-orbit-accent": light ? "#69bde8" : "#ef7188",
    ...coupleTextAndStatus[mode],
  });
}

export const THEME_TOKEN_MAPS = Object.freeze({
  tecno,
  "dajjal-veylora": Object.freeze({
    dark: coupleMode("dark"),
    light: coupleMode("light"),
  }),
});

export function getThemeTokens(palette, mode) {
  const entry = THEME_REGISTRY[palette];
  const mapId = entry?.scope === "global" ? entry.tokenMap : THEME_REGISTRY[DEFAULT_PALETTE_ID].tokenMap;
  const selected = THEME_TOKEN_MAPS[mapId] || THEME_TOKEN_MAPS[DEFAULT_PALETTE_ID];
  return selected[mode] || selected.dark;
}
