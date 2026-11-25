"use client";
import { useEffect, useState } from "react";
import { Alert, Avatar, Button, Card, Dialog, SectionHeader, TextField } from "@/app/components/ui";

export default function ContributorProfileEditor({ contributor, accessToken, locale = "id", onSaved }) {
  const isEn = locale === "en";
  const [name, setName] = useState(contributor?.display_name || "");
  const [bio, setBio] = useState(contributor?.[isEn ? "bio_en" : "bio_id"] || contributor?.bio_id || contributor?.bio_en || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(""); setFeedback(null);
    try {
      const response = await fetch("/api/blog/contributors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ display_name: name, bio, source_locale: locale }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || (isEn ? "Unable to save profile." : "Profil tidak dapat disimpan."));
      onSaved?.(result.contributor); setFeedback({ type: "success", message: isEn ? "Your public profile has been updated." : "Profil publik berhasil diperbarui." });
    } catch (cause) { setFeedback({ type: "error", message: cause.message || (isEn ? "Unable to save profile." : "Profil tidak dapat disimpan.") }); }
    finally { setBusy(false); }
  }

  async function uploadAvatar() {
    if (!file || uploading || busy) return;
    setUploading(true); setError(""); setSaved(false);
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/blog/contributors/avatar", {
        method: "POST", headers: { Authorization: "Bearer " + accessToken }, body: form,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || (isEn ? "Avatar upload failed." : "Upload avatar gagal."));
      onSaved?.({ ...contributor, ...result.contributor }); setFile(null); setFeedback({ type: "success", message: isEn ? "Profile photo uploaded successfully." : "Foto profil berhasil diunggah." });
    } catch (cause) { setFeedback({ type: "error", message: cause.message || (isEn ? "Avatar upload failed." : "Upload avatar gagal.") }); }
    finally { setUploading(false); }
  }

  return <Card className="ui-stack df-author-profile-editor">
    <SectionHeader title={isEn ? "Public author profile" : "Profil penulis publik"} />
    {error ? <Alert variant="danger" title={isEn ? "Could not save" : "Gagal menyimpan"}>{error}</Alert> : null}
    {saved ? <Alert variant="success" title={isEn ? "Profile saved" : "Profil tersimpan"}>{isEn ? "Your public profile has been updated." : "Profil publik berhasil diperbarui."}</Alert> : null}
    <form className="ui-stack" onSubmit={submit}>
      <TextField label={isEn ? "Display name" : "Nama tampilan"} value={name} onChange={event => setName(event.target.value)} maxLength={80} required />
      <div className="ui-author-avatar-upload">
        <Avatar src={preview || contributor?.avatar_url} name={name || contributor?.display_name || "Author"} size="xl" />
        <div className="ui-stack-sm ui-author-avatar-upload__body">
          <TextField label={isEn ? "Profile photo" : "Foto profil"} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0] || null)} helpText={isEn ? "JPG, PNG, or WEBP · maximum 4 MB. Uploaded to your Blog folder in Google Drive." : "JPG, PNG, atau WEBP · maksimal 4 MB. Disimpan ke folder Blog milikmu di Google Drive."} />
          <div className="ui-cluster"><Button type="button" size="sm" disabled={!file || uploading || busy} loading={uploading} onClick={uploadAvatar}>{isEn ? "Upload photo" : "Upload foto"}</Button>{file ? <Button type="button" size="sm" variant="secondary" disabled={uploading} onClick={() => setFile(null)}>{isEn ? "Cancel" : "Batal"}</Button> : null}</div>
        </div>
      </div>
      <TextField as="textarea" label={isEn ? "Biography" : "Bio penulis"} value={bio} onChange={event => setBio(event.target.value)} rows={4} maxLength={600} />
      <div className="ui-cluster"><Button type="submit" loading={busy} disabled={uploading}>{isEn ? "Save public profile" : "Simpan profil publik"}</Button></div>
    </form>
    <Dialog
      open={Boolean(feedback)}
      onClose={() => setFeedback(null)}
      title={feedback?.type === "error" ? (isEn ? "Action failed" : "Aksi gagal") : (isEn ? "Success" : "Berhasil")}
      closeLabel={isEn ? "Close dialog" : "Tutup dialog"}
      actions={<Button onClick={() => setFeedback(null)}>{isEn ? "Close" : "Tutup"}</Button>}
    >
      {feedback ? <Alert variant={feedback.type === "error" ? "danger" : "success"}>{feedback.message}</Alert> : null}
    </Dialog>
  </Card>;
}
