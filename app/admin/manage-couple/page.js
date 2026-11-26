"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useAdminAuth } from "@/app/components/AdminAuthProvider";
import { useLanguage } from "@/app/components/LanguageProvider";

const COPY = {
  id: {
    checking: "Memverifikasi administrator...",
    title: "KELOLA COUPLE PROFILE",
    subtitle: "Kelola slug Couple Profile yang terdaftar dan status publikasinya.",
    back: "KEMBALI KE DASHBOARD",
    total: "TOTAL PROFIL",
    published: "DIPUBLIKASIKAN",
    draft: "DRAFT",
    loading: "Memuat Couple Profile...",
    retry: "COBA LAGI",
    empty: "Belum ada Couple Profile terdaftar.",
    publishedLabel: "DIPUBLIKASIKAN",
    draftLabel: "DRAFT / PRIVAT",
    open: "BUKA PROFIL",
    delete: "HAPUS SLUG",
    deleteTitle: "HAPUS COUPLE PROFILE?",
    deleteBody: "Profil dan konten/media terkait akan dihapus permanen. Akun pemain pemilik dan file asli di Google Drive tidak akan dihapus. Tindakan ini tidak dapat dibatalkan.",
    cancel: "BATAL",
    confirm: "YA, HAPUS PROFIL",
    deleting: "MENGHAPUS...",
    success: "Couple Profile berhasil dihapus.",
    error: "Tidak dapat memproses permintaan.",
    denied: "Akses administrator ditolak.",
    page: "Halaman",
    of: "dari",
    previous: "SEBELUMNYA",
    next: "BERIKUTNYA",
    footer: "DAJJAL FAMILY · ADMIN CONTROL CENTER",
  },
  en: {
    checking: "Verifying administrator...",
    title: "MANAGE COUPLE PROFILES",
    subtitle: "Manage registered Couple Profile slugs and their publication status.",
    back: "BACK TO DASHBOARD",
    total: "TOTAL PROFILES",
    published: "PUBLISHED",
    draft: "DRAFTS",
    loading: "Loading Couple Profiles...",
    retry: "TRY AGAIN",
    empty: "No Couple Profiles have been registered.",
    publishedLabel: "PUBLISHED",
    draftLabel: "DRAFT / PRIVATE",
    open: "OPEN PROFILE",
    delete: "DELETE SLUG",
    deleteTitle: "DELETE COUPLE PROFILE?",
    deleteBody: "The profile and its related content/media will be permanently deleted. The owner's player account and original Google Drive files will remain. This cannot be undone.",
    cancel: "CANCEL",
    confirm: "YES, DELETE PROFILE",
    deleting: "DELETING...",
    success: "Couple Profile deleted successfully.",
    error: "Unable to complete the request.",
    denied: "Administrator access denied.",
    page: "Page",
    of: "of",
    previous: "PREVIOUS",
    next: "NEXT",
    footer: "DAJJAL FAMILY · ADMIN CONTROL CENTER",
  },
};

