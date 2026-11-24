import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const FALLBACK_PATH = "/dajjalfamily_icon_192.png";

export async function GET(request, { params }) {
  const { slug } = await params;
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("df_couple_profiles")
    .select("id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (profileError || !profile) {
    return new Response("Not found", { status: 404 });
  }

  const { data: cover, error: coverError } = await supabaseAdmin
    .from("df_couple_media")
    .select("google_drive_file_id")
    .eq("couple_id", profile.id)
    .eq("slot_key", "cover")
    .maybeSingle();

  if (!coverError && cover?.google_drive_file_id) {
    try {
      const imageUrl = new URL("https://drive.google.com/thumbnail");
      imageUrl.searchParams.set("id", cover.google_drive_file_id);
      imageUrl.searchParams.set("sz", "w1200");
      const imageResponse = await fetch(imageUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" },
      });
      const contentType = imageResponse.headers.get("content-type") || "";
      if (imageResponse.ok && contentType.toLowerCase().startsWith("image/")) {
        return new Response(await imageResponse.arrayBuffer(), {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    } catch {
      // A missing, private, or temporarily unavailable Drive cover falls back to the brand mark.
    }
  }

  return Response.redirect(new URL(FALLBACK_PATH, request.url), 302);
}
