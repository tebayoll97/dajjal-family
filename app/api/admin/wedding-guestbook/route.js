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
