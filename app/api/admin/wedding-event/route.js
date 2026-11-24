import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const INVITATION_SLUG = "anak-dajjal-malika";

async function getProfile() {
  const { data: invitation, error: invitationError } = await supabaseAdmin
    .from("df_invitations")
    .select("id, slug")
    .eq("slug", INVITATION_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  if (invitationError) throw invitationError;
  if (!invitation) return { invitation: null, profile: null };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("df_wedding_profiles")
    .select("event_date, event_time")
    .eq("invitation_id", invitation.id)
    .maybeSingle();

  if (profileError) throw profileError;
  return { invitation, profile };
}

export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { invitation, profile } = await getProfile();
    if (!invitation) return Response.json({ error: "Undangan aktif tidak ditemukan." }, { status: 404 });
    if (!profile) return Response.json({ error: "Profil undangan belum tersedia." }, { status: 404 });
    return Response.json({
      success: true,
      event_date: profile.event_date || "",
      event_time: String(profile.event_time || "").slice(0, 5),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin wedding event read:", error);
    return Response.json({ error: "Tidak dapat memuat waktu acara." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PATCH(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await request.json();
    const eventDate = typeof body?.event_date === "string" ? body.event_date.trim() : "";
    const eventTime = typeof body?.event_time === "string" ? body.event_time.trim() : "";

    const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const timeMatch = eventTime.match(/^(\d{2}):(\d{2})$/);
    if (!dateMatch || !timeMatch) {
      return Response.json({ error: "Tanggal dan waktu wajib diisi dengan format yang benar." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    const validDate = new Date(Date.UTC(year, month - 1, day));
    if (validDate.getUTCFullYear() !== year || validDate.getUTCMonth() !== month - 1 || validDate.getUTCDate() !== day) {
      return Response.json({ error: "Tanggal acara tidak valid." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    if (hour > 23 || minute > 59) {
      return Response.json({ error: "Waktu acara tidak valid." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const { invitation, profile } = await getProfile();
    if (!invitation) return Response.json({ error: "Undangan aktif tidak ditemukan." }, { status: 404 });
    if (!profile) return Response.json({ error: "Profil undangan belum tersedia." }, { status: 404 });

    const { data, error } = await supabaseAdmin
      .from("df_wedding_profiles")
      .update({ event_date: eventDate, event_time: eventTime })
      .eq("invitation_id", invitation.id)
      .select("event_date, event_time")
      .maybeSingle();

    if (error) throw error;
    if (!data) return Response.json({ error: "Waktu acara tidak berhasil diperbarui." }, { status: 409 });
    return Response.json({
      success: true,
      event_date: data.event_date || "",
      event_time: String(data.event_time || "").slice(0, 5),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin wedding event update:", error);
    return Response.json({ error: "Gagal menyimpan waktu acara." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
