import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  parsePositivePage,
  resolveSupportMember,
  supportError,
  supportJson,
} from "@/lib/supportCenterAuth";

export const dynamic = "force-dynamic";

const CATEGORIES = new Set(["general", "account", "technical", "report", "partnership"]);
const SUBJECT_MAX = 120;
const BODY_MAX = 5000;
const PAGE_SIZE = 25;

export async function GET(request) {
  try {
    const auth = await resolveSupportMember(request);
    if (!auth.ok) return supportError(auth.error, auth.status);

    const url = new URL(request.url);
    const page = parsePositivePage(url.searchParams.get("page"));
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") || String(PAGE_SIZE), 10) || PAGE_SIZE));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabaseAdmin
      .from("df_support_conversations")
      .select("id,subject,category,status,last_message_at,created_at,updated_at", { count: "exact" })
      .eq("owner_user_id", auth.userId)
      .order("last_message_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Contact Center conversation list failed:", error);
      return supportError("Unable to load conversations.", 500);
    }

    const total = count || 0;
    return supportJson({
      conversations: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: total > page * limit,
      },
    });
  } catch (error) {
    console.error("Contact Center conversation list error:", error);
    return supportError("Unable to load conversations.", 500);
  }
}

export async function POST(request) {
  try {
    const auth = await resolveSupportMember(request);
    if (!auth.ok) return supportError(auth.error, auth.status);

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16000) return supportError("Request is too large.", 413);

    let body;
    try {
      body = await request.json();
    } catch {
      return supportError("Invalid JSON body.");
    }

    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const category = typeof body?.category === "string" ? body.category : "general";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (subject.length < 1 || subject.length > SUBJECT_MAX) {
      return supportError("Subject must contain 1–120 characters.");
    }
    if (!CATEGORIES.has(category)) {
      return supportError("Invalid conversation category.");
    }
    if (message.length < 1 || message.length > BODY_MAX) {
      return supportError("Message must contain 1–5000 characters.");
    }

    // owner_user_id is derived only from the verified Supabase Auth user.
    // The RPC inserts the conversation and first message atomically and
    // enforces a durable per-account creation limit in PostgreSQL.
    const { data, error } = await supabaseAdmin.rpc("create_df_support_conversation", {
      p_owner_user_id: auth.userId,
      p_subject: subject,
      p_category: category,
      p_body: message,
    });

    if (error) {
      if (error.message?.includes("SUPPORT_RATE_LIMITED")) {
        return supportError("You have reached the limit. Please try again in a few minutes.", 429);
      }
      console.error("Contact Center conversation creation failed:", error);
      return supportError("Unable to create the conversation.", 500);
    }

    const created = Array.isArray(data) ? data[0] : data;
    if (!created?.conversation_id || !created?.message_id) {
      console.error("Contact Center RPC returned an unexpected result.");
      return supportError("Unable to confirm conversation creation.", 500);
    }

    return supportJson({
      conversation: {
        id: created.conversation_id,
        subject,
        category,
        status: created.status,
        created_at: created.created_at,
        last_message_at: created.last_message_at,
      },
      firstMessage: { id: created.message_id },
    }, 201);
  } catch (error) {
    console.error("Contact Center conversation creation error:", error);
    return supportError("Unable to create the conversation.", 500);
  }
}
