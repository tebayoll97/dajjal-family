import "server-only";
import { isIP } from "node:net";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const RATE_LIMIT_WINDOW_SECONDS = 600;

function getTrustedClientIp(request) {
  // Vercel overwrites x-forwarded-for before it reaches the function.
  // Prefer x-real-ip; use the sanitized forwarded value as a fallback.
  const candidate =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";

  const ip = candidate.trim();
  return isIP(ip) ? ip : null;
}

export async function checkWeddingSubmissionRateLimit(request, scope) {
  if (scope !== "rsvp" && scope !== "guestbook") {
    throw new Error("Invalid wedding submission rate-limit scope.");
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return {
      allowed: false,
      status: 503,
      retryAfter: 60,
      error: "Submission temporarily unavailable. Please retry shortly.",
    };
  }

  const { data, error } = await supabaseAdmin.rpc(
    "consume_wedding_submission_rate_limit",
    {
      p_scope: scope,
      p_client_ip: clientIp,
    }
  );

  if (error) {
    console.error("Wedding submission rate limiter:", error);
    throw new Error("Wedding submission rate limiter unavailable.");
  }

  if (data !== true) {
    return {
      allowed: false,
      status: 429,
      retryAfter: RATE_LIMIT_WINDOW_SECONDS,
      error: "Too many submissions. Please wait before trying again.",
    };
  }

  return { allowed: true };
}

export function weddingRateLimitResponse(result) {
  return Response.json(
    { error: result.error },
    {
      status: result.status,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(result.retryAfter),
      },
    }
  );
}
