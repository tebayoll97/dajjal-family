"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CoupleMusicPlayer from "@/app/components/CoupleMusicPlayer";
import { coupleDriveImage, COUPLE_GALLERY_SLOTS } from "@/lib/coupleProfileDefaults";
import CoupleImage from "@/app/components/CoupleImage";
import CoupleCreatePromo from "@/app/components/CoupleCreatePromo";
import CoupleBottomNavigation from "@/app/components/CoupleBottomNavigation";

function splitRelationshipStart(value) {
  if (!value) return { date: "", time: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const pad = (number) => String(number).padStart(2, "0");
  return { date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, time: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
}

function relationshipStartToIso(dateValue, timeValue) {
  if (!dateValue && !timeValue) return "";
  if (!dateValue || !timeValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isInteger)) return null;
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) return null;
  return date.toISOString();
}

function durationSince(date) {
  if (!date) return [0, 0, 0, 0];
  const startTime = new Date(date).getTime();
  if (!Number.isFinite(startTime)) return [0, 0, 0, 0];
  const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  return [Math.floor(elapsed / 86400), Math.floor((elapsed % 86400) / 3600), Math.floor((elapsed % 3600) / 60), elapsed % 60];
}

function GamerFieldIcon({ type }) {
  const paths = {
    nickname: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19c.8-3 3-4.5 6.5-4.5s5.7 1.5 6.5 4.5" /></>,
    alliance: <><path d="M12 3 19 6v5c0 4.4-2.8 7.5-7 10-4.2-2.5-7-5.6-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    gender: <><circle cx="10" cy="13" r="5" /><path d="m14 9 5-5m-4 0h4v4M10 18v4m-3-2h6" /></>,
    server: <><rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><path d="M8 7h.01M8 17h.01M12 7h5M12 17h5" /></>,
  };
  return <svg className="df-couple-gamer-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type] || paths.nickname}</svg>;
}

function Pencil() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" /></svg>;
}

function EditableText({ value, label, editable, onSave, multiline = false, inputType = "text", className = "", placeholder = "—" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setDraft(value || ""), [value]);
  async function save() {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }
  function cancel() {
    if (saving) return;
    setDraft(value || "");
    setError("");
    setEditing(false);
  }
  return (
    <span className={`df-couple-editable ${className}`} data-editing={editing ? "true" : "false"}>
      {editing ? (
        <span className="df-couple-edit-form">
          {multiline ? <textarea aria-label={label} value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} maxLength={3000} autoFocus disabled={saving} /> :
            <input type={inputType} aria-label={label} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={inputType === "date" ? undefined : (label.toLowerCase().includes("name") ? 40 : 220)} autoFocus disabled={saving} />}
          <span className="df-couple-edit-actions">
            <button type="button" onClick={save} disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button>
            <button type="button" className="df-couple-edit-cancel" onClick={cancel} disabled={saving}>Batal</button>
          </span>
          {error && <small role="alert">{error}</small>}
        </span>
      ) : (
        <>
          <span className="df-couple-editable-value">{value || (editable ? placeholder : "")}</span>
          {editable && <button type="button" className="df-couple-pencil" title={`Edit ${label}`} aria-label={`Edit ${label}`} onClick={() => setEditing(true)}><Pencil /></button>}
        </>
      )}
    </span>
  );
}

