import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
const HEADERS = { "Cache-Control": "private, no-store, max-age=0, must-revalidate" };
const fail = (message, status = 400) =>
  Response.json({ success: false, error: message }, { status, headers: HEADERS });

function normalizeSettings(row) {
  return {
    enabled: Boolean(row?.enabled),
    times: [row?.slot_1_time, row?.slot_2_time, row?.slot_3_time].map((value, index) =>
      typeof value === "string" ? value.slice(0, 5) : ["10:00", "14:00", "20:00"][index]
    ),
    updated_at: row?.updated_at || null,
  };
}

export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return fail(auth.error, auth.status);

  const [settingsResult, draftsResult, logsResult] = await Promise.all([
    supabaseAdmin.from("df_dajjal_ai_autopost_settings").select("*").eq("id", true).maybeSingle(),
    supabaseAdmin.from("df_blog_articles")
      .select("id,title_id,title_en,slug_id,slug_en,source_locale,created_at,updated_at,df_contributors(display_name)")
      .eq("status", "draft").order("created_at", { ascending: true }).limit(100),
    supabaseAdmin.from("df_dajjal_ai_autopost_logs")
      .select("id,slot_key,scheduled_date,scheduled_time,article_id,status,attempts,error_message,created_at,updated_at,df_blog_articles(title_id,title_en,slug_id,slug_en)")
      .order("created_at", { ascending: false }).limit(30),
  ]);

  const error = settingsResult.error || draftsResult.error || logsResult.error;
  if (error) {
    console.error("DAJJAL AI Core data load failed:", error.code || "unknown");
    return fail("Unable to load DAJJAL AI Core data.", 500);
  }

  return Response.json({
    success: true,
    settings: normalizeSettings(settingsResult.data),
    drafts: draftsResult.data || [],
    history: logsResult.data || [],
  }, { headers: HEADERS });
}

export async function PATCH(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return fail(auth.error, auth.status);

  const body = await request.json().catch(() => ({}));
  if (typeof body.enabled !== "boolean" || !Array.isArray(body.times) || body.times.length !== 3) {
    return fail("Provide the auto-post status and exactly three posting times.", 422);
  }

  const times = body.times.map((value) => typeof value === "string" ? value.trim() : "");
  if (times.some((value) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))) {
    return fail("Each posting time must use the 24-hour HH:MM format.", 422);
  }
  if (new Set(times).size !== 3) return fail("Each of the three posting times must be different.", 422);

  const { data, error } = await supabaseAdmin
    .from("df_dajjal_ai_autopost_settings")
    .update({
      enabled: body.enabled,
      slot_1_time: times[0],
      slot_2_time: times[1],
      slot_3_time: times[2],
      updated_by: auth.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true)
    .select("*")
    .single();

  if (error || !data) {
    console.error("DAJJAL AI Core settings save failed:", error?.code || "unknown");
    return fail("Unable to save auto-post settings.", 500);
  }

  return Response.json({
    success: true,
    settings: normalizeSettings(data),
  }, { headers: HEADERS });
}
