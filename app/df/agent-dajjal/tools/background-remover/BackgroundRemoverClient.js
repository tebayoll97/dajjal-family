"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Alert, Badge, Button, Card, ImageDropzone, ImagePreview, ProgressBar, RangeSlider, SvgIcon } from "@/app/components/ui";

const COPY = {
  id: {
    eyebrow:"AGENT DAJJAL · PEMROSESAN LOKAL",title:"Background Remover",intro:"Hapus latar foto orang langsung di perangkatmu menggunakan AI lokal. Foto tidak diunggah.",
    back:"Semua tools",choose:"Pilih foto",hint:"JPG, PNG, WebP, AVIF · Maks. 20 MB · Foto manusia",original:"Foto asli",result:"Hasil transparan",
    empty:"Hasil akan muncul di sini",model:"Model AI",modelReady:"Model siap",download:"Unduh PNG transparan",process:"Hapus background",processing:"Memproses…",
    threshold:"Ketegasan tepi",feather:"Kelembutan tepi",privacy:"Foto tetap berada di perangkat. Model AI diunduh saat pertama digunakan dan dapat disimpan di cache browser.",
    invalid:"Pilih file gambar JPG, PNG, WebP, atau AVIF.",large:"Ukuran file maksimal 20 MB.",dimensions:"Resolusi gambar terlalu besar. Maksimal 16 megapiksel.",
    decode:"Browser tidak dapat membaca gambar ini.",failed:"Pemrosesan gagal. Coba foto lain atau muat ulang halaman.",
    modelDownload:"Mengunduh model AI…",modelLoad:"Menyiapkan model AI…",segment:"Menganalisis subjek…",ready:"Background berhasil dihapus.",reset:"Ganti foto",
    attribution:"Model MediaPipe Selfie Segmentation oleh Google · Apache-2.0",portraitOnly:"Model ini dirancang untuk memisahkan orang dari latar, bukan semua jenis objek.",
    modelError:"Model AI tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.",integrity:"Verifikasi keamanan model gagal. Unduhan dibatalkan.",
  },
  en: {
    eyebrow:"AGENT DAJJAL · LOCAL PROCESSING",title:"Background Remover",intro:"Remove a person's photo background directly on your device using local AI. Your photo is never uploaded.",
    back:"All tools",choose:"Choose photo",hint:"JPG, PNG, WebP, AVIF · Max 20 MB · Human portraits",original:"Original photo",result:"Transparent result",
    empty:"Your result will appear here",model:"AI model",modelReady:"Model ready",download:"Download transparent PNG",process:"Remove background",processing:"Processing…",
    threshold:"Edge threshold",feather:"Edge softness",privacy:"Your photo stays on your device. The AI model downloads on first use and may be cached by your browser.",
    invalid:"Choose a JPG, PNG, WebP, or AVIF image.",large:"Maximum file size is 20 MB.",dimensions:"Image is too large. Maximum is 16 megapixels.",
    decode:"This browser could not read the image.",failed:"Processing failed. Try another photo or reload the page.",
    modelDownload:"Downloading AI model…",modelLoad:"Preparing AI model…",segment:"Analyzing subject…",ready:"Background removed successfully.",reset:"Change photo",
    attribution:"MediaPipe Selfie Segmentation by Google · Apache-2.0",portraitOnly:"This model is designed to separate people from backgrounds, not arbitrary objects.",
    modelError:"The AI model could not be loaded. Check your internet connection and try again.",integrity:"Model security verification failed. Download canceled.",
  },
};
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_PIXELS = 16000000;

function bytes(value) { return value < 1024 * 1024 ? `${(value / 1024).toFixed(1)} KB` : `${(value / (1024 * 1024)).toFixed(2)} MB`; }

