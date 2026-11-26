"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Button, Card, Dialog, PageHeader } from "@/app/components/ui";
import { supabase } from "@/lib/supabase";
import "./generator-pixel.css";

const WIDTH = 193;
const HEIGHT = 45;
const MAX_CHARACTERS = 32000;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const COPY = {
  id: {
    eyebrow: "DARKWAR SURVIVAL · COMMUNITY TOOL",
    title: "Pixel Bio Generator",
    description: "Ubah gambar menjadi kode bio pixel Darkwar Survival.",
    stepUpload: "Pilih gambar",
    uploadHint: "JPG, PNG, atau WebP",
    choose: "Pilih gambar",
    replace: "Ganti gambar",
    cropTitle: "Atur komposisi",
    cropHint: "Geser gambar untuk mengatur posisi. Gunakan slider untuk memperbesar atau memperkecil.",
    zoom: "Zoom gambar",
    reset: "Atur ulang",
    process: "Buat Pixel Bio",
    processing: "Memproses…",
    uploading: "Memproses...",
    encoding: "Memproses...",
    successTitle: "Pixel Bio berhasil dibuat!",
    successDescription: "Gambar berhasil diproses dan kode bio siap disalin.",
    copy: "Copy Code",
    copied: "Kode berhasil disalin!",
    done: "Selesai",
    errorTitle: "Belum berhasil",
    invalidType: "Gunakan gambar JPG, PNG, atau WebP.",
    tooLarge: "Ukuran gambar maksimal 20 MB.",
    noImage: "Pilih gambar terlebih dahulu.",
    session: "Sesi admin tidak ditemukan. Silakan masuk kembali.",
    uploadError: "Gambar gagal disimpan ke Google Drive.",
    processError: "Gambar belum dapat diproses. Coba atur ulang posisi atau gunakan gambar lain.",
    noPreview: "Pratinjau gambar akan muncul di sini.",
    resultTitle: "Hasil Pixel Bio",
  },
  en: {
    eyebrow: "DARKWAR SURVIVAL · COMMUNITY TOOL",
    title: "Pixel Bio Generator",
    description: "Turn an image into Darkwar Survival pixel bio code.",
    stepUpload: "Choose an image",
    uploadHint: "JPG, PNG, or WebP",
    choose: "Choose image",
    replace: "Change image",
    cropTitle: "Adjust composition",
    cropHint: "Drag the image to position it. Use the slider to zoom in or out.",
    zoom: "Image zoom",
    reset: "Reset",
    process: "Create Pixel Bio",
    processing: "Processing…",
    uploading: "Processing...",
    encoding: "Processing...",
    successTitle: "Pixel Bio created!",
    successDescription: "Your image has been processed and the bio code is ready to copy.",
    copy: "Copy Code",
    copied: "Code copied successfully!",
    done: "Done",
    errorTitle: "Unable to complete",
    invalidType: "Use a JPG, PNG, or WebP image.",
    tooLarge: "Image size must not exceed 20 MB.",
    noImage: "Choose an image first.",
    session: "Admin session not found. Please sign in again.",
    uploadError: "The image could not be saved to Google Drive.",
    processError: "The image could not be processed. Reset the crop or try another image.",
    noPreview: "Your image preview will appear here.",
    resultTitle: "Pixel Bio Result",
  },
};

function colorTag(rgb) {
  const short = rgb.map((channel) => Math.max(0, Math.min(15, Math.round(channel / 17))).toString(16)).join("");
  return `<#${short}>`;
}

function medianCutPalette(pixels, requestedColors) {
  const initial = pixels.map((pixel, index) => ({ r: pixel[0], g: pixel[1], b: pixel[2], index }));
  const boxes = [initial];

  while (boxes.length < requestedColors) {
    let selectedIndex = -1;
    let selectedRange = -1;
    let selectedChannel = "r";

    boxes.forEach((box, index) => {
      if (box.length < 2) return;
      const ranges = ["r", "g", "b"].map((channel) => {
        const values = box.map((pixel) => pixel[channel]);
        return Math.max(...values) - Math.min(...values);
      });
      const range = Math.max(...ranges);
      if (range > selectedRange) {
        selectedRange = range;
        selectedIndex = index;
        selectedChannel = ["r", "g", "b"][ranges.indexOf(range)];
      }
    });

    if (selectedIndex < 0 || selectedRange <= 0) break;
    const box = boxes.splice(selectedIndex, 1)[0];
    box.sort((a, b) => a[selectedChannel] - b[selectedChannel]);
    const middle = Math.floor(box.length / 2);
    boxes.push(box.slice(0, middle), box.slice(middle));
  }

  return boxes.map((box) => {
    const total = box.reduce((sum, pixel) => ({
      r: sum.r + pixel.r,
      g: sum.g + pixel.g,
      b: sum.b + pixel.b,
    }), { r: 0, g: 0, b: 0 });
    return [
      Math.round(total.r / box.length),
      Math.round(total.g / box.length),
      Math.round(total.b / box.length),
    ];
  });
}

