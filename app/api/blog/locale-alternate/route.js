import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get("slug") || "").trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!slug || !["id", "en"].includes(from) || !["id", "en"].includes(to) || from === to) {
    return Response.json({ error: "Invalid language-switch request." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const sourceColumn = from === "id" ? "slug_id" : "slug_en";
  const targetColumn = to === "id" ? "slug_id" : "slug_en";
  const { data, error } = await supabaseAdmin
    .from("df_blog_articles")
    .select("slug_id,slug_en")
    .eq("status", "published")
    .not("published_at", "is", null)
    .eq(sourceColumn, slug)
    .maybeSingle();

  if (error) {
    console.error("Blog locale alternate lookup failed:", error);
    return Response.json({ error: "Unable to resolve the translated article URL." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  const targetSlug = data?.[targetColumn];
  if (!targetSlug) {
    return Response.json({ error: "The translated article is not available." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({ slug: targetSlug }, { headers: { "Cache-Control": "no-store" } });
}
