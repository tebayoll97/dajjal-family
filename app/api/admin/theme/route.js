import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_PALETTE_ID, isGlobalThemePalette } from "@/app/theme/themeRegistry";
import { getActiveThemePreset } from "@/lib/themeSettings";

export const dynamic = "force-dynamic";

function jsonError(message, status) {
  return Response.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return jsonError(auth.error, auth.status);

  const { preset, source } = await getActiveThemePreset();
  return Response.json(
    { success: true, activeThemePreset: preset, source },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return jsonError(auth.error, auth.status);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("A JSON object is required.", 400);
  }

  const allowedKeys = ["activeThemePreset"];
  if (Object.keys(body).some((key) => !allowedKeys.includes(key))) {
    return jsonError("Unexpected request field.", 400);
  }

  const preset = body.activeThemePreset;
  if (!isGlobalThemePalette(preset)) {
    return jsonError("Unsupported global theme preset.", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("df_global_settings")
    .update({
      active_theme_preset: preset,
      updated_at: new Date().toISOString(),
      updated_by: auth.user.id,
    })
    .eq("id", true)
    .select("active_theme_preset, updated_at")
    .maybeSingle();

  if (error) {
    console.error("Global theme settings update failed:", error);
    return jsonError("Unable to publish the global theme preset.", 500);
  }

  if (!data) {
    return jsonError("Global theme settings row is missing.", 500);
  }

  return Response.json(
    {
      success: true,
      activeThemePreset: data.active_theme_preset,
      updatedAt: data.updated_at,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
