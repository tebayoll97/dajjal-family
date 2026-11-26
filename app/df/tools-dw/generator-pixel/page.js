"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Button, Card, Dialog, PageHeader, Tabs, TextField, RangeSlider } from "@/app/components/ui";
import "./generator-pixel.css";

const WIDTH = 193;
const HEIGHT = 45;
const TEXT_WIDTH = 193;
const TEXT_HEIGHT = 40;
const TEXT_LIMIT = 160;
const MAX_CHARACTERS = 32000;
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const HISTORY_DB = "df-pixel-bio-history";
const HISTORY_STORE = "results";
const HISTORY_LIMIT = 3;

function openPixelHistoryDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB is unavailable."));
    const request = indexedDB.open(HISTORY_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(HISTORY_STORE)) request.result.createObjectStore(HISTORY_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readPixelHistory() {
  const db = await openPixelHistoryDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(HISTORY_STORE, "readonly").objectStore(HISTORY_STORE).getAll();
    request.onsuccess = () => {
      db.close();
      resolve((request.result || []).sort((a, b) => b.createdAt - a.createdAt).slice(0, HISTORY_LIMIT));
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function savePixelHistory(entry) {
  const db = await openPixelHistoryDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(HISTORY_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      (request.result || []).sort((a, b) => b.createdAt - a.createdAt).slice(HISTORY_LIMIT - 1).forEach((item) => store.delete(item.id));
      store.put(entry);
    };
    transaction.oncomplete = async () => {
      db.close();
      try { resolve(await readPixelHistory()); } catch (error) { reject(error); }
    };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}

async function clearPixelHistory() {
  const db = await openPixelHistoryDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    transaction.objectStore(HISTORY_STORE).clear();
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

const COPY = {
  id: {
    eyebrow: "DARKWAR SURVIVAL · COMMUNITY TOOL",
    title: "Pixel Bio Generator",
    description: "Ubah gambar atau teks menjadi kode bio pixel Darkwar Survival.",
    tabImage:"Mode Gambar",tabText:"Mode Teks",textTitle:"Tulis bio kamu",textHint:"Font pixel 5×7 · Kanvas 193 × 40 px · Maksimal 160 glyph.",textPlaceholder:"Ketik teks bio di sini…",textProcess:"Buat Pixel Bio Teks",textUnsupported:"Ada karakter yang belum didukung font pixel.",textOverflow:"Teks tidak muat di kanvas 193 × 40 px. Kurangi teks atau baris.",textLimit:"Maksimal 160 glyph.",background:"Warna background",foreground:"Warna teks",red:"Merah",green:"Hijau",blue:"Biru",preview:"Pratinjau pixel",
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
    tooLarge: "File gambar tidak dapat digunakan.",
    noImage: "Pilih gambar terlebih dahulu.",
    uploadError: "Gambar gagal diproses. Silakan coba lagi.",
    processError: "Gambar belum dapat diproses. Coba atur ulang posisi atau gunakan gambar lain.",
    noPreview: "Pratinjau gambar akan muncul di sini.",
    resultTitle: "Hasil Pixel Bio",
    overLimit: "Hasil melebihi batas 32.000 karakter. Coba gunakan gambar yang lebih sederhana.",
    detailCharacters: "Jumlah karakter",
    detailColors: "Jumlah warna",
    detailDimensions: "Dimensi",
    historyTitle: "Riwayat Generator",
    historyDescription: "Tiga hasil generator terakhir tersimpan di perangkat ini.",
    historyEmpty: "Belum ada riwayat. Hasil yang berhasil dibuat akan muncul di sini.",
    historyItem: "Pixel Bio",
    historyCopy: "Salin Kode",
    historyRestore: "Pulihkan",
    historyDelete: "Hapus Riwayat",
    historyDeleteConfirm: "Hapus semua riwayat Pixel Bio dari perangkat ini?",
  },
  en: {
    eyebrow: "DARKWAR SURVIVAL · COMMUNITY TOOL",
    title: "Pixel Bio Generator",
    description: "Turn an image or text into Darkwar Survival pixel bio code.",
    tabImage:"Image Mode",tabText:"Text Mode",textTitle:"Write your bio",textHint:"5×7 pixel font · 193 × 40 px canvas · Up to 160 glyphs.",textPlaceholder:"Type your bio text…",textProcess:"Create Text Pixel Bio",textUnsupported:"This text contains a character not supported by the pixel font.",textOverflow:"The text does not fit the 193 × 40 px canvas. Shorten the text or use fewer lines.",textLimit:"Maximum 160 glyphs.",background:"Background color",foreground:"Text color",red:"Red",green:"Green",blue:"Blue",preview:"Pixel preview",
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
    tooLarge: "This image file cannot be used.",
    noImage: "Choose an image first.",
    uploadError: "The image could not be processed. Please try again.",
    processError: "The image could not be processed. Reset the crop or try another image.",
    noPreview: "Your image preview will appear here.",
    resultTitle: "Pixel Bio Result",
    overLimit: "The result exceeds the 32,000-character limit. Try a simpler image.",
    detailCharacters: "Characters",
    detailColors: "Colors",
    detailDimensions: "Dimensions",
    historyTitle: "Generator History",
    historyDescription: "Your three latest results are saved on this device.",
    historyEmpty: "No history yet. Successfully generated results will appear here.",
    historyItem: "Pixel Bio",
    historyCopy: "Copy Code",
    historyRestore: "Restore",
    historyDelete: "Clear History",
    historyDeleteConfirm: "Delete all Pixel Bio history from this device?",
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

function encodePixelCanvas(canvas, width = WIDTH, height = HEIGHT) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable.");
  const image = context.getImageData(0, 0, width, height);
  const pixels = [];
  for (let index = 0; index < image.data.length; index += 4) {
    pixels.push([image.data[index], image.data[index + 1], image.data[index + 2]]);
  }

  const candidates = [64, 48, 32, 24, 16, 12, 8, 6, 4, 3, 2];

  for (const colorCount of candidates) {
    const palette = medianCutPalette(pixels, colorCount);
    const rows = [];
    for (let y = 0; y < height; y += 1) {
      let row = "";
      let activeTag = "";
      let runLength = 0;
      for (let x = 0; x < width; x += 1) {
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
    const result = { code, characters: code.length, colors: palette.length };
    if (result.characters <= MAX_CHARACTERS) return result;
  }

  throw new Error("PIXEL_BIO_OVER_LIMIT");
}

const FONT_5X7 = {
A:["01110","10001","10001","11111","10001","10001","10001"],B:["11110","10001","10001","11110","10001","10001","11110"],C:["01111","10000","10000","10000","10000","10000","01111"],D:["11110","10001","10001","10001","10001","10001","11110"],E:["11111","10000","10000","11110","10000","10000","11111"],F:["11111","10000","10000","11110","10000","10000","10000"],G:["01111","10000","10000","10111","10001","10001","01111"],H:["10001","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],J:["00111","00010","00010","00010","10010","10010","01100"],K:["10001","10010","10100","11000","10100","10010","10001"],L:["10000","10000","10000","10000","10000","10000","11111"],M:["10001","11011","10101","10101","10001","10001","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],O:["01110","10001","10001","10001","10001","10001","01110"],P:["11110","10001","10001","11110","10000","10000","10000"],Q:["01110","10001","10001","10001","10101","10010","01101"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],V:["10001","10001","10001","10001","10001","01010","00100"],W:["10001","10001","10001","10101","10101","10101","01010"],X:["10001","10001","01010","00100","01010","10001","10001"],Y:["10001","10001","01010","00100","00100","00100","00100"],Z:["11111","00001","00010","00100","01000","10000","11111"],
"0":["01110","10001","10011","10101","11001","10001","01110"],"1":["00100","01100","00100","00100","00100","00100","01110"],"2":["01110","10001","00001","00010","00100","01000","11111"],"3":["11110","00001","00001","01110","00001","00001","11110"],"4":["00010","00110","01010","10010","11111","00010","00010"],"5":["11111","10000","10000","11110","00001","00001","11110"],"6":["01110","10000","10000","11110","10001","10001","01110"],"7":["11111","00001","00010","00100","01000","01000","01000"],"8":["01110","10001","10001","01110","10001","10001","01110"],"9":["01110","10001","10001","01111","00001","00001","01110"],
" ":["00000","00000","00000","00000","00000","00000","00000"],".":["00000","00000","00000","00000","00000","01100","01100"],",":["00000","00000","00000","00000","00110","00110","00100"],"!":["00100","00100","00100","00100","00100","00000","00100"],"?":["01110","10001","00001","00010","00100","00000","00100"],":":["00000","00100","00100","00000","00100","00100","00000"],";":["00000","00100","00100","00000","00100","00100","01000"],"-":["00000","00000","00000","11111","00000","00000","00000"],"_":["00000","00000","00000","00000","00000","00000","11111"],"+":["00000","00100","00100","11111","00100","00100","00000"],"=":["00000","11111","00000","11111","00000","00000","00000"],"/":["00001","00010","00010","00100","01000","01000","10000"],"(":["00010","00100","01000","01000","01000","00100","00010"],")":["01000","00100","00010","00010","00010","00100","01000"],"'":["00100","00100","00000","00000","00000","00000","00000"],"\"":["01010","01010","00000","00000","00000","00000","00000"],"#":["01010","11111","01010","01010","11111","01010","00000"],"@":["01110","10001","10111","10101","10111","10000","01111"],"*":["00000","10101","01110","11111","01110","10101","00000"],"$":["00100","01111","10100","01110","00101","11110","00100"],"%":["11001","11010","00100","01000","10110","00110","00000"],"&":["01100","10010","10100","01000","10101","10010","01101"]
};
function normalizePixelGlyph(char) {
  const special={"ß":"SS","Æ":"AE","æ":"ae","Œ":"OE","œ":"oe","Ø":"O","ø":"o","Đ":"D","đ":"d","Ł":"L","ł":"l","Þ":"P","þ":"p","ı":"i"};
  return special[char] || char.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}
function buildTextPixelCanvas(text, background, foreground) {
  if (typeof Intl.Segmenter !== "function") return {error:"unsupported",canvas:null,count:0};
  const segments=Array.from(new Intl.Segmenter(undefined,{granularity:"grapheme"}).segment(text),x=>x.segment);
  const expanded=segments.map(normalizePixelGlyph).flatMap(x=>Array.from(x));
  const unsupported=expanded.find(ch=>!FONT_5X7[ch.toUpperCase()] && ch!=="\n" && ch!=="\r" && ch!=="\t");
  if(unsupported)return {error:"unsupported",canvas:null,count:expanded.length};
  if(expanded.length>TEXT_LIMIT)return {error:"limit",canvas:null,count:expanded.length};
  const rows=[];let row=[];let width=0;
  for(const ch of expanded){if(ch==="\r")continue;if(ch==="\n"){rows.push(row);row=[];width=0;continue;}const glyph=FONT_5X7[ch.toUpperCase()];if(row.length&&width+6>TEXT_WIDTH){rows.push(row);row=[];width=0;}row.push(glyph);width+=6;}
  if(row.length||!rows.length)rows.push(row);
  if(rows.length>5)return {error:"overflow",canvas:null,count:expanded.length};
  const canvas=document.createElement("canvas");canvas.width=TEXT_WIDTH;canvas.height=TEXT_HEIGHT;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)return {error:"canvas",canvas:null,count:expanded.length};
  ctx.fillStyle=background;ctx.fillRect(0,0,TEXT_WIDTH,TEXT_HEIGHT);ctx.fillStyle=foreground;
  rows.forEach((items,ri)=>{let x=0;items.forEach(glyph=>{glyph.forEach((bits,y)=>{for(let col=0;col<5;col++)if(bits[col]==="1")ctx.fillRect(x+col,ri*8+y,1,1);});x+=6;});});
  return {error:"",canvas,count:expanded.length};
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
  const [history, setHistory] = useState([]);
  const [copiedHistoryId, setCopiedHistoryId] = useState("");
  const resultPanelRef = useRef(null);
  const textCanvasRef = useRef(null);
  const [mode,setMode]=useState("image");
  const [bioText,setBioText]=useState("DAJJAL FAMILY");
  const [backgroundRgb,setBackgroundRgb]=useState({r:0,g:0,b:0});
  const [foregroundRgb,setForegroundRgb]=useState({r:255,g:255,b:255});
  const [textValidation,setTextValidation]=useState({error:"",count:14});

  useEffect(() => {
    let active = true;
    readPixelHistory().then((items) => { if (active) setHistory(items); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const stageHeight = stageWidth * HEIGHT / WIDTH;
  const backgroundHex="#"+[backgroundRgb.r,backgroundRgb.g,backgroundRgb.b].map(v=>v.toString(16).padStart(2,"0")).join("");
  const foregroundHex="#"+[foregroundRgb.r,foregroundRgb.g,foregroundRgb.b].map(v=>v.toString(16).padStart(2,"0")).join("");
  useEffect(()=>{const rendered=buildTextPixelCanvas(bioText,backgroundHex,foregroundHex);setTextValidation({error:rendered.error,count:rendered.count});const target=textCanvasRef.current;if(!target)return;const ctx=target.getContext("2d");ctx.clearRect(0,0,TEXT_WIDTH,TEXT_HEIGHT);if(rendered.canvas)ctx.drawImage(rendered.canvas,0,0);else{ctx.fillStyle=backgroundHex;ctx.fillRect(0,0,TEXT_WIDTH,TEXT_HEIGHT);}},[bioText,backgroundHex,foregroundHex]);

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
      let encoded;
      try {
        encoded = encodePixelCanvas(pixelCanvas);
      } catch (encodingError) {
        if (encodingError.message === "PIXEL_BIO_OVER_LIMIT") throw new Error(t.overLimit);
        throw encodingError;
      }
      if (encoded.characters > MAX_CHARACTERS) throw new Error(t.overLimit);

      const historyEntry = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: Date.now(),
        ...encoded,
        mode: "image", width: WIDTH, height: HEIGHT,
        preview: pixelCanvas.toDataURL("image/png"),
      };
      setResult(historyEntry);
      setCopied(false);
      setCopiedHistoryId("");
      try {
        setHistory(await savePixelHistory(historyEntry));
      } catch (historyError) {
        console.warn("Pixel Bio history could not be saved:", historyError);
      }
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

  const createTextPixelBio = async () => {
    const rendered=buildTextPixelCanvas(bioText,backgroundHex,foregroundHex);
    if(rendered.error){setError(rendered.error==="unsupported"?t.textUnsupported:rendered.error==="limit"?t.textLimit:t.textOverflow);return;}
    setBusy(true);setError("");
    try{
      const encoded=encodePixelCanvas(rendered.canvas,TEXT_WIDTH,TEXT_HEIGHT);
      if(encoded.characters>MAX_CHARACTERS)throw new Error(t.overLimit);
      const entry={id:typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():String(Date.now()),createdAt:Date.now(),...encoded,mode:"text",text:bioText,background:backgroundHex,foreground:foregroundHex,width:TEXT_WIDTH,height:TEXT_HEIGHT,preview:rendered.canvas.toDataURL("image/png")};
      setResult(entry);setCopied(false);setCopiedHistoryId("");
      try{setHistory(await savePixelHistory(entry));}catch(historyError){console.warn("Pixel Bio history could not be saved:",historyError);}
      setSuccessOpen(true);
    }catch(caught){setError(caught.message||t.processError);}finally{setBusy(false);}
  };

  const finishSuccess = () => {
    setSuccessOpen(false);
    requestAnimationFrame(() => resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const copyText = async (code) => {
    if (!code) return false;
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      return success;
    }
  };

  const copyCode = async () => {
    if (!result?.code) return;
    setCopied(await copyText(result.code));
  };

  const copyHistoryCode = async (entry) => {
    setCopiedHistoryId(await copyText(entry.code) ? entry.id : "");
  };

  const restoreHistory = (entry) => {
    setMode(entry.mode === "text" ? "text" : "image");
    setResult(entry);
    setCopied(false);
    setCopiedHistoryId("");
    requestAnimationFrame(() => resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const deleteHistory = async () => {
    if (!window.confirm(t.historyDeleteConfirm)) return;
    try {
      await clearPixelHistory();
      setHistory([]);
      setCopiedHistoryId("");
    } catch (historyError) {
      console.warn("Pixel Bio history could not be cleared:", historyError);
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

      <Tabs value={mode} onChange={(next)=>{setMode(next);setError("");}} ariaLabel={t.title} tabs={[{value:"image",label:t.tabImage,content:null},{value:"text",label:t.tabText,content:null}]} />
      {mode === "image" ? <div className="df-pixel-workspace">
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
      </div> : (
        <Card className="df-pixel-text-panel">
          <div className="df-pixel-step-heading"><span className="df-pixel-step-number">01</span><div><h2>{t.textTitle}</h2><p>{t.textHint}</p></div></div>
          <TextField as="textarea" label={t.textTitle} value={bioText} onChange={(event)=>setBioText(event.target.value)} placeholder={t.textPlaceholder} rows={3} helpText={t.textHint} />
          <div className="df-pixel-text-preview"><div className="df-pixel-text-preview-heading"><strong>{t.preview}</strong><span>193 × 40 px</span></div><canvas ref={textCanvasRef} width={TEXT_WIDTH} height={TEXT_HEIGHT} aria-label={t.preview}/></div>
          <div className="df-pixel-color-grid">
            <section className="df-pixel-color-group"><h3>{t.background}</h3>{["r","g","b"].map(channel=><RangeSlider key={"bg-"+channel} label={t[channel==="r"?"red":channel==="g"?"green":"blue"]} min={0} max={255} value={backgroundRgb[channel]} onChange={value=>setBackgroundRgb(current=>({...current,[channel]:value}))}/>)}<output className="df-pixel-color-value">{backgroundHex.toUpperCase()}</output></section>
            <section className="df-pixel-color-group"><h3>{t.foreground}</h3>{["r","g","b"].map(channel=><RangeSlider key={"fg-"+channel} label={t[channel==="r"?"red":channel==="g"?"green":"blue"]} min={0} max={255} value={foregroundRgb[channel]} onChange={value=>setForegroundRgb(current=>({...current,[channel]:value}))}/>}<output className="df-pixel-color-value">{foregroundHex.toUpperCase()}</output></section>
          </div>
          <div className="df-pixel-text-validation" aria-live="polite"><span>{textValidation.count} / {TEXT_LIMIT}</span>{textValidation.error?<span role="alert">{textValidation.error==="unsupported"?t.textUnsupported:textValidation.error==="limit"?t.textLimit:t.textOverflow}</span>:null}</div>
          {error?<p className="df-pixel-error" role="alert">{error}</p>:null}
          <Button className="df-pixel-create-button" onClick={createTextPixelBio} disabled={busy||Boolean(textValidation.error)||!bioText.length} loading={busy}>{busy?t.processing:t.textProcess}</Button>
        </Card>
      )}

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
          <div className="df-pixel-result-details" aria-label={t.resultTitle}>
            <div className="df-pixel-result-detail">
              <span>{t.detailCharacters}</span>
              <strong>{new Intl.NumberFormat(language === "en" ? "en-US" : "id-ID").format(result.characters)} / {new Intl.NumberFormat(language === "en" ? "en-US" : "id-ID").format(MAX_CHARACTERS)}</strong>
            </div>
            <div className="df-pixel-result-detail">
              <span>{t.detailDimensions}</span><strong>{result.width || WIDTH} × {result.height || HEIGHT} px</strong>
            </div>
            <div className="df-pixel-result-detail">
              <span>{t.detailColors}</span>
              <strong>{result.colors}</strong>
            </div>
          </div>
          <Button className="df-pixel-copy-button" onClick={copyCode}>{copied ? t.copied : t.copy}</Button>
        </Card>
        </div>
      ) : null}

      <Card className="df-pixel-history-panel">
        <div className="df-pixel-history-heading">
          <div>
            <h2>{t.historyTitle}</h2>
            <p>{t.historyDescription}</p>
          </div>
          {history.length > 0 ? <Button variant="ghost" size="sm" onClick={deleteHistory}>{t.historyDelete}</Button> : null}
        </div>
        {history.length === 0 ? (
          <p className="df-pixel-history-empty">{t.historyEmpty}</p>
        ) : (
          <div className="df-pixel-history-list">
            {history.map((entry, index) => (
              <article className="df-pixel-history-item" key={entry.id}>
                <div className={`df-pixel-history-thumb ${entry.mode === "text" ? "df-pixel-history-thumb--text" : ""}`}>
                  <img src={entry.preview} alt={`${t.historyItem} ${history.length - index}`} />
                </div>
                <div className="df-pixel-history-meta">
                  <strong>{t.historyItem} #{history.length - index} · {entry.mode === "text" ? t.tabText : t.tabImage}</strong>
                  <span>{new Intl.NumberFormat(language === "en" ? "en-US" : "id-ID").format(entry.characters)} {language === "en" ? "characters" : "karakter"} · {entry.colors} {language === "en" ? "colors" : "warna"}</span>
                  <small>{new Intl.DateTimeFormat(language === "en" ? "en-US" : "id-ID", { dateStyle: "medium", timeStyle: "short" }).format(entry.createdAt)}</small>
                </div>
                <div className="df-pixel-history-actions">
                  <Button size="sm" variant="secondary" onClick={() => copyHistoryCode(entry)}>{copiedHistoryId === entry.id ? t.copied : t.historyCopy}</Button>
                  <Button size="sm" variant="ghost" onClick={() => restoreHistory(entry)}>{t.historyRestore}</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

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
