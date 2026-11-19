"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "./LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

const copy = {
  id: {
    eyebrow: "DAJJAL FAMILY / SUPPORT", title: "Contact Center", lead: "Percakapan langsung dengan tim dukungan DAJJAL FAMILY.",
    signIn: "Masuk untuk menghubungi tim dukungan.", login: "Masuk ke akun", home: "Kembali",
    inbox: "Notifikasi", markAll: "Tandai semua dibaca", unread: "belum dibaca", conversations: "Percakapan Anda",
    new: "Buat percakapan", subject: "Subjek", category: "Kategori", message: "Pesan", send: "Kirim pesan",
    create: "Buat percakapan", general: "Umum", account: "Akun", technical: "Teknis", report: "Laporan", partnership: "Kemitraan",
    empty: "Belum ada percakapan. Mulai percakapan baru jika membutuhkan bantuan.", loading: "Memuat Contact Center…",
    select: "Pilih percakapan untuk melihat riwayat pesan.", reply: "Balas pesan", closed: "Percakapan ini telah ditutup.",
    waitingAdmin: "Menunggu tim dukungan", waitingMember: "Menunggu balasan Anda", open: "Terbuka", closedStatus: "Ditutup",
    error: "Terjadi kesalahan. Silakan coba lagi.", required: "Subjek dan pesan wajib diisi.", sending: "Mengirim…", back: "Semua percakapan",
    notice: "Notifikasi baru akan muncul di kotak masuk ini.", you: "Anda", support: "Tim dukungan", status: "Status",
  },
  en: {
    eyebrow: "DAJJAL FAMILY / SUPPORT", title: "Contact Center", lead: "A direct conversation with the DAJJAL FAMILY support team.",
    signIn: "Sign in to contact our support team.", login: "Sign in", home: "Go back",
    inbox: "Notifications", markAll: "Mark all as read", unread: "unread", conversations: "Your conversations",
    new: "New conversation", subject: "Subject", category: "Category", message: "Message", send: "Send message",
    create: "Create conversation", general: "General", account: "Account", technical: "Technical", report: "Report", partnership: "Partnership",
    empty: "No conversations yet. Start a new conversation when you need help.", loading: "Loading Contact Center…",
    select: "Select a conversation to view its message history.", reply: "Reply", closed: "This conversation is closed.",
    waitingAdmin: "Waiting for support", waitingMember: "Waiting for your reply", open: "Open", closedStatus: "Closed",
    error: "Something went wrong. Please try again.", required: "Subject and message are required.", sending: "Sending…", back: "All conversations",
    notice: "New notifications will appear in this inbox.", you: "You", support: "Support team", status: "Status",
  },
};

const categories = ["general", "account", "technical", "report", "partnership"];
const statusKey = (status, t) => status === "waiting_for_admin" ? t.waitingAdmin : status === "waiting_for_member" ? t.waitingMember : status === "closed" ? t.closedStatus : t.open;
const dateLabel = (value, locale) => value ? new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "";

