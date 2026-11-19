"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";

const copy = {
  id: { title: "Contact Center", lead: "Kelola percakapan dan balas pesan anggota.", loading: "Memuat antrean…", active: "Aktif", closed: "Ditutup", all: "Semua aktif", waiting: "Menunggu admin", member: "Menunggu anggota", open: "Terbuka", subject: "Subjek", reply: "Balasan", send: "Kirim balasan", sending: "Mengirim…", empty: "Belum ada percakapan pada filter ini.", select: "Pilih percakapan dari antrean.", inbox: "Notifikasi", markAll: "Tandai semua dibaca", error: "Tidak dapat memuat Contact Center.", back: "Dashboard Admin", noReply: "Percakapan ditutup dan tidak dapat dibalas." },
  en: { title: "Contact Center", lead: "Manage conversations and reply to members.", loading: "Loading queue…", active: "Active", closed: "Closed", all: "All active", waiting: "Waiting for admin", member: "Waiting for member", open: "Open", subject: "Subject", reply: "Reply", send: "Send reply", sending: "Sending…", empty: "No conversations in this filter.", select: "Select a conversation from the queue.", inbox: "Notifications", markAll: "Mark all as read", error: "Unable to load Contact Center.", back: "Admin Dashboard", noReply: "This conversation is closed and cannot receive replies." },
};
const dateLabel = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "";
const statusText = (status, t) => status === "waiting_for_admin" ? t.waiting : status === "waiting_for_member" ? t.member : status === "closed" ? t.closed : t.open;