function encodePixelCanvas(canvas) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable.");
  const image = context.getImageData(0, 0, WIDTH, HEIGHT);
  const pixels = [];
  for (let index = 0; index < image.data.length; index += 4) {
    pixels.push([image.data[index], image.data[index + 1], image.data[index + 2]]);
  }

  const candidates = [64, 48, 32, 24, 16, 12, 8, 6, 4, 3, 2];
  let lastResult = null;

  for (const colorCount of candidates) {
    const palette = medianCutPalette(pixels, colorCount);
    const rows = [];
    for (let y = 0; y < HEIGHT; y += 1) {
      let row = "";
      let activeTag = "";
      let runLength = 0;
      for (let x = 0; x < WIDTH; x += 1) {
        const pixel = pixels[y * WIDTH + x];
        let nearest = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (let colorIndex = 0; colorIndex < palette.length; colorIndex += 1) {
          const color = palette[colorIndex];
          const dr = pixel[0] - color[0];
          const dg = pixel[1] - color[1];
          const db = pixel[2] - color[2];
          const distance = dr * dr + dg * dg + db * db;
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = colorIndex;
          }
        }
        const nextTag = colorTag(palette[nearest]);
        if (nextTag === activeTag) {
          runLength += 1;
        } else {
          if (runLength) row += activeTag + ".".repeat(runLength);
          activeTag = nextTag;
          runLength = 1;
        }
      }
      if (runLength) row += activeTag + ".".repeat(runLength);
      rows.push(row);
    }

    const code = `<size="10"><line-height=10%>\n${rows.join("\n")}\n</line-height></size>`;
    lastResult = { code, characters: code.length, colors: palette.length };
    if (code.length <= MAX_CHARACTERS) return lastResult;
  }

  if (lastResult) return lastResult;
  throw new Error("Pixel encoding failed.");
}

