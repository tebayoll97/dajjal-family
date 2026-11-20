import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const dynamic = "force-dynamic";
const SAFE_FIELDS = "id,music_id,title,artist,genre,description,mood,tags,language,audio_drive_file_id,audio_original_name,audio_mime_type,audio_size_bytes,audio_duration_seconds,cover_drive_file_id,cover_mime_type,cover_size_bytes,status,rights_holder,rights_source,rights_license_notes,rights_confirmed_at,created_at,updated_at,published_at";
function fail(message, status=400) { return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } }); }
export async function GET(request, { params }) {
  const auth = await verifyAdmin(request); if (!auth.authorized) return fail(auth.error, auth.status);
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("df_music_library").select(SAFE_FIELDS).eq("id", id).maybeSingle();
  if (error) { console.error(error); return fail("Unable to load music record.", 503); }
  if (!data) return fail("Music record not found.", 404);
  return Response.json({ success: true, item: data }, { headers: { "Cache-Control": "no-store" } });
}
export async function PATCH(request, { params }) {
  const auth = await verifyAdmin(request); if (!auth.authorized) return fail(auth.error, auth.status);
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.");
  const { data: current, error: readError } = await supabaseAdmin.from("df_music_library").select("*").eq("id", id).maybeSingle();
  if (readError) return fail("Unable to load music record.", 503);
  if (!current) return fail("Music record not found.", 404);
  const update = { updated_at: new Date().toISOString(), updated_by: auth.user.id };
  if (body.action === "publish") {
    if (!current.audio_drive_file_id || !current.audio_duration_seconds || current.audio_duration_seconds > 900) return fail("Audio is missing or duration exceeds 15 minutes.");
    if (!body.rightsConfirmed) return fail("Confirm that you have the rights or permission to publish this audio.");
    if (current.status === "archived") return fail("Restore this track to Draft before publishing.");
    update.status = "published"; update.published_at = new Date().toISOString();
    update.rights_confirmed_at = new Date().toISOString(); update.rights_confirmed_by = auth.user.id;
    update.rights_holder = String(body.rightsHolder || current.rights_holder || "").slice(0,160) || null;
    update.rights_source = String(body.rightsSource || current.rights_source || "").slice(0,500) || null;
    update.rights_license_notes = String(body.rightsNotes || current.rights_license_notes || "").slice(0,1000) || null;
  } else if (body.action === "draft" || body.action === "archive") {
    update.status = body.action === "archive" ? "archived" : "draft";
  } else if (body.action === "update") {
    if (current.status === "archived") return fail("Restore the archived track to Draft before editing.");
    const title = String(body.title || "").trim(), genre = String(body.genre || "").trim();
    if (!title || title.length > 160 || !genre || genre.length > 80) return fail("Title and Genre are required.");
    Object.assign(update, {
      title, genre, artist: String(body.artist || "").trim().slice(0,160) || null,
      description: String(body.description || "").trim().slice(0,2000) || null,
      mood: String(body.mood || "").trim().slice(0,80) || null,
      tags: Array.isArray(body.tags) ? body.tags.map(x => String(x).trim()).filter(Boolean).slice(0,20) : [],
      language: String(body.language || "").trim().slice(0,40) || null,
      rights_holder: String(body.rightsHolder || "").trim().slice(0,160) || null,
      rights_source: String(body.rightsSource || "").trim().slice(0,500) || null,
      rights_license_notes: String(body.rightsNotes || "").trim().slice(0,1000) || null,
    });
    if (body.audio?.id) {
      if (!Number.isInteger(Number(body.durationSeconds)) || Number(body.durationSeconds) < 1 || Number(body.durationSeconds) > 900) return fail("Audio duration must be 1–900 seconds.");
      Object.assign(update, { audio_drive_file_id: body.audio.id, audio_original_name: String(body.audio.originalName || "").slice(0,255), audio_mime_type: body.audio.mimeType, audio_size_bytes: Number(body.audio.size), audio_duration_seconds: Number(body.durationSeconds), status: "draft", published_at: null, rights_confirmed_at: null, rights_confirmed_by: null });
    }
    if (body.cover?.id) {
      if (!["image/jpeg","image/png","image/webp"].includes(body.cover.mimeType) || Number(body.cover.size) > 5242880) return fail("Cover must be JPG, PNG, or WebP and at most 5 MB.");
      Object.assign(update, { cover_drive_file_id: body.cover.id, cover_mime_type: body.cover.mimeType, cover_size_bytes: Number(body.cover.size) });
    }
    if (body.removeCover === true) Object.assign(update, { cover_drive_file_id: null, cover_mime_type: null, cover_size_bytes: null });
  } else return fail("Unknown action.");
  const { data, error } = await supabaseAdmin.from("df_music_library").update(update).eq("id", id).select(SAFE_FIELDS).single();
  if (error) { console.error("Music update failed:", error); return fail("Unable to save music changes.", 503); }
  return Response.json({ success: true, item: data }, { headers: { "Cache-Control": "no-store" } });
}
export async function DELETE(request, { params }) {
  const auth = await verifyAdmin(request); if (!auth.authorized) return fail(auth.error, auth.status);
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body.confirm !== "PERMANENTLY DELETE") return fail("Permanent deletion requires the exact confirmation phrase.");
  const { data: item, error: readError } = await supabaseAdmin.from("df_music_library").select("id,status").eq("id", id).maybeSingle();
  if (readError || !item) return fail("Music record not found.", 404);
  if (item.status !== "archived") return fail("Only archived tracks can be permanently deleted.");
  return fail("Permanent deletion is disabled until reference checks and audit logging are implemented.", 409);
}
