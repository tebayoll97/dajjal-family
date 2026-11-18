"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import { COUPLE_CONTENT_DEFAULTS, COUPLE_MEDIA_SLOTS } from "@/lib/coupleProfileDefaults";
import CoupleProfileView from "@/app/components/CoupleProfileView";

export default function CoupleProfileEditorPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "en" ? "en" : "id";
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState(COUPLE_CONTENT_DEFAULTS[locale]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }
    const ownerResponse = await fetch("/api/couple", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const ownerData = await ownerResponse.json();
    if (!ownerResponse.ok || !ownerData.profile || ownerData.profile.slug !== slug) {
      router.replace("/app/create-profile-couple");
      return;
    }
    const response = await fetch(`/api/couple/${slug}?locale=${locale}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load Couple Profile.");
    setProfile(data.profile);
    setContent({ ...COUPLE_CONTENT_DEFAULTS[locale], ...(data.content?.content || {}) });
    setMedia(data.media || []);
  }, [slug, locale, router]);

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
        router.replace("/app/create-profile-couple");
        return;
      }
      const body = { locale };
      if (change.content) body.content = { ...content, ...change.content };
      if (change.profile) {
        if (change.profile.maleNickname !== undefined) body.maleNickname = change.profile.maleNickname;
        if (change.profile.femaleNickname !== undefined) body.femaleNickname = change.profile.femaleNickname;
        if (change.profile.anniversaryDate !== undefined) body.anniversaryDate = change.profile.anniversaryDate || null;
      }
      if (change.media) {
        const current = Object.fromEntries(media.map((item) => [item.slot_key, item.google_drive_file_id]));
        const next = { ...current, ...change.media };
        body.media = COUPLE_MEDIA_SLOTS.filter((slot) => next[slot]?.trim()).map((slot) => ({
          slotKey: slot, googleDriveFileId: next[slot].trim(),
        }));
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
  }, [content, load, locale, media, router, slug]);

  if (loading) return <main className="df-couple-profile-page"><div className="df-couple-shell"><p>{locale === "en" ? "Loading..." : "Memuat..."}</p></div></main>;
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
        <p>{locale === "en"
          ? "Note: Only Google Drive file URLs are supported at this time. Enter the file ID only when editing an image."
          : "Catatan: Saat ini hanya menyediakan url file dari google Drive, cukup masukan id file saja ketika mau mengedit gambar."}</p>
      </section>
      <CoupleProfileView profile={profile} content={content} media={media} locale={locale} editable onSave={save} />
    </div>
  );
}
