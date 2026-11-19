"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CoupleMusicPlayer from "@/app/components/CoupleMusicPlayer";
import { coupleDriveImage, COUPLE_GALLERY_SLOTS } from "@/lib/coupleProfileDefaults";

function durationSince(date) {
  if (!date) return [0, 0, 0, 0];
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(date + "T00:00:00").getTime()) / 1000));
  return [Math.floor(elapsed / 86400), Math.floor((elapsed % 86400) / 3600), Math.floor((elapsed % 3600) / 60), elapsed % 60];
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
  return (
    <span className={`df-couple-editable ${className}`} data-editing={editing ? "true" : "false"}>
      {editing ? (
        <span className="df-couple-edit-form">
          {multiline ? <textarea aria-label={label} value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} maxLength={3000} autoFocus /> :
            <input type={inputType} aria-label={label} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={inputType === "date" ? undefined : (label.toLowerCase().includes("name") ? 40 : 220)} autoFocus />}
          <span className="df-couple-edit-actions">
            <button type="button" onClick={save} disabled={saving}>{saving ? "…" : "Simpan"}</button>
            <button type="button" className="df-couple-edit-cancel" onClick={() => { setDraft(value || ""); setEditing(false); }}>Batal</button>
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

  return (
    <div className={`df-couple-image-slot ${className}`}>
      {fileId ? (
        <button className="df-couple-image-open" type="button" onClick={() => openPhoto?.(coupleDriveImage(fileId, 1800), label)} aria-label={`Open ${label}`}>
          <img src={coupleDriveImage(fileId, 1200)} alt={label} loading="lazy" />
        </button>
      ) : (
        <div className="df-couple-image-empty">{editable ? (en ? `Add ${label}` : `Tambahkan ${label}`) : label}</div>
      )}
      {editable && <button type="button" className="df-couple-pencil df-couple-image-pencil" title={en ? `Change ${label}` : `Ubah ${label}`} aria-label={en ? `Change ${label}` : `Ubah ${label}`} onClick={() => setEditing((current) => !current)} disabled={uploading}><Pencil /></button>}
      {editing && (
        <div className="df-couple-image-editor">
          <label>
            {en ? `Choose image · ${label}` : `Pilih foto · ${label}`}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={chooseFile}
              disabled={uploading}
            />
          </label>
          <small>{en ? `Recommended ratio ${recommendation} · JPG, PNG, WEBP or GIF · up to 12 MB` : `Rekomendasi ${recommendation} · JPG, PNG, WEBP atau GIF · maksimal 12 MB`}</small>
          {selectedFile && (
            <div className="df-couple-image-selected">
              {previewUrl && <img src={previewUrl} alt={en ? "Selected photo preview" : "Pratinjau foto yang dipilih"} />}
              <span>{selectedFile.name}</span>
            </div>
          )}
          <span className="df-couple-edit-actions">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {en ? "Choose from gallery" : "Pilih dari galeri"}
            </button>
            <button type="button" onClick={uploadSelected} disabled={!selectedFile || uploading}>
              {uploading ? (en ? "Uploading…" : "Mengunggah…") : (en ? "Upload" : "Upload")}
            </button>
            <button type="button" className="df-couple-edit-cancel" onClick={cancelEditing} disabled={uploading}>{en ? "Cancel" : "Batal"}</button>
          </span>
          {error && <small role="alert">{error}</small>}
        </div>
      )}
    </div>
  );
}

export default function CoupleProfileView({ profile, content, media = [], locale = "id", editable = false, onSave, onUpload }) {
  const en = locale === "en";
  const [time, setTime] = useState([0, 0, 0, 0]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
    slide: "Slide", footer: "DAJJAL FAMILY · COUPLE PROFILE", date: "Anniversary date",
    empty: "Add a photo", noGallery: "No photos have been added yet.", reset: "Reset Couple Profile", resetMessage: "Are you sure you want to delete all current settings? You will start again from the beginning.", continue: "Continue", cancel: "Cancel",
  } : {
    eyebrow: "CERITA DARI DAJJAL FAMILY", identity: "IDENTITAS PASANGAN", gallery: "KENANGAN KITA",
    openPhoto: "Buka foto", closePhoto: "Tutup foto", previous: "Foto sebelumnya", next: "Foto berikutnya",
    slide: "Slide", footer: "DAJJAL FAMILY · COUPLE PROFILE", date: "Tanggal anniversary",
    empty: "Add a photo", noGallery: "Belum ada foto galeri.", reset: "Reset Couple Profile", resetMessage: "Yakin untuk menghapus semua pengaturan saat ini? Anda akan memulai dari awal lagi", continue: "Lanjutkan", cancel: "Batal",
  };
  useEffect(() => {
    const update = () => setTime(durationSince(profile.anniversary_date));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [profile.anniversary_date]);
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
  const saveContent = (key, value) => onSave?.({ content: { [key]: value } });
  const saveProfile = (key, value) => onSave?.({ profile: { [key]: value } });
  const field = (key, label, options = {}) => (
    <EditableText value={content[key]} label={label} editable={editable} onSave={(value) => saveContent(key, value)} {...options} />
  );
  const openPhoto = (src, alt) => setActivePhoto({ src, alt });
  const renderGalleryItem = ({ slot, index, fileId }) => (
    <div className="df-couple-gallery-slot" key={slot}>
      <EditableImage
        fileId={fileId}
        label={`${en ? "Memory" : "Kenangan"} ${index + 1}`}
        editable={editable}
        locale={locale}
        onUpload={(file) => onUpload?.(slot, file)}
        recommendation="3:4"
        className="df-couple-gallery-item"
        openPhoto={openPhoto}
      />
      <span className="df-couple-gallery-caption">{`${en ? "Memory" : "Kenangan"} ${index + 1}`}</span>
    </div>
  );

  return (
    <main className="df-couple-profile-page">
      <div className="df-couple-shell">
        <header className="df-couple-hero" id="df-couple-home">
          <p className="df-couple-eyebrow">{copy.eyebrow}</p>
          <h1 className="df-couple-title">
            <EditableText value={profile.male_nickname} label="Male name" editable={editable} onSave={(value) => saveProfile("maleNickname", value)} />
            <span className="df-couple-connector" aria-hidden="true">×</span>
            <EditableText value={profile.female_nickname} label="Female name" editable={editable} onSave={(value) => saveProfile("femaleNickname", value)} />
          </h1>
          <div className="df-couple-editable-block df-couple-subtitle">{field("subtitle", "Subtitle")}</div>
          <div className="df-couple-editable-block df-couple-intro">{field("intro", "Introduction", { multiline: true })}</div>
          <div className="df-couple-featured-wrap">
            <EditableImage fileId={mediaMap.cover} label="Cover image" editable={editable} locale={locale} onUpload={(file) => onUpload?.("cover", file)} recommendation="3:4" className="df-couple-featured-photo" openPhoto={openPhoto} />
            <span className="df-couple-featured-label">{en ? "FEATURED MOMENT" : "POTRET UTAMA"}</span>
          </div>
          <div className="df-couple-anniversary-heading">
            <p className="df-couple-eyebrow">{field("anniversary_label", "Anniversary label")}</p>
          </div>
          {profile.anniversary_date && <section className="df-couple-metrics" aria-label={content.anniversary_label}>
            {time.map((value, index) => <div className="df-couple-metric" key={timeUnits[index]}><strong>{value.toLocaleString(en ? "en-US" : "id-ID")}</strong><span>{timeUnits[index]}</span></div>)}
          </section>}
          {editable && (
            <div className="df-couple-date-edit">
              <EditableText value={profile.anniversary_date || ""} label={copy.date} editable inputType="date" onSave={(value) => saveProfile("anniversaryDate", value || null)} />
            </div>
          )}
        </header>

        <CoupleMusicPlayer onPlaybackStateChange={setMusicPlaying} />

        <section className="df-couple-section" id="df-couple-profile" aria-labelledby="df-couple-identities">
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
        </section>

        <section className="df-couple-gallery" id="df-couple-gallery" aria-labelledby="df-couple-gallery-title">
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
        </section>

        <section className="df-couple-story" id="df-couple-story" aria-labelledby="df-couple-story-title">
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

      <nav className="df-couple-bottom-nav" aria-label={en ? "Couple page navigation" : "Navigasi halaman Couple"}>
        <a className="df-couple-bottom-nav-item" href="#df-couple-home"><span aria-hidden="true">⌂</span><span>{en ? "Home" : "Awal"}</span></a>
        <a className="df-couple-bottom-nav-item" href="#df-couple-profile"><span aria-hidden="true">♡</span><span>{en ? "Profile" : "Profil"}</span></a>
        <button className="df-couple-bottom-nav-music" type="button" onClick={() => window.dispatchEvent(new CustomEvent("df-couple-music-toggle"))} aria-label={musicPlaying ? "Pause music" : "Play music"} aria-pressed={musicPlaying}>{musicPlaying ? "Ⅱ" : "♫"}</button>
        <a className="df-couple-bottom-nav-item" href="#df-couple-gallery"><span aria-hidden="true">▧</span><span>{en ? "Gallery" : "Galeri"}</span></a>
        <a className="df-couple-bottom-nav-item" href="#df-couple-story"><span aria-hidden="true">▤</span><span>{en ? "Story" : "Kisah"}</span></a>
      </nav>

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

      {activePhoto && (
        <div className="df-couple-lightbox" role="presentation" onClick={() => setActivePhoto(null)}>
          <button className="df-couple-lightbox-backdrop" type="button" onClick={() => setActivePhoto(null)} aria-label={copy.closePhoto} />
          <div className="df-couple-lightbox-panel" role="dialog" aria-modal="true" aria-label={activePhoto.alt} onClick={(event) => event.stopPropagation()}>
            <button className="df-couple-lightbox-close" type="button" onClick={() => setActivePhoto(null)} aria-label={copy.closePhoto}>×</button>
            <img src={activePhoto.src} alt={activePhoto.alt} /><p>{activePhoto.alt}</p>
          </div>
        </div>
      )}
    </main>
  );
}
