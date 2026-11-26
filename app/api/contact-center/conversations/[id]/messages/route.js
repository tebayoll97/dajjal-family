import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  parsePositivePage,
  resolveSupportMember,
  supportError,
  supportJson,
} from "@/lib/supportCenterAuth";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 50;

export async function GET(request, context) {
  try {
    const auth = await resolveSupportMember(request);
    if (!auth.ok) return supportError(auth.error, auth.status);

    const { id } = await context.params;
    if (!UUID.test(id || "")) return supportError("Invalid conversation ID.", 400);

    // Ownership is checked before any message query. Never accept an owner ID
    // or sender role from the request.
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("df_support_conversations")
      .select("id,subject,category,status")
      .eq("id", id)
      .eq("owner_user_id", auth.userId)
      .maybeSingle();

    if (conversationError) {
      console.error("Contact Center ownership lookup failed:", conversationError);
      return supportError("Unable to load this conversation.", 500);
    }
    if (!conversation) return supportError("Conversation not found.", 404);

    const url = new URL(request.url);
    const page = parsePositivePage(url.searchParams.get("page"));
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") || String(PAGE_SIZE), 10) || PAGE_SIZE));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabaseAdmin
      .from("df_support_messages")
      .select("id,sender_role,body,created_at", { count: "exact" })
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Contact Center message history failed:", error);
      return supportError("Unable to load messages.", 500);
    }

    const total = count || 0;
    return supportJson({
      conversation,
      messages: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: total > page * limit,
      },
    });
  } catch (error) {
    console.error("Contact Center message history error:", error);
    return supportError("Unable to load messages.", 500);
  }
}

export async function POST(request, context) {
  try {
    const auth = await resolveSupportMember(request);
    if (!auth.ok) return supportError(auth.error, auth.status);
    const { id } = await context.params;
    if (!UUID.test(id || "")) return supportError("Invalid conversation ID.", 400);

    let rawBody;
    try { rawBody = await request.text(); } catch { return supportError("Invalid request body."); }
    if (rawBody.length > 16000) return supportError("Request is too large.", 413);

    let body;
    try { body = JSON.parse(rawBody); } catch { return supportError("Invalid JSON body."); }
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (message.length < 1 || message.length > 5000) return supportError("Message must contain 1–5000 characters.");

    const { data, error } = await supabaseAdmin.rpc("member_reply_df_support_conversation", {
      p_owner_user_id: auth.userId, p_conversation_id: id, p_body: message,
    });
    if (error) {
      if (error.message?.includes("SUPPORT_REPLY_RATE_LIMITED")) return supportError("You have reached the reply limit. Please try again later.", 429);
      if (error.message?.includes("CONVERSATION_NOT_FOUND")) return supportError("Conversation not found.", 404);
      if (error.message?.includes("CONVERSATION_CLOSED")) return supportError("This conversation is closed.", 409);
      console.error("Contact Center member reply failed:", error);
      return supportError("Unable to send your reply.", 500);
    }
    const created = Array.isArray(data) ? data[0] : data;
    if (!created?.message_id) return supportError("Unable to confirm your reply.", 500);
    return supportJson({ message: { id: created.message_id, conversation_id: created.conversation_id, sender_role: "member", body: message, created_at: created.created_at }, status: created.status }, 201);
  } catch (error) {
    console.error("Contact Center member reply error:", error);
    return supportError("Unable to send your reply.", 500);
  }
}
