import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveSupportMember, supportError, supportJson } from "@/lib/supportCenterAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await resolveSupportMember(request);
    if (!auth.ok) return supportError(auth.error, auth.status);
    const url = new URL(request.url);
    const rawLimit = Number.parseInt(url.searchParams.get("limit") || "20", 10);
    const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      supabaseAdmin.from("df_notifications")
        .select("id,conversation_id,message_id,notification_type,title,body_preview,read_at,created_at")
        .eq("recipient_user_id", auth.userId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabaseAdmin.from("df_notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_user_id", auth.userId)
        .is("read_at", null),
    ]);
    if (error || countError) {
      console.error("Notification inbox lookup failed:", error || countError);
      return supportError("Unable to load notifications.", 500);
    }
    return supportJson({ notifications: data || [], unreadCount: count || 0 });
  } catch (error) {
    console.error("Notification inbox error:", error);
    return supportError("Unable to load notifications.", 500);
  }
}

export async function PATCH(request) {
  try {
    const auth = await resolveSupportMember(request);
    if (!auth.ok) return supportError(auth.error, auth.status);
    let raw;
    try { raw = await request.text(); } catch { return supportError("Invalid request body."); }
    if (raw.length > 2000) return supportError("Request is too large.", 413);
    let body;
    try { body = JSON.parse(raw); } catch { return supportError("Invalid JSON body."); }

    let query = supabaseAdmin.from("df_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_user_id", auth.userId)
      .is("read_at", null);
    if (body?.markAll === true) {
      // Mark only this authenticated recipient's unread notifications.
    } else if (typeof body?.notificationId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.notificationId)) {
      query = query.eq("id", body.notificationId);
    } else {
      return supportError("Provide a valid notificationId or markAll=true.");
    }
    const { data, error } = await query.select("id");
    if (error) {
      console.error("Notification read-state update failed:", error);
      return supportError("Unable to update notification status.", 500);
    }
    return supportJson({ updated: data?.length || 0 });
  } catch (error) {
    console.error("Notification read-state error:", error);
    return supportError("Unable to update notification status.", 500);
  }
}
