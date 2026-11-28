"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";
import { COUPLE_CONTENT_DEFAULTS } from "@/lib/coupleProfileDefaults";
import CoupleProfileView from "@/app/components/CoupleProfileView";
import { Skeleton } from "@/app/components/ui/Skeleton";

function CoupleEditorLoading({ locale }) {
  const en = locale === "en";
  return (
    <main className="df-couple-profile-page df-couple-editor-loading" aria-busy="true">
      <div className="df-couple-shell">
        <p className="df-couple-loading-status" role="status">{en ? "Preparing your Couple Profile editor…" : "Menyiapkan editor Couple Profile…"}</p>
        <section className="df-couple-loading-hero">
          <Skeleton width="9rem" height="0.75rem" />
          <Skeleton width="min(78%, 32rem)" height="3.4rem" className="df-couple-loading-center" />
          <Skeleton width="min(58%, 24rem)" height="1.1rem" className="df-couple-loading-center" />
          <Skeleton width="min(72%, 30rem)" height="3.2rem" className="df-couple-loading-center" />
          <Skeleton variant="rect" width="100%" height="clamp(10rem, 28vw, 20rem)" />
        </section>
        <section className="df-couple-loading-section">
          <Skeleton width="12rem" height="1.2rem" />
          <div className="df-couple-loading-two-cards">
            {[1, 2].map((item) => (
              <div className="df-couple-loading-card" key={item}>
                <Skeleton width="45%" height="0.8rem" />
                <div className="df-couple-loading-card-row">
                  <Skeleton variant="circle" width="5.5rem" height="5.5rem" />
                  <div className="df-couple-loading-lines">
                    <Skeleton width="72%" height="1rem" />
                    <Skeleton count={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="df-couple-loading-section">
          <Skeleton width="10rem" height="1.2rem" />
          <div className="df-couple-loading-gallery">
            {[1, 2, 3].map((item) => <Skeleton variant="rect" height="10rem" key={item} />)}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CoupleProfileEditorPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "en" ? "en" : "id";
  const editorBasePath = withLocalePrefix("/df/profile-couple-maker", locale);
  const editorPath = `${editorBasePath}/${encodeURIComponent(slug)}`;
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState(COUPLE_CONTENT_DEFAULTS[locale]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setRedirecting(true); router.replace("/login?next=" + encodeURIComponent(editorPath)); return; }
    const [ownerResponse, response] = await Promise.all([
      fetch("/api/couple", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      }),
      fetch(`/api/couple/${slug}?locale=${locale}`, { cache: "no-store" }),
    ]);
    const ownerData = await ownerResponse.json();
    if (ownerResponse.status === 401) {
      setRedirecting(true);
      router.replace("/login?next=" + encodeURIComponent(editorPath));
      return;
    }
    if (ownerResponse.status === 404 || (ownerResponse.ok && !ownerData.profile)) {
      setRedirecting(true);
      router.replace(editorBasePath);
      return;
    }
    if (!ownerResponse.ok) throw new Error(ownerData.error || "Unable to verify profile ownership.");
    if (ownerData.profile.slug !== slug) {
      setRedirecting(true);
      router.replace(`${editorBasePath}/${encodeURIComponent(ownerData.profile.slug)}`);
      return;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load Couple Profile.");
    setProfile(data.profile);
    setContent({ ...COUPLE_CONTENT_DEFAULTS[locale], ...(data.content?.content || {}) });
    setMedia(data.media || []);
  }, [editorBasePath, editorPath, slug, locale, router]);

  useEffect(() => {
    let active = true;
    load().catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  const save = useCallback(async (change) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please log in again.");
      if (change.reset) {
        const response = await fetch(`/api/couple/${slug}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to reset Couple Profile.");
        router.replace(editorBasePath);
        return;
      }
      const body = { locale };
      if (change.content) body.content = change.content;
      if (change.profile) {
        if (change.profile.maleNickname !== undefined) body.maleNickname = change.profile.maleNickname;
        if (change.profile.femaleNickname !== undefined) body.femaleNickname = change.profile.femaleNickname;
      }
      const response = await fetch(`/api/couple/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save changes.");
      await load();
      setNotice(locale === "en" ? "Saved successfully." : "Berhasil disimpan.");
      window.setTimeout(() => setNotice(""), 2500);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [content, editorBasePath, load, locale, media, router, slug]);

  const uploadMedia = useCallback(async (slotKey, file) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(locale === "en" ? "Session expired. Please log in again." : "Sesi berakhir. Silakan login kembali.");
      const form = new FormData();
      form.append("file", file);
      form.append("slotKey", slotKey);
      const response = await fetch("/api/couple/" + slug + "/media", {
        method: "POST",
        headers: { Authorization: "Bearer " + session.access_token },
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (locale === "en" ? "Image upload failed." : "Upload foto gagal."));
      setMedia((current) => [...current.filter((item) => item.slot_key !== result.media.slot_key), result.media]);
      setNotice(locale === "en" ? "Photo uploaded successfully." : "Foto berhasil diunggah.");
      window.setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [locale, slug]);
  if (loading || redirecting) return <CoupleEditorLoading locale={locale} />;
  if (!profile) return <main className="df-couple-profile-page"><div className="df-couple-shell"><p>{error || "Couple Profile not found."}</p></div></main>;

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/${locale}/couple/${slug}` : `/${locale}/couple/${slug}`;
  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setNotice(locale === "en" ? "Public link copied." : "Link publik berhasil disalin.");
      window.setTimeout(() => setNotice(""), 2500);
    } catch {
      setError(locale === "en" ? "Unable to copy the link. Please copy it from the preview address." : "Link tidak dapat disalin. Silakan salin dari alamat halaman pratinjau.");
    }
  };

  return (
    <div className="df-couple-editor-surface">
      {saving && <div className="df-couple-save-status" role="status">{locale === "en" ? "Saving…" : "Menyimpan…"}</div>}
      {notice && <div className="df-couple-save-status is-success" role="status">{notice}</div>}
      {error && <div className="df-couple-save-status is-error" role="alert">{error}</div>}
      <section className="df-couple-editor-quick-actions" aria-label={locale === "en" ? "Profile actions" : "Aksi profil"}>
        <div className="df-couple-editor-quick-buttons">
          <button type="button" className="df-couple-editor-action-primary" onClick={copyPublicLink}>
            <span aria-hidden="true">▢</span> {locale === "en" ? "Copy Link" : "Salin Link"}
          </button>
          <a className="df-couple-editor-action-secondary" href={publicUrl} target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">↗</span> {locale === "en" ? "Preview" : "Pratinjau"}
          </a>
        </div>
        <p>{locale === "en" ? "Edit content directly on this page. Public address: " : "Edit konten langsung di halaman ini. Alamat publik: "}
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">{publicUrl}</a>
        </p>
      </section>
      <CoupleProfileView profile={profile} content={content} media={media} locale={locale} editable onSave={save} onUpload={uploadMedia} />
    </div>
  );
}
