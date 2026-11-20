import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
  let query = supabaseAdmin
    .from("df_music_library")
    .select("id,music_id,title,artist,genre,description,mood,tags,language,audio_mime_type,audio_duration_seconds,cover_mime_type,status,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);

  if (q) {
    const safe = q.replace(/[,%()]/g, " ");
    query = query.or("title.ilike.%" + safe + "%,artist.ilike.%" + safe + "%,genre.ilike.%" + safe + "%");
  }

  const { data, error } = await query;
  if (error) {
    console.error("Public music catalog lookup failed:", error);
    return Response.json({ error: "Music catalog is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({ success: true, items: data || [] }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
