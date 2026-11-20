import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGoogleDriveAccessToken } from "@/lib/googleDriveStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request, { params }) {
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Track not found." }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("df_music_library")
    .select("audio_drive_file_id,audio_mime_type,audio_size_bytes,status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Published music lookup failed:", error);
    return Response.json({ error: "Audio is temporarily unavailable." }, { status: 503 });
  }
  if (!data?.audio_drive_file_id) return Response.json({ error: "Track not found." }, { status: 404 });

  try {
    const accessToken = await getGoogleDriveAccessToken();
    const headers = { Authorization: "Bearer " + accessToken };
    const range = request.headers.get("range");
    if (range) headers.Range = range;

    const upstream = await fetch(
      "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(data.audio_drive_file_id) + "?alt=media",
      { headers, cache: "no-store", signal: AbortSignal.timeout(45000) }
    );

    if (!upstream.ok && upstream.status !== 206) {
      console.error("Google Drive public stream returned:", upstream.status);
      return Response.json({ error: "Unable to stream this track." }, { status: upstream.status === 404 ? 404 : 502 });
    }

    const responseHeaders = new Headers({
      "Content-Type": data.audio_mime_type,
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
    });
    for (const key of ["content-length", "content-range"]) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    console.error("Public music stream failed:", error);
    return Response.json({ error: "Audio is temporarily unavailable." }, { status: 502 });
  }
}
