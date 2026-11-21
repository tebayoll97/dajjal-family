import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { coupleDriveImage } from "@/lib/coupleProfileDefaults";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "id";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(60, Math.max(1, Number.parseInt(searchParams.get("limit") || "24", 10) || 24));
  const from = (page - 1) * limit;

  const { data: profiles, error, count } = await supabaseAdmin
    .from("df_couple_profiles")
    .select("id,male_nickname,female_nickname,slug,created_at", { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.error("Couple gallery query failed:", error);
    return NextResponse.json({ error: "Unable to load Couple Gallery." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  const ids = (profiles || []).map((profile) => profile.id);
  let media = [];
  if (ids.length) {
    const result = await supabaseAdmin
      .from("df_couple_media")
      .select("couple_id,google_drive_file_id")
      .eq("slot_key", "cover")
      .in("couple_id", ids);
    if (result.error) {
      console.error("Couple gallery media query failed:", result.error);
      return NextResponse.json({ error: "Unable to load Couple Gallery covers." }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
    media = result.data || [];
  }

  const coverMap = new Map(media.map((item) => [item.couple_id, item.google_drive_file_id]));
  const items = (profiles || []).map(({ id, male_nickname, female_nickname, slug, created_at }) => ({
    id,
    maleNickname: male_nickname,
    femaleNickname: female_nickname,
    slug,
    createdAt: created_at,
    coverUrl: coupleDriveImage(coverMap.get(id), 900) || null,
    href: `/${locale}/couple/${encodeURIComponent(slug)}`,
  }));

  return NextResponse.json({
    success: true,
    items,
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  }, { headers: { "Cache-Control": "no-store" } });
}
