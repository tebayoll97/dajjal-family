"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Button, Card, SvgIcon } from "@/app/components/ui";
import { compressImage } from "@/lib/agent-dajjal/tools/image-compressor";
import styles from "./image-compressor.module.css";

const COPY = {
  id: {
    eyebrow: "AGENT DAJJAL · LOCAL TOOL", title: "Kompres Gambar",
    intro: "Kecilkan ukuran gambar langsung di perangkatmu. File tidak dikirim ke server.",
    back: "Semua tools", choose: "Pilih gambar", change: "Ganti gambar", drop: "Pilih gambar dari perangkat",
    hint: "JPG, PNG, WebP, atau AVIF · Maks. 40 MB", format: "Format hasil", quality: "Kualitas",
    scale: "Ukuran dimensi", process: "Kompres gambar", processing: "Memproses…", download: "Unduh hasil",
    original: "Asli", result: "Hasil kompresi", ready: "Gambar berhasil dikompres.",
    saved: "Pengurangan ukuran", local: "100% lokal", noUpload: "File tetap berada di perangkat. Tidak ada unggahan.",
    invalid: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.",
    large: "File terlalu besar (maksimum 40 MB).", imageLarge: "Dimensi gambar melebihi batas 12.000 px.",
    failed: "Gambar tidak dapat diproses di browser ini.", selectFirst: "Pilih gambar terlebih dahulu.",
    jpeg: "JPEG", png: "PNG (transparansi)", webp: "WebP (disarankan)", originalSize: "Ukuran file",
    dimensions: "Dimensi", reset: "Hapus gambar", keep: "Pilih format yang sesuai dengan kebutuhan kualitas dan transparansi.",
  },
  en: {
    eyebrow: "AGENT DAJJAL · LOCAL TOOL", title: "Image Compressor",
    intro: "Reduce image size directly on your device. Your file is never sent to a server.",
    back: "All tools", choose: "Choose image", change: "Change image", drop: "Choose an image from your device",
    hint: "JPG, PNG, WebP, or AVIF · Max 40 MB", format: "Output format", quality: "Quality",
    scale: "Dimensions", process: "Compress image", processing: "Processing…", download: "Download result",
    original: "Original", result: "Compressed result", ready: "Image compressed successfully.",
    saved: "Size reduction", local: "100% local", noUpload: "Your file stays on your device. Nothing is uploaded.",
    invalid: "Unsupported file type. Use JPG, PNG, WebP, or AVIF.",
    large: "File is too large (40 MB maximum).", imageLarge: "Image dimensions exceed the 12,000 px limit.",
    failed: "This image could not be processed in this browser.", selectFirst: "Choose an image first.",
    jpeg: "JPEG", png: "PNG (transparency)", webp: "WebP (recommended)", originalSize: "File size",
    dimensions: "Dimensions", reset: "Remove image", keep: "Choose a format that fits your quality and transparency needs.",
  },
};

