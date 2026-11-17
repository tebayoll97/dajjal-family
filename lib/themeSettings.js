import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_PALETTE_ID, isGlobalThemePalette } from "@/app/theme/themeRegistry";

export async function getActiveThemePreset() {
  const { data, error } = await supabaseAdmin
    .from("df_global_settings")
    .select("active_theme_preset")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("Global theme settings read failed:", error);
    return { preset: DEFAULT_PALETTE_ID, source: "fallback" };
  }

  if (!data || !isGlobalThemePalette(data.active_theme_preset)) {
    return { preset: DEFAULT_PALETTE_ID, source: "fallback" };
  }

  return { preset: data.active_theme_preset, source: "database" };
}
