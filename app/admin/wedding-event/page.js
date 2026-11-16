"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";

export default function AdminWeddingEventPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error: sessionError } = await supabaseAdminClient.auth.getSession();
        if (sessionError) throw sessionError;
        const session = data?.session;
        if (!session) { router.replace("/admin/login"); return; }
        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (!response.ok) {
          await supabaseAdminClient.auth.signOut();
          router.replace("/admin/login");
          return;
        }
        if (active) setToken(session.access_token);
      } catch (err) {
        if (active) setError(err.message || "Tidak dapat memverifikasi admin.");
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    fetch("/api/admin/wedding-event", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).then(async response => {
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        await supabaseAdminClient.auth.signOut();
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Gagal memuat waktu acara.");
      if (active) {
        setEventDate(result.event_date || "");
        setEventTime(result.event_time || "");
      }
    }).catch(err => { if (active) setError(err.message || "Gagal memuat waktu acara."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, router]);

  async function saveEventTime(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/wedding-event", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ event_date: eventDate, event_time: eventTime }),
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        await supabaseAdminClient.auth.signOut();
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan waktu acara.");
      setEventDate(result.event_date || "");
      setEventTime(result.event_time || "");
      setNotice("Tanggal dan waktu acara berhasil diperbarui.");
    } catch (err) {
      setError(err.message || "Gagal menyimpan waktu acara.");
    } finally {
      setSaving(false);
    }
  }

  if (checking) return <main className="min-h-screen grid place-items-center bg-[#080711] text-purple-200">MEMVERIFIKASI ADMIN...</main>;

  return (
    <main className="min-h-screen bg-[#080711] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin" className="inline-flex min-h-11 items-center rounded-xl border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-200">← KEMBALI KE DASHBOARD</Link>
        <header className="my-7">
          <p className="text-[10px] font-extrabold tracking-[.22em] text-amber-300">DAJJAL FAMILY · WEDDING MANAGEMENT</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">PENGATURAN WAKTU ACARA</h1>
          <p className="mt-2 text-sm text-gray-400">Atur tanggal dan jam resepsi. Perubahan ini juga memperbarui hitung mundur pada undangan publik.</p>
        </header>

        <section className="rounded-2xl border border-amber-400/20 bg-[#151020] p-4 sm:p-6">
          {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</p>}
          <form onSubmit={saveEventTime} className="space-y-5">
            <label className="block text-sm font-bold text-gray-200">Tanggal acara
              <input required type="date" value={eventDate} onChange={event => setEventDate(event.target.value)} disabled={loading || saving} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black/25 px-3 text-base text-white [color-scheme:dark]" />
            </label>
            <label className="block text-sm font-bold text-gray-200">Waktu acara (Waktu Server)
              <input required type="time" value={eventTime} onChange={event => setEventTime(event.target.value)} disabled={loading || saving} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black/25 px-3 text-base text-white [color-scheme:dark]" />
            </label>
            <p className="text-xs leading-relaxed text-gray-500">Jam yang disimpan digunakan oleh hitung mundur dan ditampilkan sebagai waktu server pada panel Rangkaian Acara.</p>
            <button type="submit" disabled={loading || saving || !eventDate || !eventTime} className="min-h-12 w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-black hover:bg-amber-400 disabled:opacity-50">{saving ? "MENYIMPAN..." : loading ? "MEMUAT..." : "SIMPAN WAKTU ACARA"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
