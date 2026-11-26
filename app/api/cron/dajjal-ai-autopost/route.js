import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { publishDraftForAutoPost } from "@/lib/blog/publishDraftForAutoPost";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HEADERS = { "Cache-Control": "private, no-store, max-age=0, must-revalidate" };

export async function POST(request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ success: false, error: "Unauthorized." }, { status: 401, headers: HEADERS });
  }

  const { data, error } = await supabaseAdmin.rpc("claim_dajjal_ai_autopost");
  if (error) {
    console.error("DAJJAL AI scheduler claim failed:", error.code || "unknown");
    return Response.json({ success: false, error: "Unable to claim the scheduled publication." }, { status: 500, headers: HEADERS });
  }

  const claim = Array.isArray(data) ? data[0] : data;
  if (!claim) return Response.json({ success: true, skipped: "not_due" }, { headers: HEADERS });
  if (claim.claim_status !== "processing" || !claim.article_id) {
    return Response.json({ success: true, skipped: claim.claim_status || "not_due" }, { headers: HEADERS });
  }

  try {
    const result = await publishDraftForAutoPost(claim.article_id);
    const { error: finishError } = await supabaseAdmin.rpc("finish_dajjal_ai_autopost", {
      p_slot_key: claim.slot_key,
      p_scheduled_date: claim.scheduled_date,
      p_status: "published",
      p_article_id: claim.article_id,
      p_error_message: null,
    });
    if (finishError) throw new Error("The publication succeeded but its history record could not be finalized.");

    return Response.json({
      success: true,
      published: true,
      alreadyPublished: result.alreadyPublished,
      article: result.article,
      slot: claim.slot_key,
      date: claim.scheduled_date,
    }, { headers: HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publication failed.";
    await supabaseAdmin.rpc("finish_dajjal_ai_autopost", {
      p_slot_key: claim.slot_key,
      p_scheduled_date: claim.scheduled_date,
      p_status: "failed",
      p_article_id: claim.article_id,
      p_error_message: message,
    }).catch(() => null);
    console.error("DAJJAL AI auto-post failed:", message);
    return Response.json({ success: false, error: "The scheduled article could not be published." }, { status: 500, headers: HEADERS });
  }
}
