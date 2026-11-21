"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { withLocalePrefix } from "@/lib/localePath";
import { useLanguage } from "./LanguageProvider";
import { useLoginModal } from "./LoginModalProvider";
import ContactCenterNavIndicator from "./ContactCenterNavIndicator";
import { readUserProfileCache, writeUserProfileCache, clearUserProfileCache } from "@/lib/clientUserProfileCache";

const copy = {
  id: { checking: "Memuat profil...", guest: "Selamat datang", profile: "Profil Saya", login: "Masuk ke akun", member: "Akun pengguna" },
  en: { checking: "Loading profile...", guest: "Welcome", profile: "My Profile", login: "Sign in to your account", member: "User account" },
};

export default function NavigationProfileCard({ onNavigate }) {
  const { language } = useLanguage();
  const { openLoginModal } = useLoginModal();
  const t = copy[language] || copy.id;
  const [status, setStatus] = useState("checking");
  const currentUserId = useRef(null);
  const [identity, setIdentity] = useState({ name: "", email: "", avatar: "" });

  useEffect(() => {
    let active = true;
    async function sync(session) {
      if (!session?.user) {
        if (active) {
          clearUserProfileCache(currentUserId.current);
          currentUserId.current = null;
          setIdentity({ name: "", email: "", avatar: "" });
          setStatus("signed-out");
        }
        return;
      }
      const user = session.user;
      const metadata = user.user_metadata || {};
      currentUserId.current = user.id;
      const cached = readUserProfileCache(user.id);
      if (active && cached) {
        setIdentity({ name: cached.name, avatar: cached.avatar, email: user.email || "" });
        setStatus("signed-in");
      }
      let player = null;
      try {
        const { data, error } = await supabase.from("players").select("nickname, avatar_url")
          .eq("auth_user_id", user.id).maybeSingle();
        if (error) throw error;
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
      writeUserProfileCache(user.id, { name: freshIdentity.name, avatar: freshIdentity.avatar });
      setIdentity(freshIdentity);
      setStatus("signed-in");
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Navigation session check failed:", error);
        if (active) setStatus("signed-out");
        return;
      }
      sync(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (active) {
          clearUserProfileCache(currentUserId.current);
          currentUserId.current = null;
          setIdentity({ name: "", email: "", avatar: "" });
          setStatus("signed-out");
        }
        return;
      }
      if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
        Promise.resolve().then(() => sync(session));
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const signedIn = status === "signed-in";
  const title = identity.name || (signedIn ? t.profile : status === "checking" ? t.checking : t.guest);
  const initial = (identity.name || identity.email || "U").trim().charAt(0).toUpperCase();

  return (
    <Link href={signedIn ? withLocalePrefix("/profile", language) : "#"} onClick={(event) => { onNavigate?.(); if (!signedIn) { event.preventDefault(); openLoginModal({ next: withLocalePrefix("/profile", language) }); } }} className="df-navigation-profile-card" aria-label={signedIn ? t.profile : t.login}>
      <span className="df-navigation-profile-avatar">
        {identity.avatar ? <img src={identity.avatar} alt="" /> : <span aria-hidden="true">{signedIn ? initial : "♙"}</span>}
      </span>
      <span className="df-navigation-profile-copy">
        <strong>{title}</strong>
        <small>{signedIn ? (identity.email || t.member) : status === "checking" ? t.checking : t.login}</small>
      </span>
      <ContactCenterNavIndicator mode="member" />
      <span className="df-navigation-profile-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
