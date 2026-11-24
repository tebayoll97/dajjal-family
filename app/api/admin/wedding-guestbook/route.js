import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const INVITATION_SLUG = "anak-dajjal-malika";
const PAGE_SIZE = 50;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getInvitationId() {
  const { data, error } = await supabaseAdmin
    .from("df_invitations")
    .select("id")
    .eq("slug", INVITATION_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
}

export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1;
    const invitationId = await getInvitationId();

    if (!invitationId) {
      return Response.json({
        success: true,
        entries: [],
        pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 },
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await supabaseAdmin
      .from("df_guestbook")
      .select("id, guest_name, server_name, attendance, message, language, is_approved, created_at", { count: "exact" })
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages > 0 && page > totalPages) {
      return Response.json({
        success: true,
        entries: [],
        pagination: { page, limit: PAGE_SIZE, total, totalPages },
      }, { headers: { "Cache-Control": "no-store" } });
    }

    return Response.json({
      success: true,
      entries: data || [],
      pagination: { page, limit: PAGE_SIZE, total, totalPages },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin wedding guestbook read:", error);
    return Response.json({ error: "Tidak dapat memuat daftar ucapan." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function DELETE(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!UUID_PATTERN.test(id)) {
      return Response.json({ error: "ID pesan tidak valid." }, { status: 400 });
    }

    const invitationId = await getInvitationId();
    if (!invitationId) {
      return Response.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("df_guestbook")
      .delete()
      .eq("id", id)
      .eq("invitation_id", invitationId)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return Response.json({ error: "Pesan tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }

    return Response.json({ success: true, deletedId: data.id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin wedding guestbook delete:", error);
    return Response.json({ error: "Gagal menghapus pesan." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}


export async function PATCH(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const guestName = typeof body?.guest_name === "string" ? body.guest_name.trim() : "";
    const serverName = typeof body?.server_name === "string" ? body.server_name.trim() : "";
    const dateText = typeof body?.date === "string" ? body.date.trim() : "";
    const timeText = typeof body?.time === "string" ? body.time.trim() : "";
    const dateMatch = dateText.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const timeMatch = timeText.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    const day = dateMatch ? Number(dateMatch[1]) : 0;
    const month = dateMatch ? Number(dateMatch[2]) : 0;
    const year = dateMatch ? Number(dateMatch[3]) : 0;
    const validDate = dateMatch && year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
    const createdAt = validDate && timeMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}T${timeMatch[1]}:${timeMatch[2]}:00+07:00` : "";

    if (!UUID_PATTERN.test(id) || guestName.length < 1 || guestName.length > 16 || !/^\d{1,4}$/.test(serverName) || !validDate || !timeMatch) {
      return Response.json({ error: "Nama, server, tanggal, atau waktu tidak valid." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const invitationId = await getInvitationId();
    if (!invitationId) return Response.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const { data, error } = await supabaseAdmin
      .from("df_guestbook")
      .update({ guest_name: guestName, server_name: serverName, created_at: createdAt })
      .eq("id", id)
      .eq("invitation_id", invitationId)
      .select("id, guest_name, server_name, created_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) return Response.json({ error: "Pesan tidak ditemukan." }, { status: 404 });
    return Response.json({ success: true, entry: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin wedding guestbook update:", error);
    return Response.json({ error: "Gagal memperbarui data pesan." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
