"use client";
import { useState } from "react";
import { Alert, Button, Card, SectionHeader, TextField } from "@/app/components/ui";

export default function ContributorProfileEditor({ contributor, accessToken, locale = "id", onSaved }) {
  const isEn = locale === "en";
  const [name, setName] = useState(contributor?.display_name || "");
  const [bioId, setBioId] = useState(contributor?.bio_id || "");
  const [bioEn, setBioEn] = useState(contributor?.bio_en || "");
  const [avatar, setAvatar] = useState(contributor?.avatar_url || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    try {
      const response = await fetch("/api/blog/contributors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ display_name: name, bio_id: bioId, bio_en: bioEn, avatar_url: avatar }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || (isEn ? "Unable to save profile." : "Profil tidak dapat disimpan."));
      onSaved?.(result.contributor);
      setSaved(true);
    } catch (cause) {
      setError(cause.message || (isEn ? "Unable to save profile." : "Profil tidak dapat disimpan."));
    } finally { setBusy(false); }
  }

  return <Card className="ui-stack">
    <SectionHeader title={isEn ? "Public author profile" : "Profil penulis publik"} description={isEn ? "This information appears on your public author page and contributor directory." : "Informasi ini tampil di halaman profil publik dan direktori kontributor."} />
    {error ? <Alert variant="danger" title={isEn ? "Could not save" : "Gagal menyimpan"}>{error}</Alert> : null}
    {saved ? <Alert variant="success" title={isEn ? "Profile saved" : "Profil tersimpan"}>{isEn ? "Your public profile has been updated." : "Profil publik berhasil diperbarui."}</Alert> : null}
    <form className="ui-stack" onSubmit={submit}>
      <TextField label={isEn ? "Display name" : "Nama tampilan"} value={name} onChange={event => setName(event.target.value)} maxLength={80} required />
      <TextField label={isEn ? "Avatar image URL (HTTPS)" : "URL foto profil (HTTPS)"} value={avatar} onChange={event => setAvatar(event.target.value)} type="url" maxLength={2000} helpText={isEn ? "Use a publicly accessible HTTPS image URL." : "Gunakan URL gambar HTTPS yang dapat diakses publik."} />
      <TextField as="textarea" label="Bio — Bahasa Indonesia" value={bioId} onChange={event => setBioId(event.target.value)} rows={3} maxLength={600} />
      <TextField as="textarea" label="Bio — English" value={bioEn} onChange={event => setBioEn(event.target.value)} rows={3} maxLength={600} />
      <div className="ui-cluster"><Button type="submit" loading={busy}>{isEn ? "Save public profile" : "Simpan profil publik"}</Button></div>
    </form>
  </Card>;
}