function EditableImage({ fileId, label, editable, onUpload, className = "", openPhoto, locale = "id", recommendation = "3:4" }) {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const uploadingRef = useRef(false);
  const en = locale === "en";

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!editing) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!uploadingRef.current) cancelEditing();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [editing]);

  function chooseFile(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
  }

  async function uploadSelected() {
    if (!selectedFile || uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);
    setError("");
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setEditing(false);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err.message || (en ? "Upload failed." : "Upload gagal."));
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  }

  function cancelEditing() {
    if (uploadingRef.current) return;
    setSelectedFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    setEditing(false);
  }

  const uploadDialog = editing && typeof document !== "undefined" ? createPortal(
    <div className="df-couple-upload-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !uploadingRef.current) cancelEditing();
    }}>
      <section
        ref={dialogRef}
        className="df-couple-upload-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="df-couple-upload-title"
        aria-describedby="df-couple-upload-ratio"
      >
        <div className="df-couple-upload-dialog-heading">
          <h2 id="df-couple-upload-title">{en ? `Upload · ${label}` : `Upload · ${label}`}</h2>
          <button type="button" className="df-couple-upload-close" onClick={cancelEditing} disabled={uploading} aria-label={en ? "Close upload window" : "Tutup jendela upload"}>×</button>
        </div>
        <label className="df-couple-upload-picker">
          <span>{en ? "Choose a photo from your device" : "Pilih foto dari perangkat"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={chooseFile}
            disabled={uploading}
          />
        </label>
        <small id="df-couple-upload-ratio">{en ? `Recommended ratio ${recommendation} · JPG, PNG, WEBP or GIF · up to 12 MB` : `Rekomendasi ${recommendation} · JPG, PNG, WEBP atau GIF · maksimal 12 MB`}</small>
        {selectedFile && (
          <div className="df-couple-image-selected">
            {previewUrl && <img src={previewUrl} alt={en ? "Selected photo preview" : "Pratinjau foto yang dipilih"} />}
            <span>{selectedFile.name}</span>
          </div>
        )}
        {error && <p className="df-couple-upload-error" role="alert">{error}</p>}
        <div className="df-couple-upload-actions">
          <button type="button" className="df-couple-upload-cancel" onClick={cancelEditing} disabled={uploading}>{en ? "Cancel" : "Batal"}</button>
          <button type="button" className="df-couple-upload-submit" onClick={uploadSelected} disabled={!selectedFile || uploading}>
            {uploading ? (en ? "Uploading…" : "Mengunggah…") : "Upload"}
          </button>
        </div>
      </section>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`df-couple-image-slot ${className}`}>
      {fileId ? (
        <button className="df-couple-image-open" type="button" onClick={() => openPhoto?.(coupleDriveImage(fileId, 1800), label)} aria-label={`Open ${label}`}>
          <CoupleImage src={coupleDriveImage(fileId, 1200)} alt={label} width={1200} height={1600} loading="lazy" sizes="(max-width: 680px) 80vw, 360px" />
        </button>
      ) : (
        <div className="df-couple-image-empty">{editable ? (en ? `Add ${label}` : `Tambahkan ${label}`) : label}</div>
      )}
      {editable && <button ref={triggerRef} type="button" className="df-couple-pencil df-couple-image-pencil" title={en ? `Change ${label}` : `Ubah ${label}`} aria-label={en ? `Change ${label}` : `Ubah ${label}`} onClick={() => setEditing(true)} disabled={uploading}><Pencil /></button>}
      {uploadDialog}
    </div>
  );
}

