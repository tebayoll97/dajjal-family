"use client";

import { supabaseAdminClient } from "@/lib/supabaseAdminClient";

// Cache only the UI-level administrator profile check for this browser session.
// Every protected API route must continue to verify its own bearer token.
const CACHE_TTL_MS = 3 * 60 * 1000;
let cached = null;
let pending = null;
let authListenerReady = false;

function bindAuthListener() {
  if (authListenerReady) return;
  authListenerReady = true;
  supabaseAdminClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      cached = null;
      pending = null;
      return;
    }
    if (event === "SIGNED_IN" || event === "USER_UPDATED") {
      cached = null;
      pending = null;
      return;
    }
    if (event === "TOKEN_REFRESHED" && cached && session?.user?.id === cached.userId) {
      cached = { ...cached, accessToken: session.access_token, expiresAt: Date.now() + CACHE_TTL_MS };
    }
  });
}

export async function verifyAdminSession(session) {
  bindAuthListener();
  const userId = session?.user?.id;
  const accessToken = session?.access_token;
  if (!userId || !accessToken) {
    cached = null;
    return { ok: false, status: 401, json: async () => ({ success: false, error: "Session required." }) };
  }

  if (
    cached &&
    cached.userId === userId &&
    cached.accessToken === accessToken &&
    cached.expiresAt > Date.now()
  ) {
    return cached.response;
  }

  if (pending?.userId === userId && pending.accessToken === accessToken) {
    return pending.promise;
  }

  const promise = (async () => {
    const response = await fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    const responseLike = {
      ok: response.ok,
      status: response.status,
      json: async () => result,
    };

    if (response.ok) {
      cached = {
        userId,
        accessToken,
        expiresAt: Date.now() + CACHE_TTL_MS,
        response: responseLike,
      };
    } else {
      cached = null;
    }
    return responseLike;
  })();

  pending = { userId, accessToken, promise };
  try {
    return await promise;
  } finally {
    if (pending?.promise === promise) pending = null;
  }
}

export function clearAdminSessionCache() {
  cached = null;
  pending = null;
}
