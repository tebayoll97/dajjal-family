import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGoogleDriveAccessToken } from "@/lib/googleDriveStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Track not found." }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("df_music_library")
    .select("cover_drive_file_id,cover_mime_type")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) return Response.json({ error: "Cover is temporarily unavailable." }, { status: 503 });
  if (!data?.cover_drive_file_id) return new Response(null, { status: 404 });

  try {
    const token = await getGoogleDriveAccessToken();
    const upstream = await fetch(
      "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(data.cover_drive_file_id) + "?alt=media",
      { headers: { Authorization: "Bearer " + token }, cache: "no-store", signal: AbortSignal.timeout(20000) }
    );
    if (!upstream.ok) return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
    return new Response(upstream.body, {
      headers: {
        "Content-Type": data.cover_mime_type || "application/octet-stream",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Public music cover failed:", error);
    return new Response(null, { status: 502 });
  }
}
