const CACHE_PREFIX = "df_user_profile_cache_v1:";
const LAST_USER_KEY = "df_user_profile_last_user_v1";
const CHANGE_EVENT = "df:user-profile-cache-change";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readUserProfileCache(userId) {
  if (!isBrowser() || !userId) return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + userId);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || value.userId !== userId || typeof value.name !== "string") return null;
    return {
      name: value.name,
      avatar: typeof value.avatar === "string" ? value.avatar : "",
      updatedAt: Number(value.updatedAt) || 0,
    };
  } catch {
    return null;
  }
}

export function writeUserProfileCache(userId, identity) {
  if (!isBrowser() || !userId) return;
  try {
    window.localStorage.setItem(LAST_USER_KEY, userId);
    window.localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify({
      userId,
      name: typeof identity?.name === "string" ? identity.name : "",
      avatar: typeof identity?.avatar === "string" ? identity.avatar : "",
      updatedAt: Date.now(),
    }));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { userId } }));
  } catch {
    // Browser storage is optional; Supabase remains the source of truth.
  }
}

export function clearUserProfileCache(userId) {
  if (!isBrowser()) return;
  try {
    if (userId) {
      window.localStorage.removeItem(CACHE_PREFIX + userId);
      if (window.localStorage.getItem(LAST_USER_KEY) === userId) {
        window.localStorage.removeItem(LAST_USER_KEY);
      }
    } else {
      const lastUserId = window.localStorage.getItem(LAST_USER_KEY);
      if (lastUserId) window.localStorage.removeItem(CACHE_PREFIX + lastUserId);
      window.localStorage.removeItem(LAST_USER_KEY);
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { userId: userId || null, cleared: true } }));
  } catch {
    // Ignore unavailable storage.
  }
}

export function subscribeUserProfileCache(callback) {
  if (!isBrowser()) return () => {};
  const onCustomChange = (event) => callback(event.detail || {});
  const onStorage = (event) => {
    if (event.key === LAST_USER_KEY || event.key?.startsWith(CACHE_PREFIX)) callback({ external: true });
  };
  window.addEventListener(CHANGE_EVENT, onCustomChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustomChange);
    window.removeEventListener("storage", onStorage);
  };
}
