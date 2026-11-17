"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { withLocalePrefix } from "@/lib/localePath";
import { useLanguage } from "./LanguageProvider";

const CACHE_PREFIX = "df_user_profile_cache_v1:";
const LAST_USER_KEY = "df_user_profile_last_user_v1";

const copy = {
  id: { checking: "Memuat profil...", guest: "Selamat datang", profile: "Profil Saya", login: "Masuk ke akun", member: "Akun pengguna" },
  en: { checking: "Loading profile...", guest: "Welcome", profile: "My Profile", login: "Sign in to your account", member: "User account" },
};

function readCache(userId) {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.userId !== userId || typeof parsed.name !== "string") return null;
    return { name: parsed.name, avatar: typeof parsed.avatar === "string" ? parsed.avatar : "" };
  } catch {
    return null;
  }
}

function writeCache(userId, identity) {
  try {
    window.localStorage.setItem(LAST_USER_KEY, userId);
    window.localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify({
      userId,
      name: identity.name || "",
      avatar: identity.avatar || "",
      updatedAt: Date.now(),
    }));
  } catch {
    // Storage may be unavailable; the live session remains authoritative.
  }
}

function clearUserCache(userId) {
  try {
    if (userId) {
      window.localStorage.removeItem(CACHE_PREFIX + userId);
      if (window.localStorage.getItem(LAST_USER_KEY) === userId) window.localStorage.removeItem(LAST_USER_KEY);
    }
  } catch {
    // Ignore unavailable storage.
  }
}

export default function NavigationProfileCard({ onNavigate }) {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const [status, setStatus] = useState("checking");
  const currentUserId = useRef(null);
  const [identity, setIdentity] = useState(() => {
    try {
      const lastUserId = window.localStorage.getItem(LAST_USER_KEY);
      const cached = lastUserId ? readCache(lastUserId) : null;
      return cached ? { ...cached, email: "" } : { name: "", email: "", avatar: "" };
    } catch {
      return { name: "", email: "", avatar: "" };
    }
  });

  useEffect(() => {
    let active = true;
    async function sync(session) {
      if (!session?.user) {
        if (active) {
          clearUserCache(currentUserId.current);
          currentUserId.current = null;
          setIdentity({ name: "", email: "", avatar: "" });
          setStatus("signed-out");
        }
        return;
      }
      const user = session.user;
      const metadata = user.user_metadata || {};
      currentUserId.current = user.id;
      const cached = readCache(user.id);
      if (active && cached) {
        setIdentity({ ...cached, email: user.email || "" });
        setStatus("signed-in");
      }
      let player = null;
      try {
        const { data } = await supabase.from("players").select("nickname, avatar_url")
          .eq("auth_user_id", user.id).maybeSingle();
        player = data || null;
      } catch (error) {
        console.error("Navigation profile lookup failed:", error);
      }
      if (!active) return;
      const freshIdentity = {
        name: player?.nickname || metadata.full_name || metadata.name || metadata.user_name || "",
        email: user.email || "",
        avatar: player?.avatar_url || metadata.avatar_url || metadata.picture || "",
      };
      writeCache(user.id, freshIdentity);
      setIdentity(freshIdentity);
      setStatus("signed-in");
    }
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) { console.error("Navigation session check failed:", error); if (active) setStatus("signed-out"); return; }
      sync(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { if (active) { clearUserCache(currentUserId.current); currentUserId.current = null; setIdentity({ name: "", email: "", avatar: "" }); setStatus("signed-out"); } return; }
      if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) Promise.resolve().then(() => sync(session));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const signedIn = status === "signed-in";
  const title = identity.name || (signedIn ? t.profile : status === "checking" ? t.checking : t.guest);
  const href = signedIn ? withLocalePrefix("/profile", language) : `${withLocalePrefix("/login", language)}?next=%2Fprofile`;
  const initial = (identity.name || identity.email || "U").trim().charAt(0).toUpperCase();

  return (
    <Link href={href} onClick={onNavigate} className="df-navigation-profile-card" aria-label={signedIn ? t.profile : t.login}>
      <span className="df-navigation-profile-avatar">
        {identity.avatar ? <img src={identity.avatar} alt="" /> : <span aria-hidden="true">{signedIn ? initial : "♙"}</span>}
      </span>
      <span className="df-navigation-profile-copy">
        <strong>{title}</strong>
        <small>{signedIn ? (identity.email || t.member) : status === "checking" ? (identity.name ? t.member : t.checking) : t.login}</small>
      </span>
      <span className="df-navigation-profile-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