export default function GeneratorPixelPage() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.id;
  const fileInputRef = useRef(null);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [stageWidth, setStageWidth] = useState(600);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultPanelRef = useRef(null);

  const stageHeight = stageWidth * HEIGHT / WIDTH;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width;
      if (nextWidth) setStageWidth(nextWidth);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  const baseScale = imageSize.width && imageSize.height
    ? Math.max(stageWidth / imageSize.width, stageHeight / imageSize.height)
    : 1;
  const renderedWidth = imageSize.width * baseScale * zoom;
  const renderedHeight = imageSize.height * baseScale * zoom;

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const chooseFile = (nextFile) => {
    setError("");
    setResult(null);
    setCopied(false);
    if (!nextFile) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(nextFile.type)) {
      setError(t.invalidType);
      return;
    }
    if (nextFile.size <= 0 || nextFile.size > MAX_FILE_SIZE) {
      setError(t.tooLarge);
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const nextUrl = URL.createObjectURL(nextFile);
    objectUrlRef.current = nextUrl;
    setFile(nextFile);
    setImageUrl(nextUrl);
    setImageSize({ width: 0, height: 0 });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const resetCrop = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event) => {
    if (!imageUrl || busy) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    const nextX = drag.offsetX + event.clientX - drag.x;
    const nextY = drag.offsetY + event.clientY - drag.y;
    const maxX = Math.max(0, (renderedWidth - stageWidth) / 2);
    const maxY = Math.max(0, (renderedHeight - stageHeight) / 2);
    setOffset({
      x: Math.min(maxX, Math.max(-maxX, nextX)),
      y: Math.min(maxY, Math.max(-maxY, nextY)),
    });
  };

  const handlePointerEnd = () => {
    dragRef.current = null;
  };

  const makeCropCanvas = useCallback(() => {
    const image = imageRef.current;
    const stage = stageRef.current;
    if (!image || !stage || !image.naturalWidth || !image.naturalHeight) throw new Error("Image is not ready.");
    const width = stage.clientWidth;
    const height = width * HEIGHT / WIDTH;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const left = (width - drawnWidth) / 2 + offset.x;
    const top = (height - drawnHeight) / 2 + offset.y;
    const sx = Math.max(0, -left / scale);
    const sy = Math.max(0, -top / scale);
    const sw = Math.min(image.naturalWidth - sx, width / scale);
    const sh = Math.min(image.naturalHeight - sy, height / scale);
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext("2d");
    if (!context || sw <= 0 || sh <= 0) throw new Error("Unable to create crop.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, sx, sy, sw, sh, 0, 0, WIDTH, HEIGHT);
    return canvas;
  }, [zoom, offset]);

  const createPixelBio = async () => {
    if (!file || !imageRef.current?.complete) {
      setError(t.noImage);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const pixelCanvas = makeCropCanvas();
      const encoded = encodePixelCanvas(pixelCanvas);
      if (encoded.characters > MAX_CHARACTERS) {
        throw new Error(t.overLimit);
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) throw new Error(t.session);
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/df/tools-dw/generator-pixel/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        body: form,
        cache: "no-store",
      });
      const uploaded = await response.json().catch(() => ({}));
      if (!response.ok || !uploaded.success) throw new Error(uploaded.error || t.uploadError);

      setResult({ ...encoded, preview: pixelCanvas.toDataURL("image/png") });
      setCopied(false);
      setSuccessOpen(true);
      setFile(null);
      setImageUrl("");
      setImageSize({ width: 0, height: 0 });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (caught) {
      setError(caught.message || t.processError);
    } finally {
      setBusy(false);
    }
  };

  const finishSuccess = () => {
    setSuccessOpen(false);
    requestAnimationFrame(() => resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const copyCode = async () => {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = result.code;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      setCopied(success);
    }
  };

  const imageStyle = useMemo(() => ({
    width: renderedWidth,
    height: renderedHeight,
    left: `calc(50% + ${offset.x}px)`,
    top: `calc(50% + ${offset.y}px)`,
  }), [renderedWidth, renderedHeight, offset]);

  return (
    <main className="df-pixel-page">
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        className="df-pixel-header"
      />

      <div className="df-pixel-workspace">
        <Card className="df-pixel-panel">
          <div className="df-pixel-step-heading">
            <span className="df-pixel-step-number">01</span>
            <div>
              <h2>{t.stepUpload}</h2>
              <p>{t.uploadHint}</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            className="df-pixel-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              chooseFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {!file ? (
            <button className="df-pixel-dropzone" type="button" onClick={() => fileInputRef.current?.click()}>
              <span className="df-pixel-upload-icon" aria-hidden="true">↑</span>
              <strong>{t.choose}</strong>
              <span>{t.uploadHint}</span>
            </button>
          ) : (
            <div className="df-pixel-file-summary">
              <span className="df-pixel-file-icon" aria-hidden="true">▧</span>
              <span className="df-pixel-file-name">{file.name}</span>
              <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>{t.replace}</Button>
            </div>
          )}

         </Card>

        <Card className="df-pixel-panel">
          <div className="df-pixel-step-heading">
            <span className="df-pixel-step-number">02</span>
            <div>
              <h2>{t.cropTitle}</h2>
              <p>{t.cropHint}</p>
            </div>
          </div>

          <div className={["df-pixel-stage", imageUrl ? "has-image" : ""].join(" ")}>
             <div
              ref={stageRef}
              className="df-pixel-crop-area"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onLostPointerCapture={handlePointerEnd}
              role="img"
              aria-label={t.cropTitle}
            >
              {imageUrl ? (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Crop preview"
                  draggable="false"
                  style={imageStyle}
                  onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                />
              ) : <span className="df-pixel-empty-preview">{t.noPreview}</span>}
              <span className="df-pixel-crop-outline" aria-hidden="true" />
            </div>
           </div>

          <div className="df-pixel-controls">
            <label htmlFor="pixel-zoom">{t.zoom}<strong>{zoom.toFixed(1)}×</strong></label>
            <input id="pixel-zoom" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} disabled={!file || busy} />
            <Button variant="ghost" size="sm" onClick={resetCrop} disabled={!file || busy}>{t.reset}</Button>
          </div>

          {error ? <p className="df-pixel-error" role="alert">{error}</p> : null}
          <Button className="df-pixel-create-button" onClick={createPixelBio} disabled={!file || !imageSize.width || busy} loading={busy}>
            {busy ? t.processing : t.process}
          </Button>
        </Card>
      </div>

      {result ? (
        <div className="df-pixel-result-anchor" ref={resultPanelRef}>
        <Card className="df-pixel-result-panel">
          <div className="df-pixel-result-heading">
            <h2>{t.resultTitle}</h2>
            <span aria-hidden="true">✓</span>
          </div>
          <div className="df-pixel-result-preview">
            <img src={result.preview} alt={t.resultTitle} />
          </div>
          <textarea className="df-pixel-result-code" value={result.code} readOnly aria-label={t.resultTitle} />
          <Button className="df-pixel-copy-button" onClick={copyCode}>{copied ? t.copied : t.copy}</Button>
        </Card>
        </div>
      ) : null}

      <Dialog
        open={successOpen}
        onClose={finishSuccess}
        title={t.successTitle}
        description={t.successDescription}
        closeLabel={t.done}
        closeOnBackdrop={false}
        className="df-pixel-success-dialog"
        actions={<Button onClick={finishSuccess}>{t.done}</Button>}
      />
    </main>
  );
}
