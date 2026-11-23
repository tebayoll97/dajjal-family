"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";

const messages = {
  id: {
    checking: "MEMVERIFIKASI AKSES ADMIN...",
    title: "PENYIMPANAN TERPUSAT",
    subtitle: "Hubungkan Google Drive sebagai penyimpanan utama DAJJAL FAMILY.",
    back: "KEMBALI KE DASHBOARD",
    connect: "Hubungkan Google Drive",
    reconnect: "Hubungkan ulang Google Drive",
    connected: "Google Drive terhubung",
    disconnected: "Google Drive belum terhubung",
    account: "Akun Google",
    folder: "Folder utama",
    folderReady: "Siap",
    connectNote: "Kamu akan diarahkan ke Google untuk memberikan izin akses Drive.",
    loading: "Memuat status...",
    connecting: "Menghubungkan...",
    refresh: "Periksa status",
    success: "Google Drive berhasil dihubungkan.",
    denied: "Izin Google Drive ditolak.",
    invalid_state: "Validasi keamanan OAuth gagal. Silakan coba lagi.",
    configuration_error: "Konfigurasi keamanan server belum lengkap.",
    unauthorized: "Akses admin tidak terverifikasi.",
    connection_failed: "Google Drive gagal dihubungkan. Periksa konfigurasi OAuth dan coba lagi.",
    uploadTitle: "Uji unggah file",
    uploadNote: "Unggah gambar atau audio maksimal 20 MB untuk menguji koneksi penyimpanan.",
    choose: "Pilih file",
    upload: "Unggah ke Google Drive",
    uploading: "Mengunggah...",
    uploaded: "File berhasil diunggah.",
    uploadError: "File gagal diunggah.",
    noFile: "Pilih file terlebih dahulu.",
    error: "Terjadi kesalahan.",
  },
  en: {
    checking: "VERIFYING ADMIN ACCESS...",
    title: "CENTRAL STORAGE",
    subtitle: "Connect Google Drive as DAJJAL FAMILY's primary storage.",
    back: "BACK TO DASHBOARD",
    connect: "Connect Google Drive",
    reconnect: "Reconnect Google Drive",
    connected: "Google Drive connected",
    disconnected: "Google Drive not connected",
    account: "Google account",
    folder: "Root folder",
    folderReady: "Ready",
    connectNote: "You will be redirected to Google to grant Drive access.",
    loading: "Loading status...",
    connecting: "Connecting...",
    refresh: "Refresh status",
    success: "Google Drive connected successfully.",
    denied: "Google Drive permission was denied.",
    invalid_state: "OAuth security validation failed. Please try again.",
    configuration_error: "Server security configuration is incomplete.",
    unauthorized: "Admin access could not be verified.",
    connection_failed: "Google Drive connection failed. Check OAuth configuration and try again.",
    uploadTitle: "Upload test",
    uploadNote: "Upload an image or audio file up to 20 MB to test storage.",
    choose: "Choose file",
    upload: "Upload to Google Drive",
    uploading: "Uploading...",
    uploaded: "File uploaded successfully.",
    uploadError: "File upload failed.",
    noFile: "Choose a file first.",
    error: "Something went wrong.",
  },
};