const BATCH_PANEL_FIELDS = {
  hero: [
    { key: "maleNickname", source: "profile", label: "Nama pasangan 1", max: 40 },
    { key: "femaleNickname", source: "profile", label: "Nama pasangan 2", max: 40 },
    { key: "subtitle", label: "Subtitle", max: 220 }, { key: "intro", label: "Intro", multiline: true },
    { key: "relationship_label", label: "Label Hari Jadi", max: 220 },
    { key: "relationship_start_date", label: "Tanggal mulai Hari Jadi", type: "date" },
    { key: "relationship_start_time", label: "Jam mulai Hari Jadi", type: "time" },
  ],
  identity: [
    { key: "identity_label", label: "Label panel", max: 220 }, { key: "male_role", label: "Role pasangan 1", max: 220 },
    { key: "male_description", label: "Deskripsi pasangan 1", multiline: true }, { key: "female_role", label: "Role pasangan 2", max: 220 },
    { key: "female_description", label: "Deskripsi pasangan 2", multiline: true },
  ],
  gallery: [
    { key: "gallery_eyebrow", label: "Eyebrow", max: 220 }, { key: "gallery_title", label: "Judul panel", max: 220 },
    { key: "gallery_intro", label: "Intro galeri", multiline: true }, { key: "gallery_label", label: "Label galeri", max: 220 },
    ...Array.from({ length: 6 }, (_, index) => ({ key: `gallery_${index + 1}_title`, label: `Judul foto ${index + 1}`, max: 220 })),
  ],
  music: [
    { key: "music_title", label: "Judul panel musik", max: 220 },
    { key: "music_subtitle", label: "Subjudul musik", max: 300 },
    { key: "music_track_id", label: "Lagu pilihan", type: "music-track" },
  ],
  story: [
    { key: "story_eyebrow", label: "Eyebrow", max: 220 }, { key: "story_title", label: "Judul cerita", max: 220 },
    { key: "story_text", label: "Isi cerita", multiline: true }, { key: "signature", label: "Signature", multiline: true },
  ],
};
function BatchPanelEdit({ panel, locale, draft, setDraft, onSave, onClose, saving, error }) {
  const en = locale === "en";
  const [musicItems, setMusicItems] = useState([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicError, setMusicError] = useState("");
  useEffect(() => {
    if (panel !== "music") return;
    let active = true;
    setMusicLoading(true); setMusicError("");
    fetch("/api/music", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || (en ? "Music catalog is unavailable." : "Katalog musik tidak tersedia."));
      if (active) setMusicItems(Array.isArray(payload.items) ? payload.items : []);
    }).catch((err) => { if (active) setMusicError(err.message); }).finally(() => { if (active) setMusicLoading(false); });
    return () => { active = false; };
  }, [panel, en]);
  const selectedMusic = musicItems.find((item) => item.id === draft.music_track_id);
  const title = ({ hero: en ? "Main profile" : "Profil utama", identity: en ? "Couple identity" : "Identitas pasangan", gallery: en ? "Memories" : "Kenangan", story: en ? "Our story" : "Kisah kita", music: en ? "Music panel" : "Panel musik" })[panel];
  return <div className="df-couple-batch-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <section className="df-couple-batch-dialog" role="dialog" aria-modal="true" aria-labelledby="df-couple-batch-title">
      <div className="df-couple-batch-heading"><div><p className="df-couple-eyebrow">{en ? "PANEL EDITOR" : "EDITOR PANEL"}</p><h2 id="df-couple-batch-title">{title}</h2><p>{en ? "Edit fields, then save this panel once." : "Ubah kolom, lalu simpan panel ini sekali."}</p></div><button type="button" onClick={onClose} disabled={saving} aria-label={en ? "Close" : "Tutup"}>×</button></div>
      <div className="df-couple-batch-fields">{(BATCH_PANEL_FIELDS[panel] || []).map((field) => { const value = draft[field.key] ?? ""; const fieldLabel = en ? ({ relationship_label: "Journey label", relationship_start_date: "Journey start date", relationship_start_time: "Journey start time", music_title: "Music panel title", music_subtitle: "Music subtitle", music_track_id: "Choose a published song" }[field.key] || field.label) : field.label; return <label key={field.key}>{fieldLabel}
        {field.type === "music-track" ? <><select value={value} onChange={(event) => setDraft((old) => ({ ...old, music_track_id: event.target.value }))} disabled={saving || musicLoading}><option value="">{en ? "Use default music" : "Gunakan musik bawaan"}</option>{musicItems.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.artist}{item.genre ? " · " + item.genre : ""}</option>)}</select>{musicLoading && <small>{en ? "Loading published songs…" : "Memuat lagu yang telah dipublikasikan…"}</small>}{musicError && <small role="alert">{musicError}</small>}{selectedMusic && <span className="df-couple-batch-music-preview"><strong>{selectedMusic.title}</strong><span>{selectedMusic.artist}{selectedMusic.genre ? " · " + selectedMusic.genre : ""}</span>{selectedMusic.mood && <small>{en ? "Mood: " : "Suasana: "}{selectedMusic.mood}</small>}{selectedMusic.audio_duration_seconds > 0 && <small>{Math.floor(selectedMusic.audio_duration_seconds / 60)}:{String(Math.floor(selectedMusic.audio_duration_seconds % 60)).padStart(2, "0")}</small>}</span>}</> : field.multiline ? <textarea rows={4} maxLength={3000} value={value} onChange={(event) => setDraft((old) => ({ ...old, [field.key]: event.target.value }))} disabled={saving} /> : <input type={field.type || "text"} maxLength={field.max} value={value} onChange={(event) => setDraft((old) => ({ ...old, [field.key]: event.target.value }))} disabled={saving} />}
        {field.max && <small>{value.length}/{field.max}</small>}</label>; })}</div>
      {error && <p className="df-couple-gamer-error" role="alert">{error}</p>}
      <div className="df-couple-gamer-actions"><button type="button" onClick={onClose} disabled={saving}>{en ? "Cancel" : "Batal"}</button><button type="button" onClick={onSave} disabled={saving}>{saving ? (en ? "Saving…" : "Menyimpan…") : (en ? "Save panel" : "Simpan panel")}</button></div>
    </section>
  </div>;
}