function formatBytes(value) {
  if (!Number.isFinite(value)) return "—";
  if (value < 1024) return value + " B";
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + " KB";
  return (value / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageCompressorClient() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.id;
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [format, setFormat] = useState("image/webp");
  const [quality, setQuality] = useState(0.82);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!result?.blob) return;
    const url = URL.createObjectURL(result.blob);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  const onChoose = (next) => {
    const selected = next?.[0];
    if (!selected) return;
    setError(""); setNotice(""); setResult(null);
    setFile(selected);
  };

  const runCompression = async () => {
    if (!file) { setError(t.selectFirst); return; }
    setBusy(true); setError(""); setNotice(""); setResult(null);
    try {
      const output = await compressImage(file, { format, quality, scale });
      setResult(output); setNotice(t.ready);
    } catch (cause) {
      const messages = {
        INVALID_FILE: t.invalid, UNSUPPORTED_FORMAT: t.invalid, FILE_TOO_LARGE: t.large,
        IMAGE_TOO_LARGE: t.imageLarge,
      };
      setError(messages[cause?.message] || t.failed);
    } finally { setBusy(false); }
  };

  const download = () => {
    if (!result?.blob) return;
    const extension = result.type === "image/jpeg" ? "jpg" : result.type === "image/png" ? "png" : "webp";
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `agent-dajjal-compressed.${extension}`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const reduction = result && file?.size ? Math.max(0, (1 - result.outputSize / file.size) * 100) : 0;

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <Link href="/df/agent-dajjal/tools" className={styles.back}><SvgIcon name="arrow-left" size={16} />{t.back}</Link>
        <span className={styles.localBadge}><span />{t.local}</span>
      </div>
      <header className="ui-page-heading">
        <div className="ui-page-heading-copy">
          <p className="ui-eyebrow">{t.eyebrow}</p>
          <h1 className="ui-heading-h1">{t.title}</h1>
          <p className="ui-subtitle">{t.intro}</p>
        </div>
      </header>

      <Card className={styles.workspace}>
        {!file ? (
          <button type="button" className={styles.dropzone} onClick={() => inputRef.current?.click()}>
            <span className={styles.uploadIcon}><SvgIcon name="image-plus" size={26} /></span>
            <strong>{t.drop}</strong><span>{t.hint}</span>
            <span className="ui-button ui-button-primary">{t.choose}</span>
          </button>
        ) : (
          <div className={styles.selected}>
            <div className={styles.fileRow}>
              <div className={styles.fileName}><SvgIcon name="file-image" size={20} /><span>{file.name}</span></div>
              <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>{t.change}</Button>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(null); setError(""); setNotice(""); }}>{t.reset}</Button>
            </div>
            <div className={styles.previewGrid}>
              <section className={styles.previewPanel}>
                <h2>{t.original}</h2>
                <div className={styles.previewFrame}><img src={preview} alt={t.original} /></div>
                <p>{formatBytes(file.size)}</p>
              </section>
              <section className={styles.previewPanel}>
                <h2>{t.result}</h2>
                <div className={styles.previewFrame}>
                  {result ? <img src={URL.createObjectURL(result.blob)} alt={t.result} /> : <span>{t.process}</span>}
                </div>
                <p>{result ? formatBytes(result.outputSize) : "—"}</p>
              </section>
            </div>
          </div>
        )}
        <input ref={inputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => onChoose(event.target.files)} />
        {file && <div className={styles.controls}>
          <label className={styles.field}><span>{t.format}</span>
            <select className="ui-select" value={format} onChange={(event) => { setFormat(event.target.value); setResult(null); }}>
              <option value="image/webp">{t.webp}</option><option value="image/jpeg">{t.jpeg}</option><option value="image/png">{t.png}</option>
            </select>
          </label>
          <label className={styles.field}><span>{t.quality} · {Math.round(quality * 100)}%</span>
            <input className={styles.range} type="range" min="0.4" max="0.95" step="0.05" value={quality} disabled={format === "image/png"} onChange={(event) => { setQuality(Number(event.target.value)); setResult(null); }} />
          </label>
          <label className={styles.field}><span>{t.scale} · {Math.round(scale * 100)}%</span>
            <input className={styles.range} type="range" min="0.25" max="1" step="0.05" value={scale} onChange={(event) => { setScale(Number(event.target.value)); setResult(null); }} />
          </label>
          <p className={styles.hint}>{t.keep}</p>
          <div className={styles.actions}>
            <Button onClick={runCompression} loading={busy} disabled={busy} wide>{busy ? t.processing : t.process}</Button>
            {result && <Button variant="secondary" onClick={download} wide>{t.download}</Button>}
          </div>
        </div>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {notice && <p className={styles.success} role="status">{notice}</p>}
        {result && <div className={styles.resultMeta}>
          <div><span>{t.saved}</span><strong>{reduction.toFixed(1)}%</strong></div>
          <div><span>{t.dimensions}</span><strong>{result.width} × {result.height}</strong></div>
          <div><span>{t.originalSize}</span><strong>{formatBytes(file.size)} → {formatBytes(result.outputSize)}</strong></div>
        </div>}
      </Card>
      <p className={styles.privacy}><SvgIcon name="shield-check" size={17} />{t.noUpload}</p>
    </main>
  );
}
