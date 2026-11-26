"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";

export default function ContactCenterNavIndicator({ mode = "member" }) {
  const [count, setCount] = useState(0);
  const { language } = useLanguage();
  const client = mode === "admin" ? supabaseAdminClient : supabase;
  const refresh = useCallback(async (session) => {
    if (!session?.access_token) { setCount(0); return; }
    try {
      const response = await fetch("/api/notifications?limit=1", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json();
      setCount(Number(result.unreadCount) || 0);
    } catch { /* Keep the last known count during transient network failures. */ }
  }, []);
  useEffect(() => {
    let active = true;
    let currentSession = null;
    const sync = async (session) => { currentSession = session; if (active) await refresh(session); };
    client.auth.getSession().then(({ data }) => { if (active) sync(data?.session || null); });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => { if (active) sync(session || null); });
    const onNotificationsUpdated = () => { if (active) refresh(currentSession); };
    window.addEventListener("df:notifications-updated", onNotificationsUpdated);
    const interval = setInterval(() => { if (active) refresh(currentSession); }, 30000);
    return () => { active = false; clearInterval(interval); window.removeEventListener("df:notifications-updated", onNotificationsUpdated); subscription.unsubscribe(); };
  }, [client, refresh]);
  if (!count) return null;
  const label = count > 99 ? "99+" : String(count);
  const accessibleLabel = language === "en" ? `${count} unread messages` : `${count} pesan belum dibaca`;
  return <span className="df-support-nav-indicator" aria-label={accessibleLabel} title={accessibleLabel}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h8M8 14.5h5"/></svg>
    <span className="df-support-nav-indicator-count">{label}</span>
  </span>;
}
