"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function AdminWeddingEventPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const id = language === "id";
  const tx = (indonesian, english) => id ? indonesian : english;
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
        if (active) setError(err.message || tx("Tidak dapat memverifikasi admin.", "Unable to verify administrator access."));
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
      if (!response.ok) throw new Error(result.error || tx("Gagal memuat waktu acara.", "Unable to load event time."));
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
      if (!response.ok) throw new Error(result.error || tx("Gagal menyimpan waktu acara.", "Unable to save event time."));
      setEventDate(result.event_date || "");
      setEventTime(result.event_time || "");
      setNotice(tx("Tanggal dan waktu acara berhasil diperbarui.", "Event date and time updated successfully."));
    } catch (err) {
      setError(err.message || "Gagal menyimpan waktu acara.");
    } finally {
      setSaving(false);
    }
  }

  if (checking) return <main className="min-h-screen grid place-items-center bg-[var(--df-bg)] text-[var(--df-text-secondary)] admin-small">{tx("MEMVERIFIKASI ADMIN...", "VERIFYING ADMIN...")}</main>;

  return (
    <main className="min-h-screen bg-[var(--df-bg)] px-4 py-5 text-[var(--df-text)] sm:px-6 sm:py-7">
      <div className="mx-auto max-w-2xl">
        <Link href={`/${language}/admin`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--df-border)] bg-[var(--df-primary-soft)] px-4 py-2 text-xs font-bold text-[var(--df-primary)]">← {tx("KEMBALI KE DASHBOARD", "BACK TO DASHBOARD")}</Link>
        <header className="my-7">
          <p className="text-[10px] font-extrabold tracking-[.22em] text-[var(--df-primary)]">DAJJAL FAMILY · WEDDING MANAGEMENT</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{tx("PENGATURAN WAKTU ACARA", "EVENT TIME SETTINGS")}</h1>
          <p className="mt-2 text-sm text-[var(--df-text-secondary)]">{tx("Atur tanggal dan jam resepsi. Perubahan ini juga memperbarui hitung mundur pada undangan publik.", "Set the reception date and time. Changes also update the countdown on the public invitation.")}</p>
        </header>

        <section className="rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-4 sm:p-6">
          {error && <p role="alert" className="mb-4 rounded-xl border border-[var(--df-danger)] bg-[var(--df-surface-raised)] p-3 text-sm text-[var(--df-danger)]">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-xl border border-[var(--df-success)] bg-[var(--df-surface-raised)] p-3 text-sm text-[var(--df-success)]">{notice}</p>}
          <form onSubmit={saveEventTime} className="space-y-5">
            <label className="block text-sm font-bold text-[var(--df-text)]">{tx("Tanggal acara", "Event date")}
              <input required type="date" value={eventDate} onChange={event => setEventDate(event.target.value)} disabled={loading || saving} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-3 text-base text-[var(--df-text)]" />
            </label>
            <label className="block text-sm font-bold text-[var(--df-text)]">{tx("Waktu acara (Waktu Server)", "Event time (Server Time)")}
              <input required type="time" value={eventTime} onChange={event => setEventTime(event.target.value)} disabled={loading || saving} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-3 text-base text-[var(--df-text)] " />
            </label>
            <p className="text-xs leading-relaxed text-[var(--df-text-muted)]">{tx("Jam yang disimpan digunakan oleh hitung mundur dan ditampilkan sebagai waktu server pada panel Rangkaian Acara.", "The saved time drives the countdown and is displayed as server time in the Event Schedule panel.")}</p>
            <button type="submit" disabled={loading || saving || !eventDate || !eventTime} className="min-h-12 w-full rounded-xl bg-[var(--df-primary)] px-5 py-3 text-sm font-extrabold text-[var(--df-on-primary)] hover:opacity-90 disabled:opacity-50">{saving ? tx("MENYIMPAN...", "SAVING...") : loading ? tx("MEMUAT...", "LOADING...") : tx("SIMPAN WAKTU ACARA", "SAVE EVENT TIME")}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