export default function ManageCouplePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { admin } = useAdminAuth();
  const locale = language === "en" ? "en" : "id";
  const t = COPY[locale];

  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProfiles = useCallback(async (page = 1, tokenOverride = null) => {
    setLoading(true);
    setError("");
    try {
      const sessionResult = await supabaseAdminClient.auth.getSession();
      if (sessionResult.error) throw sessionResult.error;
      const token = tokenOverride || sessionResult.data?.session?.access_token;
      if (!token) { router.replace("/admin/login"); return; }
      const response = await fetch(`/api/admin/manage-couple?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { router.replace("/admin/login"); return; }
        throw new Error(result.error || t.error);
      }
      setProfiles(result.profiles || []);
      setPagination(result.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch (err) { setError(err.message || t.error); }
    finally { setLoading(false); }
  }, [router, t.error]);



  useEffect(() => { if (admin) loadProfiles(1); }, [admin, loadProfiles]);

  async function confirmDelete() {
    if (!target || deleting) return;
    setDeleting(true); setError(""); setSuccess("");
    try {
      const { data, error: sessionError } = await supabaseAdminClient.auth.getSession();
      if (sessionError) throw sessionError;
      const token = data?.session?.access_token;
      if (!token) { router.replace("/admin/login"); return; }
      const response = await fetch("/api/admin/manage-couple", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ slug: target.slug }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.error);
      setTarget(null);
      setSuccess(t.success);
      await loadProfiles(pagination.page, token);
    } catch (err) { setError(err.message || t.error); }
    finally { setDeleting(false); }
  }

  if (!admin) return <main className="df-manage-couple df-token-page"><section className="df-manage-couple__notice"><h1>{t.denied}</h1>{error && <p role="alert">{error}</p>}<button onClick={() => router.replace("/admin/login")}>ADMIN LOGIN</button></section></main>;

  const publishedCount = profiles.filter((profile) => profile.isPublished).length;

  return <main className="df-manage-couple df-token-page">
    <div className="df-manage-couple__inner">
      <Link href={`/${locale}/admin`} className="df-manage-couple__back">← {t.back}</Link>
      <header className="df-manage-couple__header"><p>DAJJAL FAMILY · ADMIN</p><h1>{t.title}</h1><span>{t.subtitle}</span></header>
      <div className="df-manage-couple__stats">
        <div><strong>{pagination.total}</strong><span>{t.total}</span></div>
        <div><strong>{publishedCount}</strong><span>{t.published}</span></div>
        <div><strong>{Math.max(0, profiles.length - publishedCount)}</strong><span>{t.draft}</span></div>
      </div>
      {error && <p className="df-manage-couple__feedback df-is-error" role="alert">{error}<button onClick={() => loadProfiles(pagination.page)}>{t.retry}</button></p>}
      {success && <p className="df-manage-couple__feedback df-is-success" role="status">{success}</p>}
      <section className="df-manage-couple__list" aria-label={t.title}>
        {loading ? <p className="df-manage-couple__empty" role="status">{t.loading}</p> :
          profiles.length === 0 ? <p className="df-manage-couple__empty">{t.empty}</p> :
          profiles.map((profile) => <article className="df-manage-couple__item" key={profile.id}>
            <div className="df-manage-couple__thumb">
              {profile.coverUrl ? <Image src={profile.coverUrl} alt="" width={96} height={96} unoptimized loading="lazy" /> : <span aria-hidden="true">♡</span>}
            </div>
            <div className="df-manage-couple__details">
              <h2>{profile.maleNickname} <span>×</span> {profile.femaleNickname}</h2>
              <code>/{locale}/couple/{profile.slug}</code>
              <span className={profile.isPublished ? "df-manage-couple__status is-published" : "df-manage-couple__status"}>{profile.isPublished ? t.publishedLabel : t.draftLabel}</span>
            </div>
            <div className="df-manage-couple__actions">
              {profile.isPublished && <Link href={`/${locale}/couple/${profile.slug}`}>{t.open}</Link>}
              <button type="button" onClick={() => setTarget(profile)}>{t.delete}</button>
            </div>
          </article>)
        }
      </section>
      {pagination.totalPages > 1 && <nav className="df-manage-couple__pagination" aria-label="Profile pagination">
        <button disabled={loading || pagination.page <= 1} onClick={() => loadProfiles(pagination.page - 1)}>{t.previous}</button>
        <span>{t.page} {pagination.page} {t.of} {pagination.totalPages}</span>
        <button disabled={loading || pagination.page >= pagination.totalPages} onClick={() => loadProfiles(pagination.page + 1)}>{t.next}</button>
      </nav>}
      <footer>{t.footer}</footer>
    </div>
    {target && <div className="df-manage-couple__modal-backdrop" role="presentation">
      <section className="df-manage-couple__modal" role="dialog" aria-modal="true" aria-labelledby="df-manage-couple-dialog-title">
        <p>DESTRUCTIVE ACTION</p><h2 id="df-manage-couple-dialog-title">{t.deleteTitle}</h2>
        <strong>{target.maleNickname} × {target.femaleNickname}</strong><code>/{target.slug}</code>
        <p>{t.deleteBody}</p>
        <div><button type="button" disabled={deleting} onClick={() => setTarget(null)}>{t.cancel}</button><button className="is-danger" type="button" disabled={deleting} onClick={confirmDelete}>{deleting ? t.deleting : t.confirm}</button></div>
      </section>
    </div>}
  </main>;
}
