import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";
import { COUPLE_CONTENT_KEYS, COUPLE_MEDIA_SLOTS } from "@/lib/coupleProfileDefaults";

export const dynamic = "force-dynamic";
const errorJson = (error, status = 400) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

async function getParams(context) { return await context.params; }

export async function GET(request, context) {
  const { slug } = await getParams(context);
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "id";
  const { data: profile, error } = await supabaseAdmin.from("df_couple_profiles")
    .select("id,male_nickname,female_nickname,slug,anniversary_date,is_published,created_at")
    .eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) return errorJson("Unable to load Couple Profile.", 500);
  if (!profile) return errorJson("Couple Profile not found.", 404);
  const [{ data: content }, { data: media }] = await Promise.all([
    supabaseAdmin.from("df_couple_contents").select("locale,content,seo_title,seo_description").eq("couple_id", profile.id).eq("locale", locale).maybeSingle(),
    supabaseAdmin.from("df_couple_media").select("slot_key,google_drive_file_id").eq("couple_id", profile.id),
  ]);
  return NextResponse.json({ profile, content: content || null, media: media || [] }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}

export async function PATCH(request, context) {
  const auth = await resolveAuthenticatedPlayer(request);
  if (!auth.ok) return errorJson(auth.error, auth.status);
  const { slug } = await getParams(context);
  const { data: profile, error: ownerError } = await supabaseAdmin.from("df_couple_profiles")
    .select("id").eq("slug", slug).eq("owner_player_id", auth.player.id).maybeSingle();
  if (ownerError) return errorJson("Unable to verify profile ownership.", 500);
  if (!profile) return errorJson("Couple Profile not found.", 404);
  let body;
  try { body = await request.json(); } catch { return errorJson("Invalid JSON body."); }

  if (body.locale !== "id" && body.locale !== "en") return errorJson("Invalid locale.");
  if (!body.content || typeof body.content !== "object" || Array.isArray(body.content)) return errorJson("Content object is required.");
  const cleanContent = {};
  for (const key of COUPLE_CONTENT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body.content, key)) {
      const value = body.content[key];
      if (typeof value !== "string" || value.length > 3000) return errorJson(`Invalid content field: ${key}`);
      cleanContent[key] = value.trim();
    }
  }
  if (Object.keys(cleanContent).length !== Object.keys(body.content).length) return errorJson("Unsupported content field.");
  const { error: contentError } = await supabaseAdmin.from("df_couple_contents").upsert({
    couple_id: profile.id, locale: body.locale, content: cleanContent,
    seo_title: typeof body.seoTitle === "string" ? body.seoTitle.slice(0, 90) : null,
    seo_description: typeof body.seoDescription === "string" ? body.seoDescription.slice(0, 220) : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "couple_id,locale" });
  if (contentError) return errorJson("Unable to save Couple Profile content.", 500);

  if (body.anniversaryDate !== undefined) {
    const dateValue = body.anniversaryDate;
    if (dateValue !== null && (typeof dateValue !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue))) return errorJson("Invalid anniversary date.");
    const { error: dateError } = await supabaseAdmin.from("df_couple_profiles")
      .update({ anniversary_date: dateValue, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    if (dateError) return errorJson("Unable to save anniversary date.", 500);
  }

  if (body.media !== undefined) {
    if (!Array.isArray(body.media) || body.media.length > COUPLE_MEDIA_SLOTS.length) return errorJson("Invalid media list.");
    const rows = [];
    for (const item of body.media) {
      if (!COUPLE_MEDIA_SLOTS.includes(item?.slotKey) || typeof item?.googleDriveFileId !== "string" ||
          !/^[A-Za-z0-9_-]{10,200}$/.test(item.googleDriveFileId.trim())) return errorJson("Invalid image reference.");
      rows.push({ couple_id: profile.id, slot_key: item.slotKey, google_drive_file_id: item.googleDriveFileId.trim(), updated_at: new Date().toISOString() });
    }
    const { error: clearMediaError } = await supabaseAdmin.from("df_couple_media").delete().eq("couple_id", profile.id);
    if (clearMediaError) return errorJson("Unable to update image references.", 500);
    if (rows.length) {
      const { error: mediaError } = await supabaseAdmin.from("df_couple_media").insert(rows);
      if (mediaError) return errorJson("Unable to save image references.", 500);
    }
  }
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request, context) {
  const auth = await resolveAuthenticatedPlayer(request);
  if (!auth.ok) return errorJson(auth.error, auth.status);
  const { slug } = await getParams(context);
  const { data, error } = await supabaseAdmin.from("df_couple_profiles").delete()
    .eq("slug", slug).eq("owner_player_id", auth.player.id).select("id").maybeSingle();
  if (error) return errorJson("Unable to reset Couple Profile.", 500);
  if (!data) return errorJson("Couple Profile not found.", 404);
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
