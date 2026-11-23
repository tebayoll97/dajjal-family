"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { verifyAdminSession } from "@/lib/adminClientSession";
import { useLanguage } from "@/app/components/LanguageProvider";

const PAGE_SIZE = 50;

function formatDate(value, language = "id") {
  if (!value) return "—";
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value)) + " WIB";
}

function formatDateInput(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatTimeInput(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
}

function attendanceLabel(value, language = "id") {
  if (value === "yes") return language === "en" ? "Attending" : "Hadir";
  if (value === "maybe") return language === "en" ? "Maybe" : "Belum Pasti";
  if (value === "no") return language === "en" ? "Not attending" : "Tidak Hadir";
  return "—";
}

export default function AdminWeddingGuestbookPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const id = language === "id";
  const tx = (indonesian, english) => id ? indonesian : english;
  const [checking, setChecking] = useState(true);
  const [adminToken, setAdminToken] = useState("");
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [confirmEntry, setConfirmEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editName, setEditName] = useState("");
  const [editServer, setEditServer] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error: sessionError } = await supabaseAdminClient.auth.getSession();
        if (sessionError) throw sessionError;
        const session = data?.session;
        if (!session) {
          router.replace("/admin/login");
          return;
        }
        const response = await verifyAdminSession(session);
        if (!response.ok) {
          await supabaseAdminClient.auth.signOut();
          router.replace("/admin/login");
          return;
        }
        if (active) setAdminToken(session.access_token);
      } catch (err) {
        if (active) setError(err.message || tx("Tidak dapat memverifikasi admin.", "Unable to verify administrator access."));
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [router]);

  const loadEntries = useCallback(async (targetPage = page) => {
    if (!adminToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/wedding-guestbook?page=${targetPage}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        await supabaseAdminClient.auth.signOut();
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || tx("Gagal memuat ucapan.", "Unable to load guestbook messages."));
      const nextPagination = result.pagination || { page: targetPage, limit: PAGE_SIZE, total: 0, totalPages: 0 };
      if (nextPagination.totalPages > 0 && targetPage > nextPagination.totalPages) {
        setPage(nextPagination.totalPages);
        return;
      }
      setEntries(result.entries || []);
      setPagination(nextPagination);
      setPage(targetPage);
    } catch (err) {
      setError(err.message || "Gagal memuat ucapan.");
    } finally {
      setLoading(false);
    }
  }, [adminToken, page, router]);

  useEffect(() => {
    if (adminToken) loadEntries(page);
  }, [adminToken, page, loadEntries]);

  async function deleteEntry() {
    if (!confirmEntry || deletingId) return;
    const target = confirmEntry;
    setDeletingId(target.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/wedding-guestbook", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: target.id }),
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        await supabaseAdminClient.auth.signOut();
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || tx("Pesan gagal dihapus.", "Unable to delete the message."));
      setConfirmEntry(null);
      setNotice(tx("Pesan berhasil dihapus.", "Message deleted successfully."));
      await loadEntries(page);
    } catch (err) {
      setError(err.message || "Pesan gagal dihapus.");
    } finally {
      setDeletingId("");
    }
  }

  async function saveEntryEdit(event) {
    event.preventDefault();
    if (!editingEntry || savingEdit) return;
    const guestName = editName.trim();
    const serverName = editServer.trim();
    if (!guestName || guestName.length > 16 || !/^\d{1,4}$/.test(serverName) || !/^\d{2}\/\d{2}\/\d{4}$/.test(editDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(editTime)) {
      setEditError(tx("Nama/server atau format tanggal dan waktu tidak valid. Gunakan DD/MM/YYYY dan HH:mm.", "Name/server or date/time format is invalid. Use DD/MM/YYYY and HH:mm."));
      return;
    }
    setSavingEdit(true);
    setEditError("");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/wedding-guestbook", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingEntry.id, guest_name: guestName, server_name: serverName, date: editDate, time: editTime }),
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        await supabaseAdminClient.auth.signOut();
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || tx("Gagal menyimpan perubahan.", "Unable to save changes."));
      setEditingEntry(null);
      setNotice(tx("Nama, server, tanggal, dan waktu berhasil diperbarui.", "Name, server, date, and time updated successfully."));
      await loadEntries(page);
    } catch (err) {
      setEditError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSavingEdit(false);
    }
  }

  const start = pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, pagination.total);

  if (checking) {
    return <main className="min-h-screen bg-[var(--df-bg)] grid place-items-center px-4 text-sm font-bold tracking-widest text-[var(--df-text-secondary)]">{tx("MEMVERIFIKASI ADMIN...","VERIFYING ADMIN...")}</main>;
  }

  return (
    <main className="min-h-screen bg-[var(--df-bg)] px-4 py-5 text-[var(--df-text)] sm:px-6 sm:py-7">
      <div className="mx-auto max-w-5xl">
        <Link href={`/${language}/admin`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--df-border)] bg-[var(--df-primary-soft)] px-4 py-2 text-xs font-bold text-[var(--df-primary)]">
          ← {tx("KEMBALI KE DASHBOARD","BACK TO DASHBOARD")}
        </Link>

        <header className="my-7">
          <p className="text-[10px] font-extrabold tracking-[.22em] text-[var(--df-primary)]">DAJJAL FAMILY · WEDDING MANAGEMENT</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{tx("MANAJEMEN GUESTBOOK","GUESTBOOK MANAGEMENT")}</h1>
          <p className="mt-2 text-sm text-[var(--df-text-secondary)]">{tx("Kelola dan hapus ucapan pada undangan Anak Dajjal &amp; Malika.","Review and manage messages on the Anak Dajjal &amp; Malika invitation.")}</p>
        </header>

        <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-bold text-[var(--df-text-secondary)]">{tx("TOTAL PESAN","TOTAL MESSAGES")}</p>
            <p className="mt-1 text-2xl font-black tabular-nums">{pagination.total.toLocaleString(id ? "id-ID" : "en-US")}</p>
          </div>
          <div className="text-sm text-[var(--df-text-secondary)]">{loading ? tx("Memuat pesan...","Loading messages...") : pagination.total ? (id ? `Menampilkan ${start}–${end} dari ${pagination.total} pesan` : `Showing ${start}–${end} of ${pagination.total} messages`) : tx("Belum ada pesan.","No messages yet.")}</div>
          <button type="button" onClick={() => loadEntries(page)} disabled={loading} className="min-h-11 rounded-xl border border-[var(--df-border)] px-4 py-2 text-xs font-bold text-[var(--df-primary)] hover:bg-[var(--df-primary-soft)] disabled:opacity-50">
            {loading ? tx("MEMUAT...","LOADING...") : tx("MUAT ULANG","REFRESH")}
          </button>
        </section>

        {error && <p role="alert" className="mb-4 rounded-xl border border-[var(--df-danger)] bg-[var(--df-surface-raised)] p-3 text-sm text-[var(--df-danger)]">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-[var(--df-success)] bg-[var(--df-surface-raised)] p-3 text-sm text-[var(--df-success)]">{notice}</p>}

        <section className="space-y-3">
          {entries.map((entry, index) => (
            <article key={entry.id} className="rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-base font-extrabold">{entry.guest_name}</h2>
                    <span className="rounded-full border border-[var(--df-border)] bg-[var(--df-primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--df-primary)]">Server {entry.server_name || "—"}</span>
                    <span className="rounded-full border border-[var(--df-border)] bg-[var(--df-surface-raised)] px-2.5 py-1 text-[10px] font-bold text-[var(--df-accent)]">{attendanceLabel(entry.attendance, language)}</span>
                    <span className={entry.is_approved ? "rounded-full bg-[var(--df-surface-raised)] px-2.5 py-1 text-[10px] font-bold text-[var(--df-success)]" : "rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-[var(--df-warning)]"}>{entry.is_approved ? tx("Tampil","Published") : tx("Belum disetujui","Pending approval")}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--df-text-secondary)]">{entry.message}</p>
                  <time className="mt-3 block text-[11px] text-[var(--df-text-muted)]">{formatDate(entry.created_at, language)}</time>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--df-border)] pt-3 sm:border-0 sm:pt-0">
                  <span className="text-[10px] font-mono text-[var(--df-text-muted)]">#{(start + index).toString().padStart(3, "0")}</span>
                  <button type="button" onClick={() => { setEditingEntry(entry); setEditName(entry.guest_name || ""); setEditServer(entry.server_name || ""); setEditDate(formatDateInput(entry.created_at)); setEditTime(formatTimeInput(entry.created_at)); setEditError(""); setError(""); setNotice(""); }} disabled={Boolean(deletingId) || savingEdit} className="min-h-11 min-w-24 rounded-xl border border-[var(--df-border)] bg-[var(--df-primary-soft)] px-4 py-2 text-xs font-extrabold text-[var(--df-primary)] hover:opacity-90 disabled:opacity-50">
                    EDIT
                  </button>
                  <button type="button" onClick={() => setConfirmEntry(entry)} disabled={Boolean(deletingId)} className="min-h-11 min-w-24 rounded-xl border border-[var(--df-danger)] bg-[var(--df-surface-raised)] px-4 py-2 text-xs font-extrabold text-[var(--df-danger)] hover:opacity-90 disabled:opacity-50">
                    {tx("HAPUS","DELETE")}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!loading && entries.length === 0 && !error && (
            <div className="rounded-2xl border border-dashed border-[var(--df-border-strong)] bg-[var(--df-surface)] px-5 py-12 text-center">
              <div className="text-3xl">✉</div>
              <h2 className="mt-3 font-bold">{tx("Belum ada ucapan","No guestbook messages yet")}</h2>
              <p className="mt-1 text-sm text-[var(--df-text-muted)]">{tx("Pesan yang masuk akan tampil di sini.","New messages will appear here.")}</p>
            </div>
          )}
          {loading && entries.length === 0 && <div className="rounded-2xl bg-[var(--df-surface)] p-8 text-center text-sm text-[var(--df-primary)]">{tx("MEMUAT DAFTAR PESAN...","LOADING MESSAGE LIST...")}</div>}
        </section>

        {pagination.totalPages > 1 && (
          <nav aria-label={tx("Navigasi halaman guestbook","Guestbook pagination")} className="mt-7 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-3">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading} className="min-h-11 rounded-lg border border-[var(--df-border)] px-3 text-xs font-bold disabled:opacity-35">← {tx("Sebelumnya","Previous")}</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(number => number === 1 || number === pagination.totalPages || Math.abs(number - page) <= 2)
              .map((number, index, visible) => (
                <span key={number} className="contents">
                  {index > 0 && number - visible[index - 1] > 1 && <span className="px-1 text-[var(--df-text-muted)]">…</span>}
                  <button type="button" onClick={() => setPage(number)} disabled={loading} aria-current={page === number ? "page" : undefined} className={page === number ? "min-h-11 min-w-11 rounded-lg bg-[var(--df-primary)] px-3 text-xs font-black text-[var(--df-on-primary)]" : "min-h-11 min-w-11 rounded-lg border border-[var(--df-border)] px-3 text-xs font-bold text-[var(--df-text-secondary)] hover:bg-white/5"}>{number}</button>
                </span>
              ))}
            <button type="button" onClick={() => setPage(value => Math.min(pagination.totalPages, value + 1))} disabled={page >= pagination.totalPages || loading} className="min-h-11 rounded-lg border border-[var(--df-border)] px-3 text-xs font-bold disabled:opacity-35">{tx("Berikutnya","Next")} →</button>
          </nav>
        )}
      </div>

      {editingEntry && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[var(--df-surface-overlay)] px-4 py-6 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !savingEdit) setEditingEntry(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="guestbook-edit-title" className="w-full max-w-sm rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-5 shadow-2xl sm:p-6">
            <h2 id="guestbook-edit-title" className="text-lg font-black">{tx("Edit Data Guestbook","Edit Guestbook Entry")}</h2>
            <p className="mt-1 text-sm text-[var(--df-text-secondary)]">{tx("Ubah nama, server, tanggal, dan waktu pesan.","Edit the message name, server, date, and time.")}</p>
            <form onSubmit={saveEntryEdit} className="mt-5 space-y-4">
              {editError && <p role="alert" className="rounded-xl border border-[var(--df-danger)] bg-[var(--df-surface-raised)] p-3 text-sm text-[var(--df-danger)]">{editError}</p>}
              <label className="block text-xs font-bold text-[var(--df-text-secondary)]">{tx("Nama","Name")}
                <input autoFocus required maxLength={16} value={editName} onChange={event => setEditName(event.target.value.slice(0, 16))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-3 text-sm text-[var(--df-text)] outline-none focus:border-[var(--df-focus)]" />
                <span className="mt-1 block text-[11px] font-normal text-[var(--df-text-muted)]">{editName.length}/16 {tx("karakter","characters")}</span>
              </label>
              <label className="block text-xs font-bold text-[var(--df-text-secondary)]">{tx("Server (1–4 angka)","Server (1–4 digits)")}
                <input required type="text" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} value={editServer} onChange={event => setEditServer(event.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-3 text-sm text-[var(--df-text)] outline-none focus:border-purple-400" />
              </label>
              <label className="block text-xs font-bold text-[var(--df-text-secondary)]">{tx("Tanggal (DD/MM/YYYY)","Date (DD/MM/YYYY)")}
                <input required type="text" inputMode="numeric" placeholder="16/11/2026" value={editDate} onChange={event => setEditDate(event.target.value.slice(0, 10))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-3 text-sm text-[var(--df-text)] outline-none focus:border-purple-400" />
              </label>
              <label className="block text-xs font-bold text-[var(--df-text-secondary)]">{tx("Waktu (HH:mm, WIB)","Time (HH:mm, WIB)")}
                <input required type="text" inputMode="numeric" placeholder="19:30" value={editTime} onChange={event => setEditTime(event.target.value.slice(0, 5))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-3 text-sm text-[var(--df-text)] outline-none focus:border-purple-400" />
              </label>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => setEditingEntry(null)} disabled={savingEdit} className="min-h-11 rounded-xl border border-[var(--df-border-strong)] px-3 text-xs font-bold text-[var(--df-text)]">{tx("BATAL","CANCEL")}</button>
                <button type="submit" disabled={savingEdit || !editName.trim() || !/^\d{1,4}$/.test(editServer) || !/^\d{2}\/\d{2}\/\d{4}$/.test(editDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(editTime)} className="min-h-11 rounded-xl bg-[var(--df-primary)] px-3 text-xs font-extrabold text-[var(--df-on-primary)] hover:opacity-90 disabled:opacity-50">{savingEdit ? tx("MENYIMPAN...","SAVING...") : tx("SIMPAN","SAVE")}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {confirmEntry && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[var(--df-surface-overlay)] px-4 py-6 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !deletingId) setConfirmEntry(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="guestbook-delete-title" className="w-full max-w-sm rounded-2xl border border-[var(--df-danger)] bg-[var(--df-surface)] p-5 shadow-2xl sm:p-6">
            <div className="text-3xl">⚠</div>
            <h2 id="guestbook-delete-title" className="mt-3 text-lg font-black">{tx("Hapus pesan ini?","Delete this message?")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--df-text-secondary)]">{tx("Pesan dari","Message from")} <strong className="text-[var(--df-text)]">{confirmEntry.guest_name}</strong> {tx("akan dihapus permanen dari Guestbook.","will be permanently deleted from the Guestbook.")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmEntry(null)} disabled={Boolean(deletingId)} className="min-h-11 rounded-xl border border-[var(--df-border-strong)] px-3 text-xs font-bold text-[var(--df-text)]">{tx("BATAL","CANCEL")}</button>
              <button type="button" onClick={deleteEntry} disabled={Boolean(deletingId)} className="min-h-11 rounded-xl bg-[var(--df-danger)] px-3 text-xs font-extrabold text-[var(--df-text)] hover:opacity-90 disabled:opacity-50">{deletingId ? tx("MENGHAPUS...","DELETING...") : tx("YA, HAPUS","YES, DELETE")}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