export default function AdminStoragePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = messages[language] || messages.id;
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [file, setFile] = useState(null);

  const loadStatus = useCallback(async (accessToken) => {
    const response = await fetch("/api/storage/google/status", {
      headers: { Authorization: "Bearer " + accessToken },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || t.error);
    setStatus(result);
  }, [t.error]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("google_drive");
    if (result) {
      const text = messages[language]?.[result] || messages.id[result] || messages.en[result] || messages.id.error;
      setNotice(text);
      window.history.replaceState({}, "", window.location.pathname);
    }

    let active = true;
    (async () => {
      try {
        const { data, error: sessionError } = await supabaseAdminClient.auth.getSession();
        if (sessionError) throw sessionError;
        const session = data?.session;
        if (!session) { router.replace("/admin/login"); return; }
        const verify = await fetch("/api/admin/me", {
          headers: { Authorization: "Bearer " + session.access_token },
          cache: "no-store",
        });
        const verifyResult = await verify.json().catch(() => ({}));
        if (!verify.ok || !verifyResult.admin) {
          if (verify.status === 401 || verify.status === 403) {
            await supabaseAdminClient.auth.signOut();
            router.replace("/admin/login");
            return;
          }
          throw new Error(verifyResult.error || messages.id.error);
        }
        if (!active) return;
        setToken(session.access_token);
        await loadStatus(session.access_token);
      } catch (error) {
        if (active) setNotice(error.message || messages.id.error);
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [router, language, loadStatus]);

  async function connectDrive() {
    if (busy || !token) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/storage/google/connect", {
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || t.error);
      window.location.assign(result.url);
    } catch (error) {
      setNotice(error.message || t.error);
      setBusy(false);
    }
  }

  async function refreshStatus() {
    if (!token || busy) return;
    setBusy(true);
    try { await loadStatus(token); setNotice(""); }
    catch (error) { setNotice(error.message || t.error); }
    finally { setBusy(false); }
  }

  async function uploadFile() {
    if (!file) { setNotice(t.noFile); return; }
    if (busy || !token) return;
    setBusy(true);
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/storage/google/upload", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || t.uploadError);
      setNotice(t.uploaded + " " + (result.file?.name || ""));
      setFile(null);
      await loadStatus(token);
    } catch (error) {
      setNotice(error.message || t.uploadError);
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <main className="min-h-screen grid place-items-center bg-[var(--df-bg)] text-[var(--df-text-secondary)]">{t.checking}</main>;

  return (
    <main className="min-h-screen bg-[var(--df-bg)] px-4 py-7 text-[var(--df-text)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Link href={`/${language}/admin`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--df-border)] bg-[var(--df-primary-soft)] px-4 py-2 text-xs font-bold text-[var(--df-primary)]">← {t.back}</Link>
        <header className="my-7">
          <p className="text-[10px] font-extrabold tracking-[.22em] text-[var(--df-primary)]">DAJJAL FAMILY · ADMIN CONTROL</p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t.title}</h1>
              <p className="mt-2 text-sm text-[var(--df-text-secondary)]">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setLanguage(language === "id" ? "en" : "id")} className="min-h-10 rounded-lg border border-[var(--df-border)] px-3 text-xs font-bold">{language.toUpperCase()}</button>
              <button type="button" onClick={refreshStatus} disabled={busy || !token} className="min-h-10 rounded-lg border border-[var(--df-border)] px-3 text-xs font-bold disabled:opacity-50">{t.refresh}</button>
            </div>
          </div>
        </header>

        {notice && <p role="status" aria-live="polite" className="mb-5 rounded-xl border border-[var(--df-border)] bg-[var(--df-primary-soft)] p-4 text-sm text-[var(--df-text)]">{notice}</p>}

        <section className="rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className={"inline-flex h-3 w-3 rounded-full " + (status?.connected ? "bg-emerald-400" : "bg-amber-400")} />
            <h2 className="text-lg font-extrabold">{status?.connected ? t.connected : t.disconnected}</h2>
          </div>
          {status?.connected ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-raised)] p-4">
                <p className="text-[10px] font-bold tracking-widest text-[var(--df-text-muted)]">{t.account}</p>
                <p className="mt-2 break-all text-sm font-semibold">{status.accountEmail}</p>
              </div>
              <div className="rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-raised)] p-4">
                <p className="text-[10px] font-bold tracking-widest text-[var(--df-text-muted)]">{t.folder}</p>
                <p className="mt-2 text-sm font-semibold">{status.rootFolderReady ? t.folderReady : "—"}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-[var(--df-text-secondary)]">{t.connectNote}</p>
          )}
          <button type="button" onClick={connectDrive} disabled={busy || !token} className="mt-6 min-h-12 rounded-xl bg-[var(--df-primary)] px-5 py-3 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-50">
            {busy ? t.connecting : status?.connected ? t.reconnect : t.connect}
          </button>
        </section>

        {status?.connected && (
          <section className="mt-5 rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-5 sm:p-7">
            <h2 className="text-lg font-extrabold">{t.uploadTitle}</h2>
            <p className="mt-2 text-sm text-[var(--df-text-secondary)]">{t.uploadNote}</p>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-5 block w-full text-sm text-[var(--df-text-secondary)] file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-[var(--df-primary)] file:px-4 file:font-bold file:text-white" />
            {file && <p className="mt-2 break-all text-xs text-[var(--df-text-secondary)]">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
            <button type="button" onClick={uploadFile} disabled={busy || !file} className="mt-4 min-h-11 rounded-xl bg-[var(--df-primary)] px-5 py-3 text-xs font-extrabold text-white hover:opacity-90 disabled:opacity-50">{busy ? t.uploading : t.upload}</button>
          </section>
        )}
        <footer className="mt-10 border-t border-[var(--df-border)] pt-5 text-center text-[10px] font-bold tracking-[.18em] text-[var(--df-text-muted)]">DAJJAL FAMILY · CENTRAL STORAGE</footer>
      </div>
    </main>
  );
}
