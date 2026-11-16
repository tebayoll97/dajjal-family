import { supabaseAdmin } from "@/lib/supabaseAdmin";

function validOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.get("host"); }
  catch { return false; }
}

async function getInvitation(slug) {
  if (!slug || slug.length > 120) return null;
  const { data, error } = await supabaseAdmin.from("df_invitations")
    .select("id").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return data;
}

export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get("slug")?.trim() || "";
    const invitation = await getInvitation(slug);
    if (!invitation) return Response.json({ entries: [] }, { status: 200, headers: { "Cache-Control": "no-store" } });
    const { data: profile, error: profileError } = await supabaseAdmin.from("df_wedding_profiles")
      .select("guestbook_enabled").eq("invitation_id", invitation.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.guestbook_enabled !== true) return Response.json({ entries: [] }, { status: 200, headers: { "Cache-Control": "no-store" } });
    const { data, error } = await supabaseAdmin.from("df_guestbook")
      .select("id, guest_name, server_name, attendance, message, created_at")
      .eq("invitation_id", invitation.id).eq("is_approved", true)
      .order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return Response.json({ entries: data || [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Wedding guestbook read:", error);
    return Response.json({ error: "Unable to load guestbook." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request) {
  try {
    if (!validOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
    const body = await request.json();
    if (body?.website) return Response.json({ ok: true });
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const guestName = typeof body?.guest_name === "string" ? body.guest_name.trim() : "";
    const serverName = typeof body?.server_name === "string" ? body.server_name.trim() : "";
    const attendance = body?.attendance;
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const language = body?.language === "id" ? "id" : "en";
    if (!slug || slug.length > 120 || guestName.length < 1 || guestName.length > 16 ||
        !/^\\d{1,4}$/.test(serverName) ||
        !["yes", "maybe", "no"].includes(attendance) || message.length < 1 || message.length > 200) {
      return Response.json({ error: "Invalid guestbook details." }, { status: 400 });
    }
    const invitation = await getInvitation(slug);
    if (!invitation) return Response.json({ error: "Invitation not found." }, { status: 404 });
    const { data: profile, error: profileError } = await supabaseAdmin.from("df_wedding_profiles")
      .select("guestbook_enabled").eq("invitation_id", invitation.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.guestbook_enabled !== true) return Response.json({ error: "Guestbook is disabled." }, { status: 403 });
    const { error } = await supabaseAdmin.from("df_guestbook").insert({
      invitation_id: invitation.id, guest_name: guestName, server_name: serverName,
      attendance, message, language, is_approved: true,
    });
    if (error) throw error;
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Wedding guestbook submission:", error);
    return Response.json({ error: "Unable to submit guestbook message." }, { status: 500 });
  }
}