export default function CoupleProfileView({ profile, content, media = [], locale = "id", editable = false, onSave, onUpload }) {
  const en = locale === "en";
  const [time, setTime] = useState([0, 0, 0, 0]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [gamerEditorOpen, setGamerEditorOpen] = useState(false);
  const [batchPanel, setBatchPanel] = useState("");
  const [batchDraft, setBatchDraft] = useState({});
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [gamerDraft, setGamerDraft] = useState({});
  const [gamerSaving, setGamerSaving] = useState(false);
  const [gamerError, setGamerError] = useState("");
  const [activeMoment, setActiveMoment] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const momentsTrackRef = useRef(null);
  const mediaMap = useMemo(() => Object.fromEntries(media.map((item) => [item.slot_key, item.google_drive_file_id])), [media]);
  const gallery = COUPLE_GALLERY_SLOTS.map((slot, index) => ({ slot, index, fileId: mediaMap[slot] || "" }));
  const filledGallery = gallery.filter((item) => item.fileId);
  const displayGallery = editable ? gallery : filledGallery;
  const timeUnits = en ? ["Days", "Hours", "Minutes", "Seconds"] : ["Hari", "Jam", "Menit", "Detik"];
  const copy = en ? {
    eyebrow: "A DAJJAL FAMILY STORY", identity: "THE COUPLE", gallery: "OUR LITTLE MOMENTS",
    openPhoto: "Open photo", closePhoto: "Close photo", previous: "Previous photo", next: "Next photo",
    slide: "Slide", footer: "DAJJAL FAMILY · COUPLE PROFILE", date: "Relationship start date",
    empty: "Add a photo", noGallery: "No photos have been added yet.", reset: "Reset Couple Profile", resetMessage: "Are you sure you want to delete all current settings? You will start again from the beginning.", continue: "Continue", cancel: "Cancel",
  } : {
    eyebrow: "CERITA DARI DAJJAL FAMILY", identity: "IDENTITAS PASANGAN", gallery: "KENANGAN KITA",
    openPhoto: "Buka foto", closePhoto: "Tutup foto", previous: "Foto sebelumnya", next: "Foto berikutnya",
    slide: "Slide", footer: "DAJJAL FAMILY · COUPLE PROFILE", date: "Tanggal mulai Hari Jadi",
    empty: "Add a photo", noGallery: "Belum ada foto galeri.", reset: "Reset Couple Profile", resetMessage: "Yakin untuk menghapus semua pengaturan saat ini? Anda akan memulai dari awal lagi", continue: "Lanjutkan", cancel: "Batal",
  };
  const relationshipStart = Object.prototype.hasOwnProperty.call(content, "relationship_start_at") ? content.relationship_start_at : (content.anniversary_datetime || (profile.anniversary_date ? profile.anniversary_date + "T00:00:00" : ""));
  useEffect(() => {
    const update = () => setTime(durationSince(relationshipStart));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [relationshipStart]);
  useEffect(() => {
    if (!activePhoto) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setActivePhoto(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activePhoto]);
  useEffect(() => {
    if (!showResetConfirm) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setShowResetConfirm(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showResetConfirm]);
  const scrollToMoment = (index) => {
    const track = momentsTrackRef.current;
    const slide = track?.children[index];
    if (!track || !slide) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
  };
  const onMomentScroll = () => {
    const track = momentsTrackRef.current;
    if (!track) return;
    const left = track.getBoundingClientRect().left;
    let nearest = 0;
    let distance = Infinity;
    Array.from(track.children).forEach((slide, index) => {
      const next = Math.abs(slide.getBoundingClientRect().left - left);
      if (next < distance) { distance = next; nearest = index; }
    });
    setActiveMoment((current) => current === nearest ? current : nearest);
  };
  const openBatchPanel = (panel) => {
    const draft = {};
    const legacyStart = content.relationship_start_at ?? content.anniversary_datetime ?? (profile.anniversary_date ? profile.anniversary_date + "T00:00:00" : "");
    const startParts = splitRelationshipStart(legacyStart);
    for (const item of BATCH_PANEL_FIELDS[panel] || []) {
      if (item.source === "profile") draft[item.key] = item.key === "maleNickname" ? profile.male_nickname : profile.female_nickname;
      else if (item.key === "relationship_start_date") draft[item.key] = startParts.date;
      else if (item.key === "relationship_start_time") draft[item.key] = startParts.time;
      else draft[item.key] = content[item.key] || (item.key === "relationship_label" ? content.anniversary_label || "" : "");
    }
    setBatchDraft(draft); setBatchError(""); setBatchPanel(panel);
  };
  const saveBatchPanel = async () => {
    if (batchSaving || !batchPanel) return;
    setBatchSaving(true); setBatchError("");
    try {
      const change = { content: {}, profile: {} };
      for (const item of BATCH_PANEL_FIELDS[batchPanel] || []) {
        if (item.source === "profile") change.profile[item.key] = batchDraft[item.key] || "";
        else if (!["relationship_start_date", "relationship_start_time"].includes(item.key)) change.content[item.key] = batchDraft[item.key] || "";
      }
      if (batchPanel === "hero") {
        const hasDate = Boolean(batchDraft.relationship_start_date);
        const hasTime = Boolean(batchDraft.relationship_start_time);
        const timestamp = relationshipStartToIso(batchDraft.relationship_start_date || "", batchDraft.relationship_start_time || "");
        if ((hasDate || hasTime) && !timestamp) throw new Error(en ? "Choose a valid start date and time." : "Pilih tanggal dan jam mulai Hari Jadi yang valid.");
        change.content.relationship_start_at = timestamp;
      }
      if (!Object.keys(change.content).length) delete change.content;
      if (!Object.keys(change.profile).length) delete change.profile;
      await onSave?.(change); setBatchPanel("");
    } catch (error) { setBatchError(error.message || (en ? "Unable to save this panel." : "Panel gagal disimpan.")); }
    finally { setBatchSaving(false); }
  };
  const saveContent = (key, value) => onSave?.({ content: { [key]: value } });
  const saveProfile = (key, value) => onSave?.({ profile: { [key]: value } });
  // Text is edited only through its panel-level batch editor. Individual pencil
  // controls are reserved for image uploads, which remain independently editable.
  const field = (key) => content[key] || "—";
  const openPhoto = (src, alt) => setActivePhoto({ src, alt });
  const renderGalleryItem = ({ slot, index, fileId }) => {
    const titleKey = "gallery_" + (index + 1) + "_title";
    const galleryTitle = content[titleKey] || (en ? "Memory " : "Kenangan ") + (index + 1);
    return (
      <div className="df-couple-gallery-slot" key={slot}>
        <EditableImage
          fileId={fileId}
          label={galleryTitle}
          editable={editable}
          locale={locale}
          onUpload={(file) => onUpload?.(slot, file)}
          recommendation="3:4"
          className="df-couple-gallery-item"
          openPhoto={openPhoto}
        />
        <div className="df-couple-gallery-caption">
          <span className="df-couple-gallery-title-edit">{galleryTitle}</span>
        </div>
      </div>
    );
  };

  return (
    <main className="df-couple-profile-page">
      <div className="df-couple-shell">
        <header className="df-couple-hero" id="df-couple-home">
          {editable && <button type="button" className="df-couple-pencil df-couple-batch-pencil" onClick={() => openBatchPanel("hero")} aria-label={en ? "Edit main profile panel" : "Edit panel profil utama"}><Pencil /></button>}
          <p className="df-couple-eyebrow">{copy.eyebrow}</p>
          <h1 className="df-couple-title">
            {profile.male_nickname}
            <span className="df-couple-connector" aria-hidden="true">×</span>
            {profile.female_nickname}
          </h1>
          <div className="df-couple-editable-block df-couple-subtitle">{field("subtitle", "Subtitle")}</div>
          <div className="df-couple-editable-block df-couple-intro">{field("intro", "Introduction", { multiline: true })}</div>
          <div className="df-couple-featured-wrap">
            <EditableImage fileId={mediaMap.cover} label="Cover image" editable={editable} locale={locale} onUpload={(file) => onUpload?.("cover", file)} recommendation="3:4" className="df-couple-featured-photo" openPhoto={openPhoto} />
            <span className="df-couple-featured-label">{en ? "FEATURED MOMENT" : "POTRET UTAMA"}</span>
          </div>
          <div className="df-couple-journey-heading">
            <p className="df-couple-eyebrow">{field("relationship_label", "Hari Jadi label")}</p>
          </div>
          {relationshipStart && <section className="df-couple-metrics" aria-label={content.relationship_label}>
            {time.map((value, index) => <div className="df-couple-metric" key={timeUnits[index]}><strong>{value.toLocaleString(en ? "en-US" : "id-ID")}</strong><span>{timeUnits[index]}</span></div>)}
          </section>}

        </header>

        <section className="df-couple-music-section" aria-label={en ? "Couple soundtrack" : "Musik pasangan"}>
          {editable && <button type="button" className="df-couple-pencil df-couple-batch-pencil" onClick={() => openBatchPanel("music")} aria-label={en ? "Edit music panel" : "Edit panel musik"}><Pencil /></button>}
          <CoupleMusicPlayer content={content} onPlaybackStateChange={setMusicPlaying} />
        </section>

        <section className="df-couple-section" id="df-couple-profile" aria-labelledby="df-couple-identities">
          <div className="df-couple-content-panel">
          {editable && <button type="button" className="df-couple-pencil df-couple-batch-pencil" onClick={() => openBatchPanel("identity")} aria-label={en ? "Edit couple identity panel" : "Edit panel identitas pasangan"}><Pencil /></button>}
          <div className="df-couple-section-heading">
            <p className="df-couple-eyebrow">{field("identity_label", "Identity section label")}</p>
            <h2 id="df-couple-identities">
              {profile.male_nickname} &amp; {profile.female_nickname}
            </h2>
          </div>
          <div className="df-couple-character-grid">
            <article className="df-couple-character-card" data-character="dajjal">
              <div className="df-couple-character-heading"><p className="df-couple-character-role">{field("male_role", "Male role")}</p></div>
              <div className="df-couple-character-body">
                <EditableImage fileId={mediaMap.male_portrait} label="Male portrait" editable={editable} locale={locale} onUpload={(file) => onUpload?.("male_portrait", file)} recommendation="1:1" className="df-couple-character-art" openPhoto={openPhoto} />
                <div className="df-couple-character-copy">
                  <h3>{profile.male_nickname}</h3>
                  <div className="df-couple-editable-block">{field("male_description", "Male description", { multiline: true })}</div>
                </div>
              </div>
              <span className="df-couple-character-index" aria-hidden="true">01</span>
            </article>
            <article className="df-couple-character-card" data-character="veylora">
              <div className="df-couple-character-heading"><p className="df-couple-character-role">{field("female_role", "Female role")}</p></div>
              <div className="df-couple-character-body">
                <EditableImage fileId={mediaMap.female_portrait} label="Female portrait" editable={editable} locale={locale} onUpload={(file) => onUpload?.("female_portrait", file)} recommendation="1:1" className="df-couple-character-art" openPhoto={openPhoto} />
                <div className="df-couple-character-copy">
                  <h3>{profile.female_nickname}</h3>
                  <div className="df-couple-editable-block">{field("female_description", "Female description", { multiline: true })}</div>
                </div>
              </div>
              <span className="df-couple-character-index" aria-hidden="true">02</span>
            </article>
          </div>
          </div>
        </section>

        <section className="df-couple-gamer-profile" aria-labelledby="df-couple-gamer-title">
          <div className="df-couple-gamer-heading">
            <div>
              <p className="df-couple-eyebrow">{en ? "PLAYER IDENTITIES" : "IDENTITAS PEMAIN"}</p>
              <h2 id="df-couple-gamer-title">{content.gamer_profile_title}</h2>
              <p>{content.gamer_profile_subtitle}</p>
            </div>
            {editable && <button type="button" className="df-couple-pencil df-couple-gamer-pencil" aria-label={en ? "Edit gamer profile panel" : "Edit panel profil gamer"} title={en ? "Edit gamer profile panel" : "Edit panel profil gamer"} onClick={() => { setGamerDraft(Object.fromEntries(["gamer_profile_title","gamer_profile_subtitle","gamer_male_nickname","gamer_male_alliance","gamer_male_gender","gamer_male_server","gamer_female_nickname","gamer_female_alliance","gamer_female_gender","gamer_female_server"].map((key)=>[key,content[key]||""]))); setGamerError(""); setGamerEditorOpen(true); }}><Pencil /></button>}
          </div>
          <div className="df-couple-gamer-grid">
            {["male","female"].map((person,index)=>(
              <article className="df-couple-gamer-card" key={person}>
                <span className="df-couple-gamer-index">{index===0?"01":"02"}</span>
                <h3 className="df-couple-gamer-name"><GamerFieldIcon type="nickname" />{content["gamer_"+person+"_nickname"]}</h3>
                <dl>
                  <div><dt><GamerFieldIcon type="alliance" /><span>{en?"Alliance":"Aliansi"}</span></dt><dd>{content["gamer_"+person+"_alliance"]}</dd></div>
                  <div><dt><GamerFieldIcon type="gender" /><span>{en?"Gender":"Jenis Kelamin"}</span></dt><dd>{content["gamer_"+person+"_gender"]==="Male"?(en?"Male":"Laki-laki"):content["gamer_"+person+"_gender"]==="Female"?(en?"Female":"Perempuan"):content["gamer_"+person+"_gender"]==="Transgender"?(en?"Transgender":"Transgender"):content["gamer_"+person+"_gender"]}</dd></div>
                  <div><dt><GamerFieldIcon type="server" /><span>Server</span></dt><dd>{content["gamer_"+person+"_server"]}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
        {editable && gamerEditorOpen && (
          <div className="df-couple-gamer-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget&&!gamerSaving)setGamerEditorOpen(false);}}>
            <section className="df-couple-gamer-dialog" role="dialog" aria-modal="true" aria-labelledby="df-couple-gamer-dialog-title">
              <div className="df-couple-gamer-dialog-heading"><div><p className="df-couple-eyebrow">{en?"BATCH EDIT":"EDIT SEKALIGUS"}</p><h2 id="df-couple-gamer-dialog-title">{en?"Gamer Profile":"Profil Gamer"}</h2></div><button type="button" onClick={()=>setGamerEditorOpen(false)} disabled={gamerSaving} aria-label={en?"Close":"Tutup"}>×</button></div>
              <label>{en?"Panel title":"Judul panel"}<input maxLength={40} value={gamerDraft.gamer_profile_title||""} onChange={(event)=>setGamerDraft((old)=>({...old,gamer_profile_title:event.target.value}))} disabled={gamerSaving}/><small>{(gamerDraft.gamer_profile_title||"").length}/40</small></label>
              <label>{en?"Subtitle":"Subjudul"}<input maxLength={100} value={gamerDraft.gamer_profile_subtitle||""} onChange={(event)=>setGamerDraft((old)=>({...old,gamer_profile_subtitle:event.target.value}))} disabled={gamerSaving}/><small>{(gamerDraft.gamer_profile_subtitle||"").length}/100</small></label>
              {["male","female"].map((person)=>(
                <fieldset key={person}>
                  <legend>{person==="male"?profile.male_nickname:profile.female_nickname}</legend>
                  {[[ "nickname",en?"Nickname":"Nickname",32 ],["alliance",en?"Alliance":"Aliansi",20],["gender",en?"Gender":"Jenis kelamin",16],["server","Server",12]].map(([field,label,max])=>(
                    <label key={field}>{label}
                      {field==="gender"?<select value={gamerDraft["gamer_"+person+"_gender"]||""} onChange={(event)=>setGamerDraft((old)=>({...old,["gamer_"+person+"_gender"]:event.target.value}))} disabled={gamerSaving}><option value="Male">{en?"Male":"Laki-laki"}</option><option value="Female">{en?"Female":"Perempuan"}</option><option value="Transgender">Transgender</option></select>:
                      <input maxLength={max} value={gamerDraft["gamer_"+person+"_"+field]||""} onChange={(event)=>setGamerDraft((old)=>({...old,["gamer_"+person+"_"+field]:event.target.value}))} disabled={gamerSaving}/>}
                      {field!=="gender"&&<small>{(gamerDraft["gamer_"+person+"_"+field]||"").length}/{max}</small>}
                    </label>
                  ))}
                </fieldset>
              ))}
              {gamerError&&<p role="alert" className="df-couple-gamer-error">{gamerError}</p>}
              <div className="df-couple-gamer-actions">
                <button type="button" onClick={()=>setGamerEditorOpen(false)} disabled={gamerSaving}>{en?"Cancel":"Batal"}</button>
                <button type="button" disabled={gamerSaving} onClick={async()=>{setGamerSaving(true);setGamerError("");try{await onSave?.({content:gamerDraft});setGamerEditorOpen(false);}catch(error){setGamerError(error.message||(en?"Unable to save changes.":"Gagal menyimpan perubahan."));}finally{setGamerSaving(false);}}}>{gamerSaving?(en?"Saving…":"Menyimpan…"):(en?"Save all":"Simpan semua")}</button>
              </div>
            </section>
          </div>
        )}
        <section className="df-couple-gallery" id="df-couple-gallery" aria-labelledby="df-couple-gallery-title">
          <div className="df-couple-content-panel">
          {editable && <button type="button" className="df-couple-pencil df-couple-batch-pencil" onClick={() => openBatchPanel("gallery")} aria-label={en ? "Edit memories panel" : "Edit panel kenangan"}><Pencil /></button>}
          <div className="df-couple-section-heading">
            <p className="df-couple-eyebrow">{field("gallery_eyebrow", "Gallery eyebrow")}</p>
            <h2 id="df-couple-gallery-title">{field("gallery_title", "Gallery title")}</h2>
            <div className="df-couple-editable-block df-couple-gallery-intro">{field("gallery_intro", "Gallery introduction", { multiline: true })}</div>
          </div>
          <div className="df-couple-gallery-group">
            <h3>{field("gallery_label", "Gallery label")}</h3>
            <div className="df-couple-moments-carousel" role="region" aria-roledescription="carousel" aria-label={copy.gallery}>
              <div className="df-couple-moments-controls">
                <span className="df-couple-moments-count" aria-live="polite">{String(filledGallery.length).padStart(2, "0")} / 06</span>
                <div className="df-couple-moments-arrows">
                  <button className="df-couple-moments-arrow" type="button" onClick={() => scrollToMoment(Math.max(0, activeMoment - 1))} disabled={activeMoment === 0} aria-label={copy.previous}>‹</button>
                  <button className="df-couple-moments-arrow" type="button" onClick={() => scrollToMoment(Math.min(displayGallery.length - 1, activeMoment + 1))} disabled={activeMoment >= displayGallery.length - 1} aria-label={copy.next}>›</button>
                </div>
              </div>
              <div className="df-couple-moments-track" ref={momentsTrackRef} onScroll={onMomentScroll} tabIndex={0}>
                {displayGallery.length ? displayGallery.map(renderGalleryItem) : <p className="df-couple-gallery-empty-message">{copy.noGallery}</p>}
              </div>
              <div className="df-couple-moments-pagination" aria-label={copy.gallery}>
                {displayGallery.map((item, index) => <button key={item.slot} className="df-couple-moments-dot" type="button" onClick={() => scrollToMoment(index)} aria-label={`${copy.slide} ${index + 1}`} aria-current={activeMoment === index ? "true" : undefined} />)}
              </div>
            </div>
          </div>
          </div>
        </section>

        <CoupleCreatePromo />

        <section className="df-couple-story" id="df-couple-story" aria-labelledby="df-couple-story-title">
          {editable && <button type="button" className="df-couple-pencil df-couple-batch-pencil" onClick={() => openBatchPanel("story")} aria-label={en ? "Edit story panel" : "Edit panel cerita"}><Pencil /></button>}
          <div className="df-couple-story-symbol" aria-hidden="true">♡</div>
          <div className="df-couple-story-copy">
            <p className="df-couple-eyebrow">{field("story_eyebrow", "Story eyebrow")}</p>
            <h2 id="df-couple-story-title">{field("story_title", "Story title")}</h2>
            <div className="df-couple-editable-block">{field("story_text", "Story text", { multiline: true })}</div>
            <div className="df-couple-editable-block df-couple-signature">{field("signature", "Signature", { multiline: true })}</div>
          </div>
        </section>

        <footer className="df-couple-footer">
          <span>{copy.footer}</span><span>DAJJAL FAMILY UNIVERSE</span>
          {editable && <button type="button" className="df-couple-reset-link" onClick={() => setShowResetConfirm(true)}>{copy.reset}</button>}
        </footer>
      </div>

      <CoupleBottomNavigation locale={locale} musicPlaying={musicPlaying} />

      {editable && showResetConfirm && (
        <div className="df-couple-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowResetConfirm(false); }}>
          <section className="df-couple-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="df-couple-reset-title" aria-describedby="df-couple-reset-description">
            <p className="df-couple-eyebrow">{en ? "CONFIRM ACTION" : "KONFIRMASI TINDAKAN"}</p>
            <h2 id="df-couple-reset-title">{copy.reset}</h2>
            <p id="df-couple-reset-description">{copy.resetMessage}</p>
            <div className="df-couple-confirm-actions">
              <button type="button" className="df-couple-confirm-primary" onClick={() => { setShowResetConfirm(false); onSave?.({ reset: true }); }}>{copy.continue}</button>
              <button type="button" className="df-couple-confirm-secondary" autoFocus onClick={() => setShowResetConfirm(false)}>{copy.cancel}</button>
            </div>
          </section>
        </div>
      )}

      {editable && batchPanel && <BatchPanelEdit panel={batchPanel} locale={locale} draft={batchDraft} setDraft={setBatchDraft} onSave={saveBatchPanel} onClose={() => { if (!batchSaving) setBatchPanel(""); }} saving={batchSaving} error={batchError} />}

      {activePhoto && (
        <div className="df-couple-lightbox" role="presentation" onClick={() => setActivePhoto(null)}>
          <button className="df-couple-lightbox-backdrop" type="button" onClick={() => setActivePhoto(null)} aria-label={copy.closePhoto} />
          <div className="df-couple-lightbox-panel" role="dialog" aria-modal="true" aria-label={activePhoto.alt} onClick={(event) => event.stopPropagation()}>
            <button className="df-couple-lightbox-close" type="button" onClick={() => setActivePhoto(null)} aria-label={copy.closePhoto}>×</button>
            <CoupleImage src={activePhoto.src} alt={activePhoto.alt} width={1800} height={2400} loading="eager" sizes="(max-width: 768px) 96vw, 80vw" /><p>{activePhoto.alt}</p>
          </div>
        </div>
      )}
    </main>
  );
}
