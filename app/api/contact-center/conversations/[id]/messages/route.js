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
