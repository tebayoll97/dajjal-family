import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { coupleDriveImage } from "@/lib/coupleProfileDefaults";

export const dynamic = "force-dynamic";

function errorJson(message, status) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return errorJson(auth.error, auth.status);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "50", 10) || 50));
  const from = (page - 1) * limit;

  const { data: profiles, error, count } = await supabaseAdmin
    .from("df_couple_profiles")
    .select("id,male_nickname,female_nickname,slug,is_published,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.error("Admin Couple Profile query failed:", error);
    return errorJson("Unable to load Couple Profiles.", 500);
  }

  const ids = (profiles || []).map((profile) => profile.id);
  let media = [];
  if (ids.length) {
    const result = await supabaseAdmin.from("df_couple_media")
      .select("couple_id,google_drive_file_id").eq("slot_key", "cover").in("couple_id", ids);
    if (result.error) {
      console.error("Admin Couple Profile media query failed:", result.error);
      return errorJson("Unable to load Couple Profile covers.", 500);
    }
    media = result.data || [];
  }
  const coverMap = new Map(media.map((item) => [item.couple_id, item.google_drive_file_id]));

  return NextResponse.json({
    success: true,
    profiles: (profiles || []).map((profile) => ({
      id: profile.id,
      maleNickname: profile.male_nickname,
      femaleNickname: profile.female_nickname,
      slug: profile.slug,
      isPublished: profile.is_published,
      createdAt: profile.created_at,
      coverUrl: coupleDriveImage(coverMap.get(profile.id), 480) || null,
    })),
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return errorJson(auth.error, auth.status);

  let body;
  try { body = await request.json(); } catch { return errorJson("Invalid JSON body.", 400); }
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug || slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return errorJson("A valid Couple Profile slug is required.", 400);
  }

  const { data, error } = await supabaseAdmin
    .from("df_couple_profiles")
    .delete()
    .eq("slug", slug)
    .select("id,slug")
    .maybeSingle();

  if (error) {
    console.error("Admin Couple Profile deletion failed:", error);
    return errorJson("Unable to delete this Couple Profile.", 500);
  }
  if (!data) return errorJson("Couple Profile not found.", 404);

  return NextResponse.json({
    success: true,
    deleted: { slug: data.slug },
    message: "Couple Profile deleted. The player account and original Drive files were not changed.",
  }, { headers: { "Cache-Control": "no-store" } });
}
