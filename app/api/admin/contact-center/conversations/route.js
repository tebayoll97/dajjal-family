import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";
import { supportError, supportJson, parsePositivePage } from "@/lib/supportCenterAuth";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function limitOf(value) { const n = Number.parseInt(value || "25", 10); return Math.min(100, Math.max(1, Number.isFinite(n) && n > 0 ? n : 25)); }
async function admin(request) {
  const result = await verifyAdmin(request);
  return result.authorized ? { user: result.user } : { response: supportError(result.error || "Unauthorized.", result.status || 401) };
}

export async function GET(request) {
  try {
    const auth = await admin(request);
    if (auth.response) return auth.response;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const page = parsePositivePage(url.searchParams.get("page"));
    const limit = limitOf(url.searchParams.get("limit"));
    if (id) {
      if (!UUID.test(id)) return supportError("Invalid conversation ID.", 400);
      const { data: conversation, error: ce } = await supabaseAdmin.from("df_support_conversations")
        .select("id,owner_user_id,subject,category,status,last_message_at,created_at,updated_at").eq("id", id).maybeSingle();
      if (ce) { console.error("Admin support conversation lookup failed:", ce); return supportError("Unable to load conversation.", 500); }
      if (!conversation) return supportError("Conversation not found.", 404);
      const from = (page - 1) * limit;
      const { data: messages, error, count } = await supabaseAdmin.from("df_support_messages")
        .select("id,sender_user_id,sender_role,body,created_at", { count: "exact" }).eq("conversation_id", id)
        .order("created_at", { ascending: true }).order("id", { ascending: true }).range(from, from + limit - 1);
      if (error) { console.error("Admin support messages lookup failed:", error); return supportError("Unable to load messages.", 500); }
      const senderIds = [...new Set((messages || []).filter((message) => message.sender_role === "member" && message.sender_user_id).map((message) => message.sender_user_id))];
      let profiles = [];
      if (senderIds.length) {
        const { data: profileRows, error: profileError } = await supabaseAdmin.from("players").select("auth_user_id,nickname,avatar_url").in("auth_user_id", senderIds);
        if (profileError) console.error("Admin support sender profile lookup failed:", profileError);
        profiles = profileRows || [];
      }
      const profileByUser = new Map(profiles.map((profile) => [profile.auth_user_id, profile]));
      const enrichedMessages = (messages || []).map((message) => {
        const profile = profileByUser.get(message.sender_user_id);
        return { ...message, sender_name: profile?.nickname || "Member", sender_avatar_url: profile?.avatar_url || "" };
      });
      const total = count || 0;
      return supportJson({ conversation, messages: enrichedMessages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: total > page * limit } });
    }

    const status = url.searchParams.get("status") || "active";
    const statuses = ["active", "open", "waiting_for_admin", "waiting_for_member", "closed"];
    if (!statuses.includes(status)) return supportError("Invalid conversation status filter.", 400);
    let query = supabaseAdmin.from("df_support_conversations")
      .select("id,owner_user_id,subject,category,status,last_message_at,created_at,updated_at", { count: "exact" })
      .order("last_message_at", { ascending: false }).order("id", { ascending: false });
    query = status === "active" ? query.in("status", ["open", "waiting_for_admin", "waiting_for_member"]) : query.eq("status", status);
    const from = (page - 1) * limit;
    const { data, error, count } = await query.range(from, from + limit - 1);
    if (error) { console.error("Admin support queue failed:", error); return supportError("Unable to load Contact Center queue.", 500); }
    const total = count || 0;
    return supportJson({ conversations: data || [], filter: status, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: total > page * limit } });
  } catch (error) { console.error("Admin Contact Center GET error:", error); return supportError("Unable to load Contact Center data.", 500); }
}

export async function POST(request) {
  try {
    const auth = await admin(request);
    if (auth.response) return auth.response;
    let rawBody;
    try { rawBody = await request.text(); } catch { return supportError("Invalid request body."); }
    if (rawBody.length > 16000) return supportError("Request is too large.", 413);
    let body;
    try { body = JSON.parse(rawBody); } catch { return supportError("Invalid JSON body."); }
    const conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!UUID.test(conversationId)) return supportError("Invalid conversation ID.", 400);
    if (message.length < 1 || message.length > 5000) return supportError("Message must contain 1–5000 characters.");
    const { data, error } = await supabaseAdmin.rpc("admin_reply_df_support_conversation", {
      p_admin_user_id: auth.user.id, p_conversation_id: conversationId, p_body: message,
    });
    if (error) {
      if (error.message?.includes("CONVERSATION_NOT_FOUND")) return supportError("Conversation not found.", 404);
      if (error.message?.includes("CONVERSATION_CLOSED")) return supportError("This conversation is closed.", 409);
      console.error("Admin Contact Center reply failed:", error);
      return supportError("Unable to send the admin reply.", 500);
    }
    const created = Array.isArray(data) ? data[0] : data;
    if (!created?.message_id) return supportError("Unable to confirm the admin reply.", 500);
    return supportJson({ message: { id: created.message_id, conversation_id: created.conversation_id, sender_role: "admin", body: message, created_at: created.created_at }, status: created.status }, 201);
  } catch (error) { console.error("Admin Contact Center POST error:", error); return supportError("Unable to send the admin reply.", 500); }
}