export default function BackgroundRemoverClient() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.id;
  const workerRef = useRef(null);
  const sequenceRef = useRef(0);
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [threshold, setThreshold] = useState(48);
  const [feather, setFeather] = useState(16);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    if (!file) { setOriginalUrl(""); return; }
    const url = URL.createObjectURL(file); setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!resultBlob) { setResultUrl(""); return; }
    const url = URL.createObjectURL(resultBlob); setResultUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resultBlob]);
  useEffect(() => () => { workerRef.current?.terminate(); }, []);

  const chooseFile = (files) => {
    const next = files?.[0];
    if (!next) return;
    setError(""); setNotice(""); setResultBlob(null);
    if (!/^image\/(jpeg|png|webp|avif)$/i.test(next.type)) { setFile(null); setError(t.invalid); return; }
    if (next.size > MAX_BYTES) { setError(t.large); return; }
    setFile(next);
  };

  const process = async () => {
    if (!file || busy) return;
    setBusy(true); setError(""); setNotice(""); setResultBlob(null); setProgress(5); setStage(t.modelLoad);
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > MAX_PIXELS) throw new Error("IMAGE_PIXEL_LIMIT");
      const id = ++sequenceRef.current;
      const worker = new Worker(new URL("../../../../../workers/agent-dajjal/background-remover.worker.js", import.meta.url), { type: "module" });
      workerRef.current?.terminate(); workerRef.current = worker;
      worker.onmessage = async (event) => {
        const message = event.data || {};
        if (message.id !== id) { message.image?.close?.(); return; }
        if (message.type === "progress") {
          if (message.stage === "model-download") { setStage(t.modelDownload); setProgress(25); }
          else if (message.stage === "model-ready") { setModelReady(true); setStage(t.segment); setProgress(65); }
          else if (message.stage === "segmenting") { setStage(t.segment); setProgress(78); }
          else if (message.stage === "loading") { setStage(t.modelLoad); setProgress(12); }
        }
        if (message.type === "error") {
          setBusy(false);
          const messages = { IMAGE_PIXEL_LIMIT:t.dimensions, MODEL_INTEGRITY_FAILED:t.integrity, MODEL_SIZE_MISMATCH:t.integrity };
          setError(messages[message.error] || (message.error?.startsWith("MODEL_DOWNLOAD") ? t.modelError : t.failed));
          worker.terminate(); if (workerRef.current === worker) workerRef.current = null;
        }
        if (message.type === "result") {
          try {
            const canvas = document.createElement("canvas"); canvas.width = message.width; canvas.height = message.height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("CANVAS_UNAVAILABLE");
            context.drawImage(message.image, 0, 0); message.image.close?.();
            const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("ENCODE_FAILED")), "image/png"));
            setResultBlob(blob); setProgress(100); setStage(""); setNotice(t.ready);
          } catch { setError(t.failed); }
          finally { setBusy(false); worker.terminate(); if (workerRef.current === worker) workerRef.current = null; }
        }
      };
      worker.onerror = () => { setBusy(false); setError(t.failed); worker.terminate(); if (workerRef.current === worker) workerRef.current = null; };
      worker.postMessage({ id, image: bitmap, threshold: threshold / 100, feather: feather / 100 }, [bitmap]);
      bitmap = null;
    } catch (cause) {
      const messages = { IMAGE_PIXEL_LIMIT:t.dimensions, InvalidStateError:t.decode };
      setError(messages[cause?.message] || (cause?.name === "InvalidStateError" ? t.decode : t.failed));
      setBusy(false);
    } finally { bitmap?.close?.(); }
  };

  const download = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "agent-dajjal-background-removed.png";
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <main className="ui-page ui-stack-lg df-local-image-tool">
      <div className="ui-cluster df-local-tool-topbar">
        <Link className="ui-link" href="/df/agent-dajjal/tools"><SvgIcon name="arrow-left" />{t.back}</Link>
        <Badge variant="success"><SvgIcon name="shield" />{t.modelReady && modelReady ? t.modelReady : "100% local"}</Badge>
      </div>
      <header className="ui-page-heading">
        <div className="ui-page-heading-copy">
          <p className="ui-eyebrow">{t.eyebrow}</p>
          <h1 className="ui-heading-h1 ui-text-local-tool-title">{t.title}</h1>
          <p className="ui-subtitle">{t.intro}</p>
        </div>
      </header>
      <Card className="ui-local-tool-panel ui-stack">
        {!file ? <ImageDropzone accept="image/jpeg,image/png,image/webp,image/avif" label={t.choose} description={t.hint} actionLabel={t.choose} onFiles={chooseFile} disabled={busy} /> :
          <div className="ui-stack">
            <div className="ui-cluster df-local-file-row"><strong className="ui-text-mobile-small">{file.name}</strong><Badge>{bytes(file.size)}</Badge><Button size="sm" variant="secondary" onClick={() => { setFile(null); setResultBlob(null); setError(""); setNotice(""); }} disabled={busy}>{t.reset}</Button></div>
            <div className="ui-grid-2 df-local-preview-grid">
              <ImagePreview label={t.original} src={originalUrl} alt={t.original} />
              <ImagePreview label={t.result} src={resultUrl} alt={t.result} emptyLabel={t.empty} />
            </div>
          </div>}
        {file && <div className="ui-stack">
          <RangeSlider label={`${t.threshold} · ${threshold}%`} value={threshold} onChange={(value) => { setThreshold(value); setResultBlob(null); setNotice(""); }} min={20} max={80} step={1} disabled={busy} hint={language === "id" ? "Atur batas pemisahan subjek dan latar." : "Adjust the subject/background separation threshold."} />
          <RangeSlider label={`${t.feather} · ${feather}%`} value={feather} onChange={(value) => { setFeather(value); setResultBlob(null); setNotice(""); }} min={0} max={35} step={1} disabled={busy} hint={language === "id" ? "Lunakkan transisi di sekitar tepi subjek." : "Soften the transition around subject edges."} />
          <Button onClick={process} loading={busy} disabled={busy} wide><SvgIcon name="layers" />{busy ? t.processing : t.process}</Button>
          {busy ? <ProgressBar value={progress} label={stage} showValue /> : null}
          {resultBlob ? <Button variant="secondary" onClick={download} wide><SvgIcon name="download" />{t.download}</Button> : null}
        </div>}
        {error ? <Alert variant="danger" title={language === "id" ? "Tidak dapat memproses gambar" : "Unable to process image"}>{error}</Alert> : null}
        {notice ? <Alert variant="success">{notice}</Alert> : null}
      </Card>
      <Card className="ui-local-tool-note ui-stack-sm">
        <div className="ui-cluster"><SvgIcon name="shield" /><strong>{t.privacy}</strong></div>
        <p className="ui-text-mobile-small">{t.portraitOnly}</p>
        <p className="ui-text-meta">{t.attribution}</p>
      </Card>
    </main>
  );
}
