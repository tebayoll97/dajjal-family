// Supabase Edge Function source for dajjal-ai-memory.
// See docs/dajjal-ai-memory-cloud.md for endpoint contracts.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const model = new Supabase.ai.Session("gte-small");

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
async function indexChunks(admin: ReturnType<typeof createClient>, rows: { id: string; content: string }[]) {
  let indexed = 0;
  for (const item of rows) {
    const vector = await model.run(item.content, { mean_pool: true, normalize: true });
    const { error } = await admin.from("dajjal_ai_memory_chunks").update({
      embedding: JSON.stringify(Array.from(vector)), embedding_model: "gte-small",
      embedded_at: new Date().toISOString(),
    }).eq("id", item.id);
    if (error) throw new Error(error.message);
    indexed += 1;
  }
  return indexed;
}
async function requireAdmin(req: Request, url: string, anonKey: string, admin: ReturnType<typeof createClient>) {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\\s+/i, "");
  if (!token) return null;
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: row, error: adminError } = await admin.from("admin_users").select("user_id")
    .eq("user_id", data.user.id).maybeSingle();
  return adminError || !row ? null : data.user;
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "Memory service is not configured" }, 500);
  let body: { action?: string; query?: string; limit?: number };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
  const action = body.action ?? "search";
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  if (action === "search" || action === "search_internal") {
    const internal = action === "search_internal";
    if (internal && !await requireAdmin(req, url, anonKey, admin)) return json({ error: "Owner/admin access required" }, 403);
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query) return json({ error: "query is required" }, 400);
    if (query.length > 1200) return json({ error: "query is too long" }, 413);

    if (internal) {
      const { data: pending, error } = await admin.from("dajjal_ai_memory_chunks").select("id, content")
        .is("embedding", null).order("created_at", { ascending: true }).limit(24);
      if (error) return json({ error: "Could not load pending memory", detail: error.message }, 500);
      try { if (pending?.length) await indexChunks(admin, pending); }
      catch (error) { return json({ error: "Could not index private memory", detail: String(error) }, 500); }
    } else {
      const { data: docs, error } = await admin.from("dajjal_ai_memory_documents").select("id")
        .eq("visibility", "public").eq("status", "published");
      if (error) return json({ error: "Could not inspect public memory", detail: error.message }, 500);
      const ids = (docs ?? []).map((row: { id: string }) => row.id);
      if (ids.length) {
        const { data: pending, error: pendingError } = await admin.from("dajjal_ai_memory_chunks").select("id, content")
          .in("document_id", ids).is("embedding", null).order("created_at", { ascending: true }).limit(8);
        if (pendingError) return json({ error: "Could not load public memory", detail: pendingError.message }, 500);
        try { if (pending?.length) await indexChunks(admin, pending); }
        catch (error) { return json({ error: "Could not index public memory", detail: String(error) }, 500); }
      }
    }
    const searchClient = internal ? admin : createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const vector = await model.run(query, { mean_pool: true, normalize: true });
    const { data, error } = await searchClient.rpc("search_dajjal_ai_memory", {
      query_embedding: JSON.stringify(Array.from(vector)), match_threshold: 0.30,
      match_count: Math.max(1, Math.min(Number(body.limit) || 6, 10)),
    });
    if (error) return json({ error: "Memory search failed", detail: error.message }, 500);
    return json({ success: true, scope: internal ? "internal" : "public", query, model: "gte-small", results: data ?? [], count: data?.length ?? 0 });
  }

  if (action === "index_pending") {
    if (!await requireAdmin(req, url, anonKey, admin)) return json({ error: "Owner/admin access required" }, 403);
    const { data: pending, error } = await admin.from("dajjal_ai_memory_chunks").select("id, content")
      .is("embedding", null).order("created_at", { ascending: true }).limit(24);
    if (error) return json({ error: "Could not load pending memory", detail: error.message }, 500);
    try {
      const indexed = await indexChunks(admin, pending ?? []);
      return json({ success: true, indexed, pending_before_run: pending?.length ?? 0 });
    } catch (error) { return json({ error: "Embedding update failed", detail: String(error) }, 500); }
  }
  return json({ error: "Unsupported action" }, 400);
});
