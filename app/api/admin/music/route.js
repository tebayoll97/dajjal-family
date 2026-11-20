import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function error(message, status) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return error(auth.error, auth.status);

  const url = new URL(request.url);
  const search = (url.searchParams.get("q") || "").trim().slice(0, 120);
  const status = url.searchParams.get("status") || "all";
  const genre = (url.searchParams.get("genre") || "").trim().slice(0, 80);
  const sort = url.searchParams.get("sort") || "recent";
  const allowedStatus = ["all", "published", "draft", "archived"];
  const sortMap = {
    recent: ["created_at", false],
    updated: ["updated_at", false],
    title_asc: ["title", true],
    title_desc: ["title", false],
    duration: ["audio_duration_seconds", true],
    size: ["audio_size_bytes", false],
  };
  if (!allowedStatus.includes(status) || !sortMap[sort]) return error("Invalid catalog filter.", 400);

  let query = supabaseAdmin.from("df_music_library")
    .select("id,music_id,title,artist,genre,description,mood,tags,language,audio_mime_type,audio_size_bytes,audio_duration_seconds,cover_mime_type,status,published_at,created_at,updated_at")
    .order(sortMap[sort][0], { ascending: sortMap[sort][1] })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  if (genre) query = query.eq("genre", genre);
  if (search) {
    const safe = search.replace(/[,%()]/g, " ");
    query = query.or(`title.ilike.%${safe}%,artist.ilike.%${safe}%,music_id.ilike.%${safe}%,genre.ilike.%${safe}%`);
  }
  const { data, error: dbError } = await query;
  if (dbError) {
    console.error("Music catalog query failed:", dbError);
    return error("Music catalog is not ready. Check the approved database migration.", 503);
  }
  return Response.json({ success: true, items: data || [] }, { headers: { "Cache-Control": "no-store" } });
}
