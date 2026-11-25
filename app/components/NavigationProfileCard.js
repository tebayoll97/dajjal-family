"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { withLocalePrefix } from "@/lib/localePath";
import { useLanguage } from "./LanguageProvider";
import { useLoginModal } from "./LoginModalProvider";
import ContactCenterNavIndicator from "./ContactCenterNavIndicator";
import AccountLogout from "./AccountLogout";
import { VerificationState } from "./ui";
import { readUserProfileCache, writeUserProfileCache, clearUserProfileCache } from "@/lib/clientUserProfileCache";

const copy = {
  id: { checking: "Memuat profil...", guest: "Selamat datang", profile: "Profil", login: "Masuk ke akun", member: "Akun pengguna", contributor: "Panel Kontributor", apply: "Daftar Kontributor", expand: "Buka menu akun", collapse: "Tutup menu akun" },
  en: { checking: "Loading profile...", guest: "Welcome", profile: "Profile", login: "Sign in to your account", member: "User account", contributor: "Contributor Panel", apply: "Become a Contributor", expand: "Open account menu", collapse: "Close account menu" },
};

export default function NavigationProfileCard({ onNavigate }) {
  const { language } = useLanguage();
  const pathname = usePathname() || "";
  const { openLoginModal } = useLoginModal();
  const t = copy[language] || copy.id;
  const [status, setStatus] = useState("checking");
  const [expanded, setExpanded] = useState(false);
  const [contributorAccess, setContributorAccess] = useState("unknown");
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
          setExpanded(false);
          setContributorAccess("none");
        }
        return;
      }
      const user = session.user;
      const metadata = user.user_metadata || {};
      currentUserId.current = user.id;
      setContributorAccess("checking");
      try {
        const response = await fetch("/api/blog/contributors", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));
        if (active) setContributorAccess(result.owner || result.contributor?.status === "approved" ? "approved" : result.contributor?.status || "none");
      } catch {
        if (active) setContributorAccess("unknown");
      }
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
          setExpanded(false);
          setContributorAccess("none");
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
  const contributorRoute = contributorAccess === "approved" ? "/author/me" : "/blog/author/apply";

  return (
    <div className={`df-navigation-profile-shell${signedIn ? " is-signed-in" : ""}`}>
      <button type="button" className="df-navigation-profile-card" aria-expanded={expanded}
        aria-controls="df-navigation-profile-menu" aria-label={expanded ? t.collapse : t.expand}
        onClick={() => {
          if (!signedIn) {
            if (status === "checking") return;
            openLoginModal({ next: withLocalePrefix("/profile", language) });
            return;
          }
          setExpanded(value => !value);
        }}>
        <span className="df-navigation-profile-avatar">
          {identity.avatar ? <img src={identity.avatar} alt="" /> : <span aria-hidden="true">{signedIn ? initial : "♙"}</span>}
        </span>
        <span className="df-navigation-profile-copy">
          {status === "checking" ? <VerificationState variant="user" compact /> : <><strong>{title}</strong><small>{signedIn ? (identity.email || t.member) : t.login}</small></>}
        </span>
        <ContactCenterNavIndicator mode="member" />
        <span className={`df-navigation-profile-arrow${expanded ? " is-expanded" : ""}`} aria-hidden="true">⌄</span>
      </button>
      {signedIn && (
        <div id="df-navigation-profile-menu" className="df-navigation-profile-menu" data-expanded={expanded}>
          <Link href={withLocalePrefix("/profile", language)} onClick={() => onNavigate?.()} aria-current={pathname.replace(/^\/(id|en)/, "") === "/profile" ? "page" : undefined}>
            <span aria-hidden="true">◉</span>{t.profile}
          </Link>
          <Link href={withLocalePrefix(contributorRoute, language)} onClick={() => onNavigate?.()}>
            <span aria-hidden="true">✎</span>{contributorAccess === "approved" ? t.contributor : t.apply}
          </Link>
          <div className="df-navigation-profile-logout"><AccountLogout /></div>
        </div>
      )}
    </div>
  );
}