export default function ContactCenterMember() {
  const { language } = useLanguage();
  const t = copy[language] || copy.id;
  const locale = language === "en" ? "en" : "id";
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState([]);
  const [detail, setDetail] = useState(null);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [draft, setDraft] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data?.session || null); setAuthReady(true); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next || null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const request = useCallback(async (path, options = {}) => {
    if (!session?.access_token) throw new Error("AUTH_REQUIRED");
    const response = await fetch(path, {
      ...options,
      headers: { Authorization: `Bearer ${session.access_token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || t.error);
    return result;
  }, [session, t.error]);

  const loadInbox = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true); setError("");
    try {
      const [list, inbox] = await Promise.all([
        request("/api/contact-center/conversations?limit=50"),
        request("/api/notifications?limit=20"),
      ]);
      setConversations(list.conversations || []);
      setNotifications(inbox.notifications || []);
      setUnreadCount(inbox.unreadCount || 0);
    } catch (err) { if (err.message !== "AUTH_REQUIRED") setError(err.message || t.error); }
    finally { setLoading(false); }
  }, [request, session, t.error]);

  useEffect(() => { loadInbox(); }, [loadInbox]);

  const loadDetail = useCallback(async (id) => {
    setSelectedId(id); setError("");
    try {
      const result = await request(`/api/contact-center/conversations/${id}/messages?limit=100`);
      setDetail(result.conversation); setMessages(result.messages || []);
    } catch (err) { setError(err.message || t.error); }
  }, [request, t.error]);

  async function submitCreate(event) {
    event.preventDefault();
    if (sending) return;
    if (!subject.trim() || !draft.trim()) { setError(t.required); return; }
    setSending(true); setError("");
    try {
      const result = await request("/api/contact-center/conversations", { method: "POST", body: JSON.stringify({ subject, category, message: draft }) });
      setSubject(""); setDraft(""); setShowCreate(false);
      await loadInbox();
      if (result.conversation?.id) await loadDetail(result.conversation.id);
    } catch (err) { setError(err.message || t.error); }
    finally { setSending(false); }
  }

  async function submitReply(event) {
    event.preventDefault();
    if (sending || !selectedId || !draft.trim()) return;
    setSending(true); setError("");
    try {
      await request(`/api/contact-center/conversations/${selectedId}/messages`, { method: "POST", body: JSON.stringify({ message: draft }) });
      setDraft("");
      await loadDetail(selectedId);
      await loadInbox();
    } catch (err) { setError(err.message || t.error); }
    finally { setSending(false); }
  }

  async function markRead(notification) {
    try {
      await request("/api/notifications", { method: "PATCH", body: JSON.stringify({ notificationId: notification.id }) });
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item));
      setUnreadCount((count) => Math.max(0, count - (notification.read_at ? 0 : 1)));
      if (notification.conversation_id) await loadDetail(notification.conversation_id);
    } catch (err) { setError(err.message || t.error); }
  }

  async function markAllRead() {
    try {
      await request("/api/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) });
      setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) { setError(err.message || t.error); }
  }

  const selected = useMemo(() => conversations.find((item) => item.id === selectedId) || detail, [conversations, selectedId, detail]);
  const loginHref = `${withLocalePrefix("/login", locale)}?next=%2Fcontact-center`;

  if (!authReady) return <main className="df-support-page"><p className="df-support-muted">{t.loading}</p></main>;
  if (!session) return (
    <main className="df-support-page">
      <header className="df-support-hero"><span>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.signIn}</p></header>
      <section className="df-support-panel df-support-auth"><Link className="df-support-primary" href={loginHref}>{t.login} ↗</Link></section>
    </main>
  );

  return (
    <main className="df-support-page">
      <header className="df-support-hero"><span>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.lead}</p></header>
      {error && <p className="df-support-alert" role="alert">{error}</p>}
      <section className="df-support-panel df-support-notifications">
        <div className="df-support-section-head"><div><span className="df-support-kicker">{t.inbox}</span><h2>{t.inbox} {unreadCount > 0 && <span className="df-support-count">{unreadCount}</span>}</h2></div>
          {unreadCount > 0 && <button className="df-support-link-button" type="button" onClick={markAllRead}>{t.markAll}</button>}
        </div>
        {notifications.length ? <div className="df-support-notice-list">{notifications.map((item) => (
          <button type="button" key={item.id} className={`df-support-notice ${item.read_at ? "" : "is-unread"}`} onClick={() => markRead(item)}>
            <span className="df-support-notice-dot" aria-hidden="true" /><span className="df-support-notice-copy"><strong>{item.title}</strong><small>{item.body_preview}</small><time>{dateLabel(item.created_at, locale)}</time></span>
          </button>
        ))}</div> : <p className="df-support-muted">{t.notice}</p>}
      </section>

      <div className="df-support-workspace">
        <section className="df-support-panel df-support-list">
          <div className="df-support-section-head"><div><span className="df-support-kicker">{t.conversations}</span><h2>{t.conversations}</h2></div>
            <button className="df-support-primary df-support-compact" type="button" onClick={() => { setShowCreate((v) => !v); setSelectedId(""); setDetail(null); }}>{t.new} +</button>
          </div>
          {loading ? <p className="df-support-muted">{t.loading}</p> : conversations.length ? conversations.map((item) => (
            <button type="button" key={item.id} className={`df-support-conversation ${selectedId === item.id ? "is-selected" : ""}`} onClick={() => { setShowCreate(false); loadDetail(item.id); }}>
              <strong>{item.subject}</strong><span>{statusKey(item.status, t)}</span><small>{dateLabel(item.last_message_at, locale)}</small>
            </button>
          )) : <p className="df-support-muted">{t.empty}</p>}
        </section>

        <section className="df-support-panel df-support-thread">
          {showCreate ? <>
            <div className="df-support-section-head"><div><span className="df-support-kicker">{t.new}</span><h2>{t.new}</h2></div></div>
            <form className="df-support-form" onSubmit={submitCreate}>
              <label>{t.subject}<input maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} required /></label>
              <label>{t.category}<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((value) => <option key={value} value={value}>{t[value]}</option>)}</select></label>
              <label>{t.message}<textarea rows={6} maxLength={5000} value={draft} onChange={(e) => setDraft(e.target.value)} required /></label>
              <button className="df-support-primary" disabled={sending}>{sending ? t.sending : t.create}</button>
            </form>
          </> : selected ? <>
            <div className="df-support-section-head"><div><span className="df-support-kicker">{t.status}</span><h2>{selected.subject}</h2><p className="df-support-muted">{statusKey(selected.status, t)}</p></div></div>
            <div className="df-support-messages">{messages.map((item) => <article key={item.id} className={`df-support-message ${item.sender_role === "member" ? "is-member" : "is-admin"}`}><span>{item.sender_role === "member" ? t.you : t.support}</span><p>{item.body}</p><time>{dateLabel(item.created_at, locale)}</time></article>)}</div>
            {selected.status === "closed" ? <p className="df-support-muted">{t.closed}</p> : <form className="df-support-form df-support-reply" onSubmit={submitReply}><label>{t.reply}<textarea rows={3} maxLength={5000} value={draft} onChange={(e) => setDraft(e.target.value)} required /></label><button className="df-support-primary" disabled={sending || !draft.trim()}>{sending ? t.sending : t.send}</button></form>}
          </> : <div className="df-support-placeholder"><span aria-hidden="true">✉</span><p>{t.select}</p></div>}
        </section>
      </div>
    </main>
  );
}
