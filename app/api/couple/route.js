import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";
import { COUPLE_CONTENT_DEFAULTS } from "@/lib/coupleProfileDefaults";

export const dynamic = "force-dynamic";
const errorJson = (error, status = 400) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

function slugBase(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
}

export async function GET(request) {
  const auth = await resolveAuthenticatedPlayer(request);
  if (!auth.ok) return errorJson(auth.error, auth.status);
  const { data, error } = await supabaseAdmin.from("df_couple_profiles")
    .select("id,male_nickname,female_nickname,slug,anniversary_date,is_published,created_at,updated_at")
    .eq("owner_player_id", auth.player.id).maybeSingle();
  if (error) return errorJson("Unable to load Couple Profile.", 500);
  return NextResponse.json({ profile: data || null }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const auth = await resolveAuthenticatedPlayer(request);
  if (!auth.ok) return errorJson(auth.error, auth.status);
  let body;
  try { body = await request.json(); } catch { return errorJson("Invalid JSON body."); }
  const male = typeof body.maleNickname === "string" ? body.maleNickname.trim() : "";
  const female = typeof body.femaleNickname === "string" ? body.femaleNickname.trim() : "";
  if (male.length < 1 || male.length > 40 || female.length < 1 || female.length > 40) {
    return errorJson("Both nicknames are required (1–40 characters).");
  }
  const { data: existing, error: existingError } = await supabaseAdmin.from("df_couple_profiles")
    .select("slug").eq("owner_player_id", auth.player.id).maybeSingle();
  if (existingError) return errorJson("Unable to check existing Couple Profile.", 500);
  if (existing) return NextResponse.json({ profile: existing, alreadyExists: true }, { status: 409 });

  const base = slugBase(`${male}-and-${female}`) || "our-couple";
  let profile = null;
  let lastError = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabaseAdmin.from("df_couple_profiles").insert({
      owner_player_id: auth.player.id, male_nickname: male, female_nickname: female, slug: candidate, is_published: true,
    }).select("id,male_nickname,female_nickname,slug,anniversary_date,is_published").single();
    if (!error) { profile = data; break; }
    lastError = error;
    if (error.code !== "23505") break;
  }
  if (!profile) {
    if (lastError?.code === "23505") return errorJson("Unable to generate a unique profile URL. Please try again.", 409);
    console.error("Couple Profile creation failed:", lastError);
    return errorJson("Unable to create Couple Profile.", 500);
  }

  const contentRows = ["id", "en"].map((locale) => ({
    couple_id: profile.id, locale, content: COUPLE_CONTENT_DEFAULTS[locale],
  }));
  const { error: contentError } = await supabaseAdmin.from("df_couple_contents").insert(contentRows);
  if (contentError) {
    await supabaseAdmin.from("df_couple_profiles").delete().eq("id", profile.id).eq("owner_player_id", auth.player.id);
    console.error("Couple Profile defaults failed:", contentError);
    return errorJson("Profile could not be initialized. Please try again.", 500);
  }
  return NextResponse.json({ profile }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
