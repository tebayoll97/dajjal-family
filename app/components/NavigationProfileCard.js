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
  const nameViewport = useRef(null), nameText = useRef(null), emailViewport = useRef(null), emailText = useRef(null);
  const [nameOverflow,setNameOverflow]=useState(false), [emailOverflow,setEmailOverflow]=useState(false);
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
    return (
    <div className={"df-navigation-profile-shell" + (signedIn ? " is-signed-in" : "")}>
      <button type="button" className="df-navigation-profile-card" aria-expanded={expanded} aria-controls="df-navigation-profile-menu" aria-label={expanded ? t.collapse : t.expand}
        onClick={() => { if (!signedIn) { if (status === "checking") return; openLoginModal({ next: withLocalePrefix("/profile", language) }); return; } setExpanded(value => !value); }}>
        <span className="df-navigation-profile-avatar">{identity.avatar ? <img src={identity.avatar} alt="" /> : <span aria-hidden="true">{signedIn ? initial : "♙"}</span>}</span>
        <span className="df-navigation-profile-copy">
          {status === "checking" ? <VerificationState variant="user" compact /> : <>
            <span className="df-navigation-profile-identity-row"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg><span ref={nameViewport} className={"df-navigation-profile-marquee-viewport" + (nameOverflow ? " is-overflowing" : "")}><span className="df-navigation-profile-marquee-track"><strong ref={nameText}>{title}</strong>{nameOverflow && <strong aria-hidden="true">{title}</strong>}</span></span></span>
            <span className="df-navigation-profile-identity-row"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><span ref={emailViewport} className={"df-navigation-profile-marquee-viewport" + (emailOverflow ? " is-overflowing" : "")}><span className="df-navigation-profile-marquee-track"><small ref={emailText}>{signedIn ? (identity.email || t.member) : t.login}</small>{emailOverflow && <small aria-hidden="true">{signedIn ? (identity.email || t.member) : t.login}</small>}</span></span></span>
          </>}
        </span>
        <ContactCenterNavIndicator mode="member" />
        <svg className={"df-navigation-profile-arrow" + (expanded ? " is-expanded" : "")} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {signedIn && <div id="df-navigation-profile-menu" className="df-navigation-profile-menu" data-expanded={expanded}>
        <Link href={withLocalePrefix("/profile", language)} onClick={() => onNavigate?.()} aria-current={pathname.endsWith("/profile") ? "page" : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span>{t.profile}</span></Link>
        <Link href={withLocalePrefix(contributorRoute, language)} onClick={() => onNavigate?.()}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg><span>{contributorAccess === "approved" ? t.contributor : t.apply}</span></Link>
        <div className="df-navigation-profile-logout"><AccountLogout /></div>
      </div>}
    </div>
  );
}