export default function ContactCenterAdmin() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("active");
  const [queue, setQueue] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabaseAdminClient.auth.getSession().then(({ data }) => {
      if (active) { setSession(data?.session || null); setReady(true); }
    });
    const { data: { subscription } } = supabaseAdminClient.auth.onAuthStateChange((_event, next) => { if (active) setSession(next || null); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const request = useCallback(async (path, options = {}) => {
    if (!session?.access_token) throw new Error("AUTH_REQUIRED");
    const response = await fetch(path, { ...options, headers: { Authorization: `Bearer ${session.access_token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }, cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || t.error);
    return result;
  }, [session, t.error]);

  const loadInbox = useCallback(async () => {
    const result = await request("/api/notifications?limit=30");
    setNotifications(result.notifications || []); setUnread(result.unreadCount || 0);
  }, [request]);

  const loadQueue = useCallback(async () => {
    const result = await request(`/api/admin/contact-center/conversations?status=${filter}&limit=100`);
    setQueue(result.conversations || []);
  }, [filter, request]);

  useEffect(() => {
    if (!ready) return;
    if (!session) { router.replace("/admin/login"); return; }
    let active = true;
    Promise.all([loadQueue(), loadInbox()]).catch((err) => { if (active) setError(err.message || t.error); });
    return () => { active = false; };
  }, [ready, session, filter, loadQueue, loadInbox, router, t.error]);

  const loadDetail = useCallback(async (id) => {
    setSelectedId(id); setError("");
    try {
      const result = await request(`/api/admin/contact-center/conversations?id=${id}&limit=100`);
      setConversation(result.conversation); setMessages(result.messages || []);
    } catch (err) { setError(err.message || t.error); }
  }, [request, t.error]);

  async function sendReply(event) {
    event.preventDefault();
    if (busy || !selectedId || !draft.trim()) return;
    setBusy(true); setError("");
    try {
      await request("/api/admin/contact-center/conversations", { method: "POST", body: JSON.stringify({ conversationId: selectedId, message: draft }) });
      setDraft("");
      await Promise.all([loadDetail(selectedId), loadQueue(), loadInbox()]);
    } catch (err) { setError(err.message || t.error); }
    finally { setBusy(false); }
  }

  async function markRead(item) {
    try {
      await request("/api/notifications", { method: "PATCH", body: JSON.stringify({ notificationId: item.id }) });
      setNotifications((items) => items.map((n) => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnread((value) => Math.max(0, value - (item.read_at ? 0 : 1)));
      if (item.conversation_id) await loadDetail(item.conversation_id);
    } catch (err) { setError(err.message || t.error); }
  }
  async function markAll() {
    try {
      await request("/api/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) });
      setNotifications((items) => items.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnread(0);
    } catch (err) { setError(err.message || t.error); }
  }

  if (!ready || !session) return <main className="df-support-page"><p className="df-support-muted">{t.loading}</p></main>;

  return (
    <main className="df-support-page df-support-admin">
      <header className="df-support-hero"><span>DAJJAL FAMILY / ADMIN</span><h1>{t.title}</h1><p>{t.lead}</p></header>
      <div className="df-support-admin-actions"><Link href="/admin" className="df-support-link-button">← {t.back}</Link><span>{unread} {t.inbox.toLowerCase()}</span></div>
      {error && <p className="df-support-alert" role="alert">{error}</p>}
      <section className="df-support-panel df-support-notifications">
        <div className="df-support-section-head"><div><span className="df-support-kicker">{t.inbox}</span><h2>{t.inbox} {unread > 0 && <span className="df-support-count">{unread}</span>}</h2></div>{unread > 0 && <button type="button" className="df-support-link-button" onClick={markAll}>{t.markAll}</button>}</div>
        {notifications.length ? <div className="df-support-notice-list">{notifications.map((item) => <button type="button" key={item.id} className={`df-support-notice ${item.read_at ? "" : "is-unread"}`} onClick={() => markRead(item)}><span className="df-support-notice-dot" /><span className="df-support-notice-copy"><strong>{item.title}</strong><small>{item.body_preview}</small><time>{dateLabel(item.created_at)}</time></span></button>)}</div> : <p className="df-support-muted">—</p>}
      </section>
      <div className="df-support-workspace df-support-admin-workspace">
        <section className="df-support-panel df-support-list">
          <div className="df-support-section-head"><div><span className="df-support-kicker">QUEUE</span><h2>{t.title}</h2></div></div>
          <div className="df-support-filters">
            <button type="button" aria-pressed={filter === "active"} onClick={() => setFilter("active")}>{t.all}</button>
            <button type="button" aria-pressed={filter === "waiting_for_admin"} onClick={() => setFilter("waiting_for_admin")}>{t.waiting}</button>
            <button type="button" aria-pressed={filter === "waiting_for_member"} onClick={() => setFilter("waiting_for_member")}>{t.member}</button>
            <button type="button" aria-pressed={filter === "closed"} onClick={() => setFilter("closed")}>{t.closed}</button>
          </div>
          {queue.length ? queue.map((item) => <button type="button" key={item.id} className={`df-support-conversation ${selectedId === item.id ? "is-selected" : ""}`} onClick={() => loadDetail(item.id)}><strong>{item.subject}</strong><span>{statusText(item.status, t)}</span><small>{dateLabel(item.last_message_at)}</small></button>) : <p className="df-support-muted">{t.empty}</p>}
        </section>
        <section className="df-support-panel df-support-thread">
          {conversation ? <>
            <div className="df-support-section-head"><div><span className="df-support-kicker">{statusText(conversation.status, t)}</span><h2>{conversation.subject}</h2><p className="df-support-muted">{conversation.category} · {conversation.owner_user_id}</p></div></div>
            <div className="df-support-messages">{messages.map((item) => <article key={item.id} className={`df-support-message ${item.sender_role === "admin" ? "is-member" : "is-admin"}`}><span>{item.sender_role === "admin" ? "Admin" : "Member"}</span><p>{item.body}</p><time>{dateLabel(item.created_at)}</time></article>)}</div>
            {conversation.status === "closed" ? <p className="df-support-muted">{t.noReply}</p> : <form className="df-support-form df-support-reply" onSubmit={sendReply}><label>{t.reply}<textarea rows={3} maxLength={5000} value={draft} onChange={(e) => setDraft(e.target.value)} required /></label><button className="df-support-primary" disabled={busy || !draft.trim()}>{busy ? t.sending : t.send}</button></form>}
          </> : <div className="df-support-placeholder"><span>✉</span><p>{t.select}</p></div>}
        </section>
      </div>
    </main>
  );
}
