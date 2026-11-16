"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";

const PAGE_SIZE = 50;

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value)) + " WIB";
}

function attendanceLabel(value) {
  if (value === "yes") return "Hadir";
  if (value === "maybe") return "Belum Pasti";
  if (value === "no") return "Tidak Hadir";
  return "—";
}

export default function AdminWeddingGuestbookPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [adminToken, setAdminToken] = useState("");
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [confirmEntry, setConfirmEntry] = useState(null);
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
        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (!response.ok) {
          await supabaseAdminClient.auth.signOut();
          router.replace("/admin/login");
          return;
        }
        if (active) setAdminToken(session.access_token);
      } catch (err) {
        if (active) setError(err.message || "Tidak dapat memverifikasi admin.");
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
      if (!response.ok) throw new Error(result.error || "Gagal memuat ucapan.");
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
      if (!response.ok) throw new Error(result.error || "Pesan gagal dihapus.");
      setConfirmEntry(null);
      setNotice("Pesan berhasil dihapus.");
      await loadEntries(page);
    } catch (err) {
      setError(err.message || "Pesan gagal dihapus.");
    } finally {
      setDeletingId("");
    }
  }

  const start = pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, pagination.total);

  if (checking) {
    return <main className="min-h-screen bg-[#080711] grid place-items-center px-4 text-sm font-bold tracking-widest text-purple-200">MEMVERIFIKASI ADMIN...</main>;
  }

  return (
    <main className="min-h-screen bg-[#080711] px-4 py-7 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="inline-flex min-h-11 items-center rounded-xl border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/20">
          ← KEMBALI KE DASHBOARD
        </Link>

        <header className="my-7">
          <p className="text-[10px] font-extrabold tracking-[.22em] text-pink-300">DAJJAL FAMILY · WEDDING MANAGEMENT</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">GUESTBOOK <span className="text-pink-300">MANAGEMENT</span></h1>
          <p className="mt-2 text-sm text-gray-400">Kelola dan hapus ucapan pada undangan Anak Dajjal &amp; Malika.</p>
        </header>

        <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-purple-400/20 bg-[#151020] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-bold text-gray-400">TOTAL PESAN</p>
            <p className="mt-1 text-2xl font-black tabular-nums">{pagination.total.toLocaleString("id-ID")}</p>
          </div>
          <div className="text-sm text-gray-400">{loading ? "Memuat pesan..." : pagination.total ? `Menampilkan ${start}–${end} dari ${pagination.total} pesan` : "Belum ada pesan."}</div>
          <button type="button" onClick={() => loadEntries(page)} disabled={loading} className="min-h-11 rounded-xl border border-purple-300/25 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/10 disabled:opacity-50">
            {loading ? "MEMUAT..." : "MUAT ULANG"}
          </button>
        </section>

        {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</p>}

        <section className="space-y-3">
          {entries.map((entry, index) => (
            <article key={entry.id} className="rounded-2xl border border-white/10 bg-[#151020] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-base font-extrabold">{entry.guest_name}</h2>
                    <span className="rounded-full border border-purple-300/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-200">Server {entry.server_name || "—"}</span>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200">{attendanceLabel(entry.attendance)}</span>
                    <span className={entry.is_approved ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200" : "rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-200"}>{entry.is_approved ? "Tampil" : "Belum disetujui"}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-200">{entry.message}</p>
                  <time className="mt-3 block text-[11px] text-gray-500">{formatDate(entry.created_at)}</time>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 pt-3 sm:border-0 sm:pt-0">
                  <span className="text-[10px] font-mono text-gray-600">#{(start + index).toString().padStart(3, "0")}</span>
                  <button type="button" onClick={() => setConfirmEntry(entry)} disabled={Boolean(deletingId)} className="min-h-11 min-w-24 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-extrabold text-red-200 hover:bg-red-500/20 disabled:opacity-50">
                    HAPUS
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!loading && entries.length === 0 && !error && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#151020] px-5 py-12 text-center">
              <div className="text-3xl">✉</div>
              <h2 className="mt-3 font-bold">Belum ada ucapan</h2>
              <p className="mt-1 text-sm text-gray-500">Pesan yang masuk akan tampil di sini.</p>
            </div>
          )}
          {loading && entries.length === 0 && <div className="rounded-2xl bg-[#151020] p-8 text-center text-sm text-purple-200">MEMUAT DAFTAR PESAN...</div>}
        </section>

        {pagination.totalPages > 1 && (
          <nav aria-label="Pagination guestbook" className="mt-7 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#151020] p-3">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading} className="min-h-11 rounded-lg border border-white/10 px-3 text-xs font-bold disabled:opacity-35">← Sebelumnya</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(number => number === 1 || number === pagination.totalPages || Math.abs(number - page) <= 2)
              .map((number, index, visible) => (
                <span key={number} className="contents">
                  {index > 0 && number - visible[index - 1] > 1 && <span className="px-1 text-gray-600">…</span>}
                  <button type="button" onClick={() => setPage(number)} disabled={loading} aria-current={page === number ? "page" : undefined} className={page === number ? "min-h-11 min-w-11 rounded-lg bg-purple-600 px-3 text-xs font-black text-white" : "min-h-11 min-w-11 rounded-lg border border-white/10 px-3 text-xs font-bold text-gray-300 hover:bg-white/5"}>{number}</button>
                </span>
              ))}
            <button type="button" onClick={() => setPage(value => Math.min(pagination.totalPages, value + 1))} disabled={page >= pagination.totalPages || loading} className="min-h-11 rounded-lg border border-white/10 px-3 text-xs font-bold disabled:opacity-35">Berikutnya →</button>
          </nav>
        )}
      </div>

      {confirmEntry && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 py-6 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !deletingId) setConfirmEntry(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="guestbook-delete-title" className="w-full max-w-sm rounded-2xl border border-red-400/25 bg-[#171321] p-5 shadow-2xl sm:p-6">
            <div className="text-3xl">⚠</div>
            <h2 id="guestbook-delete-title" className="mt-3 text-lg font-black">Hapus pesan ini?</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">Pesan dari <strong className="text-white">{confirmEntry.guest_name}</strong> akan dihapus permanen dari Guestbook.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmEntry(null)} disabled={Boolean(deletingId)} className="min-h-11 rounded-xl border border-white/15 px-3 text-xs font-bold text-gray-200">BATAL</button>
              <button type="button" onClick={deleteEntry} disabled={Boolean(deletingId)} className="min-h-11 rounded-xl bg-red-600 px-3 text-xs font-extrabold text-white hover:bg-red-500 disabled:opacity-50">{deletingId ? "MENGHAPUS..." : "YA, HAPUS"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
