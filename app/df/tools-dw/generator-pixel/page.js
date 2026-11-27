"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Button, Card, Dialog, ConfirmDialog, PageHeader, Tabs, TextField, RangeSlider, SvgIcon } from "@/app/components/ui";
import "./generator-pixel.css";

const WIDTH = 193;
const HEIGHT = 45;
const TEXT_WIDTH = 193;
const TEXT_HEIGHT = 40;
const TEXT_LIMIT = 30;
const MAX_CHARACTERS = 32000;
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const HISTORY_DB = "df-pixel-bio-history";
const HISTORY_STORE = "results";
const HISTORY_LIMIT = 20;
const HISTORY_PAGE_SIZE = 5;
const TEXT_THEMES=[{id:"arctic",name:"Arctic",background:"#10182b",foreground:"#a5eaff",ornament:"❄"},{id:"crimson",name:"Crimson",background:"#210d19",foreground:"#ff526e",ornament:"✦"},{id:"nebula",name:"Nebula",background:"#130d2b",foreground:"#d8a5ff",ornament:"☾"},{id:"emerald",name:"Emerald",background:"#09201d",foreground:"#75f2bf",ornament:"❧"},{id:"solar",name:"Solar",background:"#2a1b08",foreground:"#ffd166",ornament:"☼"},{id:"aurora",name:"Aurora",background:"#260f27",foreground:"#ff9de2",ornament:"✧"},{id:"ocean",name:"Ocean",background:"#071c2b",foreground:"#62ddff",ornament:"〰"},{id:"inferno",name:"Inferno",background:"#2b1008",foreground:"#ff9b54",ornament:"♨"},{id:"toxic",name:"Toxic",background:"#142008",foreground:"#c7ff54",ornament:"☣"},{id:"monolith",name:"Monolith",background:"#17191e",foreground:"#e5e7eb",ornament:"✥"}];

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

async function deletePixelHistoryEntry(id) {
  const db = await openPixelHistoryDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    transaction.objectStore(HISTORY_STORE).delete(id);
    transaction.oncomplete = async () => {
      db.close();
      try { resolve(await readPixelHistory()); } catch (error) { reject(error); }
    };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}

const COPY = {
  id: {
    eyebrow: "DARKWAR SURVIVAL · COMMUNITY TOOL",
    title: "Pixel Bio Generator",
    description: "Ubah gambar atau teks menjadi kode bio pixel Darkwar Survival.",
    tabImage:"Mode Gambar",tabText:"Mode Teks",tabIntelligence:"Intelligence Mode",tabOptical:"Optical Art",opticalTitle:"Holographic Depth",opticalHint:"Buat ilusi kedalaman dari tiga lapisan warna menggunakan tag bio yang sudah teruji.",opticalIdentity:"Teks identitas",opticalPrimary:"Warna inti",opticalEchoA:"Warna bayangan 1",opticalEchoB:"Warna bayangan 2",opticalPreview:"Pratinjau komposisi",opticalCode:"Kode bio Darkwar",opticalCopy:"Salin kode bio",opticalCopied:"Kode berhasil disalin!",opticalEmpty:"Masukkan teks untuk melihat pratinjau.",focusTitle:"Prioritas visual",focusHint:"Atur titik fokus jika perlu. Pixel Vision juga memprioritaskan wajah dan objek yang terdeteksi.",focusX:"Fokus horizontal",focusY:"Fokus vertikal",scanTitle:"Pixel Vision Scan",scanHint:"Analisis wajah, landmark, manusia, hewan, dan objek langsung di perangkat.",scanAction:"Pindai gambar",scanning:"Memindai di perangkat…",scanReady:"Analisis lokal selesai",scanFaces:"Wajah",scanObjects:"Objek",detailDetected:"Terdeteksi",scanLoading:"Memuat model vision lokal…",scanAnalyzing:"Menganalisis gambar…",scanFailure:"Model vision tidak dapat dimuat. Periksa koneksi lalu coba lagi.",intelligenceProcess:"Rekonstruksi Pixel Bio",textTitle:"Tulis bio kamu",textHint:"Font pixel 5×7 · Maksimal 30 glyph.",textPlaceholder:"Ketik teks bio di sini…",textProcess:"Buat Pixel Bio Teks",textUnsupported:"Ada karakter yang belum didukung font pixel.",textOverflow:"Teks tidak muat pada ukuran font ini. Kurangi teks atau pilih ukuran 1×.",textLimit:"Maksimal 30 glyph.",background:"Warna background",foreground:"Warna teks",red:"Merah",green:"Hijau",blue:"Biru",preview:"Pratinjau pixel",
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
    historyTitle: "Riwayat Generator",
    historyDescription: "Hingga 20 hasil tersimpan di perangkat ini.",
    historyEmpty: "Belum ada riwayat. Hasil yang berhasil dibuat akan muncul di sini.",
    historyItem: "Pixel Bio",
    historyCopy: "Salin Kode",
    historyRestore: "Pulihkan",
    historyDelete: "Hapus",
    historyDeleteTitle: "Hapus riwayat ini?",
    historyDeleteConfirm: "Riwayat Pixel Bio yang dipilih akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.",
    historyDeleteCancel: "Batal",
    historyDeleteConfirmAction: "Ya, hapus",
  },
  en: {
    eyebrow: "DARKWAR SURVIVAL · COMMUNITY TOOL",
    title: "Pixel Bio Generator",
    description: "Turn an image or text into Darkwar Survival pixel bio code.",
    tabImage:"Image Mode",tabText:"Text Mode",tabIntelligence:"Intelligence Mode",tabOptical:"Optical Art",opticalTitle:"Holographic Depth",opticalHint:"Create a depth illusion from three color layers using bio tags already tested in-game.",opticalIdentity:"Identity text",opticalPrimary:"Core color",opticalEchoA:"Shadow color 1",opticalEchoB:"Shadow color 2",opticalPreview:"Composition preview",opticalCode:"Darkwar bio code",opticalCopy:"Copy bio code",opticalCopied:"Code copied successfully!",opticalEmpty:"Enter text to see the preview.",focusTitle:"Visual priority",focusHint:"Adjust the focus point if needed. Pixel Vision also prioritizes detected faces and objects.",focusX:"Horizontal focus",focusY:"Vertical focus",scanTitle:"Pixel Vision Scan",scanHint:"Analyze faces, landmarks, people, animals, and objects directly on this device.",scanAction:"Scan image",scanning:"Scanning on device…",scanReady:"Local analysis complete",scanFaces:"Faces",scanObjects:"Objects",detailDetected:"Detected",scanLoading:"Loading local vision models…",scanAnalyzing:"Analyzing image…",scanFailure:"Vision models could not be loaded. Check your connection and try again.",intelligenceProcess:"Reconstruct Pixel Bio",textTitle:"Write your bio",textHint:"5×7 pixel font · Up to 30 glyphs.",textPlaceholder:"Type your bio text…",textProcess:"Create Text Pixel Bio",textUnsupported:"This text contains a character not supported by the pixel font.",textOverflow:"The text does not fit at this font size. Shorten it or choose 1× size.",textLimit:"Maximum 30 glyphs.",background:"Background color",foreground:"Text color",red:"Red",green:"Green",blue:"Blue",preview:"Pixel preview",
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
    historyTitle: "Generator History",
    historyDescription: "Up to 20 results are saved on this device.",
    historyEmpty: "No history yet. Successfully generated results will appear here.",
    historyItem: "Pixel Bio",
    historyCopy: "Copy Code",
    historyRestore: "Restore",
    historyDelete: "Delete",
    historyDeleteTitle: "Delete this history?",
    historyDeleteConfirm: "The selected Pixel Bio history will be deleted from this device. This action cannot be undone.",
    historyDeleteCancel: "Cancel",
    historyDeleteConfirmAction: "Yes, delete",
  },
};

function colorTag(rgb) {
  const short = rgb.map((channel) => Math.max(0, Math.min(15, Math.round(channel / 17))).toString(16)).join("");
  return `<#${short}>`;
}

function compressOpticalHex(hex) {
  return `#${[1, 3, 5].map((index) => Math.max(0, Math.min(15, Math.round(parseInt(hex.slice(index, index + 2), 16) / 17))).toString(16)).join("").toUpperCase()}`;
}

function buildOpticalBioCode(text, colors) {
  const safeText = text.replace(/[<>]/g, "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  if (!safeText) return "";
  return `<color=${compressOpticalHex(colors.echoA)}><voffset=2>${safeText}\n<color=${compressOpticalHex(colors.echoB)}><voffset=-2>${safeText}\n<color=${compressOpticalHex(colors.core)}><voffset=0>${safeText}`;
}

function prepareIntelligenceCanvas(source, focusX = 0.5, focusY = 0.5, vision = null) {
  const width = source.width;
  const height = source.height;
  const input = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, width, height);
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outputContext = outputCanvas.getContext("2d", { willReadFrequently: true });
  const output = outputContext.createImageData(width, height);
  const importanceMap = new Float32Array(width * height);
  const radiusX = Math.max(18, width * 0.28);
  const radiusY = Math.max(10, height * 0.48);
  const luminance = (index) => input.data[index] * 0.2126 + input.data[index + 1] * 0.7152 + input.data[index + 2] * 0.0722;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const offset = index * 4;
      const left = (y * width + Math.max(0, x - 1)) * 4;
      const right = (y * width + Math.min(width - 1, x + 1)) * 4;
      const up = (Math.max(0, y - 1) * width + x) * 4;
      const down = (Math.min(height - 1, y + 1) * width + x) * 4;
      const edge = Math.min(1, (Math.abs(luminance(left) - luminance(right)) + Math.abs(luminance(up) - luminance(down))) / 180);
      const dx = (x - focusX * (width - 1)) / radiusX;
      const dy = (y - focusY * (height - 1)) / radiusY;
      const focus = Math.exp(-2.2 * (dx * dx + dy * dy));
      const nx = x / Math.max(1, width - 1);
      const ny = y / Math.max(1, height - 1);
      let semantic = 0;
      (vision?.faces || []).forEach((face) => {
        const box = face.box;
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const rx = Math.max(0.035, box.width * 0.72);
        const ry = Math.max(0.045, box.height * 0.72);
        const distance = ((nx - cx) / rx) ** 2 + ((ny - cy) / ry) ** 2;
        semantic = Math.max(semantic, Math.exp(-2.4 * distance));
        Object.values(face.landmarks || {}).forEach((point) => {
          if (!point) return;
          const landmarkDistance = ((nx - point.x) ** 2 + (ny - point.y) ** 2) / 0.0018;
          semantic = Math.max(semantic, Math.exp(-landmarkDistance));
        });
      });
      (vision?.objects || []).forEach((object) => {
        const box = object.box;
        if (!box) return;
        const cx = (box.x + box.width / 2) / (vision.width || width);
        const cy = (box.y + box.height / 2) / (vision.height || height);
        const rw = Math.max(0.04, box.width / (vision.width || width) * 0.68);
        const rh = Math.max(0.05, box.height / (vision.height || height) * 0.68);
        const distance = ((nx - cx) / rw) ** 2 + ((ny - cy) / rh) ** 2;
        semantic = Math.max(semantic, Math.exp(-2.1 * distance) * Math.max(0.35, object.score));
      });
      const importance = Math.max(0.12, Math.min(1, focus * 0.48 + semantic * 0.62 + edge * 0.3));
      importanceMap[index] = importance;

      let averageR = 0, averageG = 0, averageB = 0, samples = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          const nx = Math.max(0, Math.min(width - 1, x + ox));
          const ny = Math.max(0, Math.min(height - 1, y + oy));
          const neighbor = (ny * width + nx) * 4;
          averageR += input.data[neighbor]; averageG += input.data[neighbor + 1]; averageB += input.data[neighbor + 2]; samples += 1;
        }
      }
      const blend = (1 - importance) * 0.48;
      output.data[offset] = Math.round(input.data[offset] * (1 - blend) + (averageR / samples) * blend);
      output.data[offset + 1] = Math.round(input.data[offset + 1] * (1 - blend) + (averageG / samples) * blend);
      output.data[offset + 2] = Math.round(input.data[offset + 2] * (1 - blend) + (averageB / samples) * blend);
      output.data[offset + 3] = input.data[offset + 3];
    }
  }
  outputContext.putImageData(output, 0, 0);
  return { canvas: outputCanvas, importanceMap };
}

function medianCutPalette(pixels, requestedColors, importanceMap = null) {
  const initial = [];
  pixels.forEach((pixel, index) => {
    const weight = importanceMap ? 1 + Math.round(Math.max(0, Math.min(1, importanceMap[index])) * 3) : 1;
    for (let copy = 0; copy < weight; copy += 1) initial.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
  });
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

function encodePixelCanvas(canvas, width = WIDTH, height = HEIGHT, options = {}) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable.");
  const image = context.getImageData(0, 0, width, height);
  const pixels = [];
  for (let index = 0; index < image.data.length; index += 4) {
    pixels.push([image.data[index], image.data[index + 1], image.data[index + 2]]);
  }

  const candidates = [64, 48, 32, 24, 16, 12, 8, 6, 4, 3, 2];

  for (const colorCount of candidates) {
    const palette = medianCutPalette(pixels, colorCount, options.importanceMap || null);
    const rows = [];
    for (let y = 0; y < height; y += 1) {
      let row = "";
      let activeTag = "";
      let runLength = 0;
      for (let x = 0; x < width; x += 1) {
        const pixel = pixels[y * width + x];
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
function buildTextPixelCanvas(text, background, foreground, fontStyle = "Classic", scale = 1, ornament = "") {
  if (text.length > 1024) return { error: "limit", canvas: null, count: text.length };
  const segments = typeof Intl.Segmenter === "function"
    ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), item => item.segment)
    : Array.from(text);
  const expanded = segments.map(normalizePixelGlyph).flatMap(value => Array.from(value === "\t" ? "    " : value));
  const normalized = expanded.join("").replace(/\r\n?/g, "\n");
  const chars = Array.from(normalized);
  const unsupported = chars.find(ch => !FONT_5X7[ch.toUpperCase()] && ch !== "\n" && ch !== "\t");
  if (unsupported) return { error: "unsupported", canvas: null, count: chars.length };
  if (chars.length > TEXT_LIMIT) return { error: "limit", canvas: null, count: chars.length };
  const rows = []; let row = []; let width = 0; const cell = 6 * scale;
  for (const ch of chars) {
    if (ch === "\n") { rows.push(row); row = []; width = 0; continue; }
    const glyph = FONT_5X7[ch.toUpperCase()];
    if (row.length && width + cell > TEXT_WIDTH) { rows.push(row); row = []; width = 0; }
    row.push(glyph); width += cell;
  }
  if (row.length || !rows.length) rows.push(row);
  const advance = 6 * scale;
  const widths = rows.map(items => items.length * advance);
  const totalHeight = rows.length * 8 * scale;
  if (rows.length > 5 || totalHeight > TEXT_HEIGHT || Math.max(0, ...widths) > TEXT_WIDTH) return { error: "overflow", canvas: null, count: chars.length };
  const canvas = document.createElement("canvas"); canvas.width = TEXT_WIDTH; canvas.height = TEXT_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { error: "canvas", canvas: null, count: chars.length };
  ctx.fillStyle = background; ctx.fillRect(0, 0, TEXT_WIDTH, TEXT_HEIGHT);
  if (ornament) {
    ctx.save();
    ctx.fillStyle = foreground;
    ctx.font = '10px "Noto Serif Symbols", "Segoe UI Symbol", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ornament, 7, 7);
    ctx.fillText(ornament, TEXT_WIDTH - 7, 7);
    ctx.fillText(ornament, 7, TEXT_HEIGHT - 7);
    ctx.fillText(ornament, TEXT_WIDTH - 7, TEXT_HEIGHT - 7);
    ctx.restore();
  }
  const bold = ["Pixel Bold", "Military", "Gothic"].includes(fontStyle);
  const italic = ["Cyber", "Gothic"].includes(fontStyle);
  const shadow = fontStyle === "Arcade";
  rows.forEach((items, ri) => {
    let x = Math.floor((TEXT_WIDTH - widths[ri]) / 2);
    items.forEach(glyph => {
      glyph.forEach((bits, y) => {
        for (let col = 0; col < 5; col++) if (bits[col] === "1") {
          const px = x + col * scale + (italic ? Math.max(0, 2 - Math.floor(y / 2)) : 0);
          const py = Math.floor((TEXT_HEIGHT - totalHeight) / 2) + ri * 8 * scale + y * scale;
          if (shadow) { ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(px + scale, py + scale, scale, scale); }
          ctx.fillStyle = foreground; ctx.fillRect(px, py, scale, scale);
          if (bold) ctx.fillRect(px + scale, py, scale, scale);
        }
      });
      x += advance;
    });
  });
  return { error: "", canvas, count: chars.length };
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
  const [historyDeleteTarget, setHistoryDeleteTarget] = useState(null);
  const [historyDeleteBusy, setHistoryDeleteBusy] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState("");
  const resultPanelRef = useRef(null);
  const textCanvasRef = useRef(null);
  const [mode,setMode]=useState("image");
  const [bioText,setBioText]=useState("DAJJAL FAMILY");
  const [backgroundRgb,setBackgroundRgb]=useState({r:0,g:0,b:0});
  const [foregroundRgb,setForegroundRgb]=useState({r:255,g:255,b:255});
  const [textValidation,setTextValidation]=useState({error:"",count:14});
  const [fontStyle,setFontStyle]=useState("Classic");
  const [fontScale,setFontScale]=useState(1);
  const [colorSystem,setColorSystem]=useState("rgb");
  const [themeId,setThemeId]=useState("arctic");
  const [historyPage,setHistoryPage]=useState(1);
  const [focusX,setFocusX]=useState(0.5);
  const [focusY,setFocusY]=useState(0.5);
  const [opticalText,setOpticalText]=useState("DAJJAL FAMILY");
  const [opticalColors,setOpticalColors]=useState({core:"#FFFFFF",echoA:"#FF3333",echoB:"#33FFFF"});
  const [opticalCopied,setOpticalCopied]=useState(false);
  const visionWorkerRef = useRef(null);
  const visionRequestRef = useRef(0);
  const [visionAnalysis,setVisionAnalysis] = useState(null);
  const [visionStatus,setVisionStatus] = useState("idle");
  const [visionProgress,setVisionProgress] = useState("");

  useEffect(() => {
    let active = true;
    readPixelHistory().then((items) => { if (active) setHistory(items); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const stageHeight = stageWidth * HEIGHT / WIDTH;
  const activeTheme=TEXT_THEMES.find(theme=>theme.id===themeId)||TEXT_THEMES[0];
  const backgroundHex=colorSystem==="theme"?activeTheme.background:"#"+[backgroundRgb.r,backgroundRgb.g,backgroundRgb.b].map(v=>(Math.round(v/17)*17).toString(16).padStart(2,"0")).join("");
  const foregroundHex=colorSystem==="theme"?activeTheme.foreground:"#"+[foregroundRgb.r,foregroundRgb.g,foregroundRgb.b].map(v=>(Math.round(v/17)*17).toString(16).padStart(2,"0")).join("");
  const opticalCode=useMemo(()=>buildOpticalBioCode(opticalText,opticalColors),[opticalText,opticalColors]);
  useEffect(()=>{const rendered=buildTextPixelCanvas(bioText,backgroundHex,foregroundHex,fontStyle,fontScale,activeTheme.ornament);setTextValidation({error:rendered.error,count:rendered.count});const target=textCanvasRef.current;if(!target)return;const ctx=target.getContext("2d");ctx.clearRect(0,0,TEXT_WIDTH,TEXT_HEIGHT);if(rendered.canvas)ctx.drawImage(rendered.canvas,0,0);else{ctx.fillStyle=backgroundHex;ctx.fillRect(0,0,TEXT_WIDTH,TEXT_HEIGHT);}},[bioText,backgroundHex,foregroundHex,fontStyle,fontScale,activeTheme.ornament]);

  useEffect(() => {
    setVisionAnalysis(null);
    setVisionStatus("idle");
    setVisionProgress("");
  }, [zoom, offset]);

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
    visionWorkerRef.current?.terminate();
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

  const makeCropCanvas = useCallback((resolutionScale = 1) => {
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
    canvas.width = WIDTH * resolutionScale;
    canvas.height = HEIGHT * resolutionScale;
    const context = canvas.getContext("2d");
    if (!context || sw <= 0 || sh <= 0) throw new Error("Unable to create crop.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
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
    const rendered=buildTextPixelCanvas(bioText,backgroundHex,foregroundHex,fontStyle,fontScale,activeTheme.ornament);
    if(rendered.error){setError(rendered.error==="unsupported"?t.textUnsupported:rendered.error==="limit"?t.textLimit:t.textOverflow);return;}
    setBusy(true);setError("");
    try{
      const encoded=encodePixelCanvas(rendered.canvas,TEXT_WIDTH,TEXT_HEIGHT);
      if(encoded.characters>MAX_CHARACTERS)throw new Error(t.overLimit);
      const entry={id:typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():String(Date.now()),createdAt:Date.now(),...encoded,mode:"text",text:bioText,background:backgroundHex,foreground:foregroundHex,fontStyle,fontScale,colorSystem,themeId,width:TEXT_WIDTH,height:TEXT_HEIGHT,preview:rendered.canvas.toDataURL("image/png")};
      setResult(entry);setCopied(false);setCopiedHistoryId("");
      try{setHistory(await savePixelHistory(entry));}catch(historyError){console.warn("Pixel Bio history could not be saved:",historyError);}
      setSuccessOpen(true);
    }catch(caught){setError(caught.message||t.processError);}finally{setBusy(false);}
  };

  const analyzeVisionCanvas = useCallback(async (canvas) => {
    if (typeof Worker === "undefined" || typeof createImageBitmap !== "function") throw new Error(t.scanFailure);
    let worker = visionWorkerRef.current;
    if (!worker) {
      worker = new Worker(new URL("./pixel-vision.worker.js", import.meta.url), { type: "module" });
      visionWorkerRef.current = worker;
    }
    const image = await createImageBitmap(canvas);
    const id = ++visionRequestRef.current;
    setVisionStatus("loading");
    setVisionProgress(t.scanLoading);
    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        const message = event.data || {};
        if (message.id !== id) return;
        if (message.type === "progress") { setVisionProgress(message.detail?.stage === "analyzing" ? t.scanAnalyzing : t.scanLoading); return; }
        if (message.type === "error") { setVisionStatus("error"); setVisionProgress(""); reject(new Error(message.error || t.scanFailure)); return; }
        if (message.type === "result") { setVisionAnalysis(message.result); setVisionStatus("ready"); setVisionProgress(t.scanReady); resolve(message.result); }
      };
      worker.onerror = () => { setVisionStatus("error"); setVisionProgress(""); reject(new Error(t.scanFailure)); };
      worker.postMessage({ id, image }, [image]);
    });
  }, [t.scanFailure, t.scanLoading, t.scanAnalyzing, t.scanReady]);

  const runVisionScan = async () => {
    if (!file || !imageRef.current?.complete) { setError(t.noImage); return; }
    setBusy(true); setError("");
    try { await analyzeVisionCanvas(makeCropCanvas(4)); }
    catch (caught) { setError(caught.message || t.scanFailure); }
    finally { setBusy(false); }
  };
  const createIntelligenceBio = async () => {
    if (!file || !imageRef.current?.complete) { setError(t.noImage); return; }
    setBusy(true); setError("");
    try {
      const vision = visionAnalysis || await analyzeVisionCanvas(makeCropCanvas(4));
      const cropped = makeCropCanvas();
      const analyzed = prepareIntelligenceCanvas(cropped, focusX, focusY, vision);
      const encoded = encodePixelCanvas(analyzed.canvas, WIDTH, HEIGHT, { importanceMap: analyzed.importanceMap });
      if (encoded.characters > MAX_CHARACTERS) throw new Error(t.overLimit);
      const entry = { id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), createdAt: Date.now(), ...encoded, mode: "intelligence", focusX, focusY, faceCount: vision.faces.length, objectCount: vision.objects.length, width: WIDTH, height: HEIGHT, preview: analyzed.canvas.toDataURL("image/png") };
      setResult(entry); setCopied(false); setCopiedHistoryId("");
      try { setHistory(await savePixelHistory(entry)); } catch (historyError) { console.warn("Pixel Bio history could not be saved:", historyError); }
      setSuccessOpen(true);
      setFile(null); setImageUrl(""); setImageSize({ width: 0, height: 0 }); setZoom(1); setOffset({ x: 0, y: 0 });
      if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (caught) { setError(caught.message || t.processError); } finally { setBusy(false); }
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
    setMode(entry.mode === "text" ? "text" : entry.mode === "intelligence" ? "intelligence" : "image");
    if (entry.mode === "intelligence") { setFocusX(Number.isFinite(entry.focusX) ? entry.focusX : 0.5); setFocusY(Number.isFinite(entry.focusY) ? entry.focusY : 0.5); }
    if (entry.mode === "text") {
      setBioText(entry.text || "");setFontStyle(entry.fontStyle||"Classic");setFontScale(entry.fontScale||1);setColorSystem(entry.colorSystem||"rgb");setThemeId(entry.themeId||"arctic");
      if (entry.background) { const [r,g,b] = entry.background.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part,16)); setBackgroundRgb({r,g,b}); }
      if (entry.foreground) { const [r,g,b] = entry.foreground.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part,16)); setForegroundRgb({r,g,b}); }
    }
    setResult(entry);
    setCopied(false);
    setCopiedHistoryId("");
    requestAnimationFrame(() => resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const confirmDeleteHistory = async () => {
    if (!historyDeleteTarget || historyDeleteBusy) return;
    setHistoryDeleteBusy(true);
    try {
      setHistory(await deletePixelHistoryEntry(historyDeleteTarget.id));
      setCopiedHistoryId((current) => current === historyDeleteTarget.id ? "" : current);
      setHistoryDeleteTarget(null);
      setHistoryPage(1);
    } catch (historyError) {
      console.warn("Pixel Bio history could not be deleted:", historyError);
    } finally {
      setHistoryDeleteBusy(false);
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

      <Tabs id="pixel-mode" renderPanel={false} value={mode} onChange={(next)=>{setMode(next);setError("");}} ariaLabel={t.title} tabs={[{value:"image",label:t.tabImage,content:null},{value:"text",label:t.tabText,content:null},{value:"intelligence",label:t.tabIntelligence,content:null},{value:"optical",label:t.tabOptical,content:null}]} />
      <div id="pixel-mode-panel" role="tabpanel" aria-labelledby={mode === "image" ? "pixel-mode-tab-0" : mode === "text" ? "pixel-mode-tab-1" : mode === "intelligence" ? "pixel-mode-tab-2" : "pixel-mode-tab-3"} tabIndex={0}>{mode === "image" || mode === "intelligence" ? <div className="df-pixel-workspace">
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
            <Button className="df-pixel-dropzone" variant="secondary" wide onClick={() => fileInputRef.current?.click()}>
              <SvgIcon name="upload" size={24} />
              <strong>{t.choose}</strong>
              <span>{t.uploadHint}</span>
            </Button>
          ) : (
            <div className="df-pixel-file-summary">
              <span className="df-pixel-file-icon"><SvgIcon name="image" size={20}/></span>
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
            <RangeSlider id="pixel-zoom" label={t.zoom} min={1} max={3} step={0.05} value={zoom} onChange={setZoom} disabled={!file || busy}/>
            <Button variant="ghost" size="sm" onClick={resetCrop} disabled={!file || busy}>{t.reset}</Button>
          </div>

          {mode === "intelligence" ? <div className="df-pixel-intelligence-controls">
            <div className="df-pixel-step-heading"><span className="df-pixel-step-number">03</span><div><h2>{t.scanTitle}</h2><p>{t.scanHint}</p></div></div>
            <Button variant="secondary" onClick={runVisionScan} disabled={!file || busy} loading={busy && visionStatus === "loading"}><SvgIcon name="eye" size={16}/>{t.scanAction}</Button>
            {visionStatus !== "idle" ? <div className={"df-pixel-vision-status df-pixel-vision-status--" + visionStatus} role="status" aria-live="polite">
              <span>{visionProgress}</span>
              {visionStatus === "ready" ? <div className="df-pixel-vision-metrics"><span>{t.scanFaces}: <strong>{visionAnalysis?.faces?.length || 0}</strong></span><span>{t.scanObjects}: <strong>{visionAnalysis?.objects?.length || 0}</strong></span></div> : null}
              {visionStatus === "ready" && visionAnalysis?.objects?.length ? <div className="df-pixel-vision-tags">{visionAnalysis.objects.slice(0,6).map((item,index)=><span key={item.label + "-" + index}>{item.label} · {Math.round(item.score*100)}%</span>)}</div> : null}
            </div> : null}
            <div className="df-pixel-step-heading"><span className="df-pixel-step-number">04</span><div><h2>{t.focusTitle}</h2><p>{t.focusHint}</p></div></div>
            <RangeSlider id="pixel-focus-x" label={t.focusX} min={0} max={1} step={0.01} value={focusX} onChange={setFocusX} disabled={!file || busy}/>
            <RangeSlider id="pixel-focus-y" label={t.focusY} min={0} max={1} step={0.01} value={focusY} onChange={setFocusY} disabled={!file || busy}/>
          </div> : null}
          {error ? <p className="df-pixel-error" role="alert">{error}</p> : null}
          <Button className="df-pixel-create-button" onClick={mode === "intelligence" ? createIntelligenceBio : createPixelBio} disabled={!file || !imageSize.width || busy || (mode === "intelligence" && visionStatus === "error")} loading={busy}>
            {busy ? t.processing : mode === "intelligence" ? t.intelligenceProcess : t.process}
          </Button>
        </Card>
      </div> : mode === "text" ? (
        <Card className="df-pixel-text-panel">
          <div className="df-pixel-step-heading"><span className="df-pixel-step-number">01</span><div><h2>{t.textTitle}</h2><p>{t.textHint}</p></div></div>
          <TextField label={t.textTitle} value={bioText} onChange={(event)=>{setBioText(event.target.value);setError("");}} placeholder={t.textPlaceholder} maxLength={TEXT_LIMIT} helpText={t.textHint} />
          <div className="df-pixel-studio-controls">
            <label>Font style
              <select value={fontStyle} onChange={event=>setFontStyle(event.target.value)}>
                {["Classic","Pixel Bold","Arcade","Cyber","Terminal","Digital","Military","Rounded","Gothic","Minimal"].map(font=><option key={font} value={font}>{font}</option>)}
              </select>
            </label>
            <label>Font size
              <select value={fontScale} onChange={event=>setFontScale(Number(event.target.value))}>
                <option value={1}>1×</option><option value={2}>2×</option>
              </select>
            </label>
          </div>
          <div className="df-pixel-studio-controls">
            <label>Color system
              <select value={colorSystem} onChange={event=>setColorSystem(event.target.value)}>
                <option value="rgb">RGB</option><option value="hex">HEX</option><option value="theme">Theme</option>
              </select>
            </label>
            {colorSystem==="theme"?<label>Theme
              <select value={themeId} onChange={event=>setThemeId(event.target.value)}>
                {TEXT_THEMES.map(theme=><option key={theme.id} value={theme.id}>{theme.name}</option>)}
              </select>
            </label>:null}
          </div>
          {colorSystem==="theme"?<div className="df-pixel-theme-settings">
            <div className="df-pixel-theme-swatches">{TEXT_THEMES.map(theme=><button type="button" key={theme.id} aria-label={theme.name} aria-pressed={themeId===theme.id} style={{background:`linear-gradient(135deg,${theme.background},${theme.foreground})`}} onClick={()=>setThemeId(theme.id)}/>)}</div>
          </div>:null}
          {colorSystem==="hex"?<div className="df-pixel-studio-controls">
            <label>Background HEX<input type="color" value={backgroundHex} onChange={event=>{const v=event.target.value;setBackgroundRgb({r:parseInt(v.slice(1,3),16),g:parseInt(v.slice(3,5),16),b:parseInt(v.slice(5,7),16)});}}/></label>
            <label>Text HEX<input type="color" value={foregroundHex} onChange={event=>{const v=event.target.value;setForegroundRgb({r:parseInt(v.slice(1,3),16),g:parseInt(v.slice(3,5),16),b:parseInt(v.slice(5,7),16)});}}/></label>
          </div>:null}
          {colorSystem==="rgb"?<div className="df-pixel-color-grid">
            <section className="df-pixel-color-group"><h3>{t.background}</h3>{["r","g","b"].map(channel=><RangeSlider key={"bg-"+channel} label={t[channel==="r"?"red":channel==="g"?"green":"blue"]} min={0} max={255} value={backgroundRgb[channel]} onChange={value=>setBackgroundRgb(current=>({...current,[channel]:value}))}/>)}<output className="df-pixel-color-value">{backgroundHex.toUpperCase()}</output></section>
            <section className="df-pixel-color-group"><h3>{t.foreground}</h3>{["r","g","b"].map(channel=><RangeSlider key={"fg-"+channel} label={t[channel==="r"?"red":channel==="g"?"green":"blue"]} min={0} max={255} value={foregroundRgb[channel]} onChange={value=>setForegroundRgb(current=>({...current,[channel]:value}))}/>)}<output className="df-pixel-color-value">{foregroundHex.toUpperCase()}</output></section>
          </div>:null}
          <div className="df-pixel-text-preview"><div className="df-pixel-text-preview-heading"><strong>{t.preview}</strong></div><canvas ref={textCanvasRef} width={TEXT_WIDTH} height={TEXT_HEIGHT} aria-label={t.preview}/></div>
          <div className="df-pixel-text-validation" aria-live="polite"><span>{textValidation.count} / {TEXT_LIMIT}</span>{textValidation.error?<span role="alert">{textValidation.error==="unsupported"?t.textUnsupported:textValidation.error==="limit"?t.textLimit:t.textOverflow}</span>:null}</div>
          {error?<p className="df-pixel-error" role="alert">{error}</p>:null}
          <Button className="df-pixel-create-button" onClick={createTextPixelBio} disabled={busy||Boolean(textValidation.error)||!bioText.length} loading={busy}>{busy?t.processing:t.textProcess}</Button>
        </Card>
      ) : (
        <Card className="df-pixel-optical-panel">
          <div className="df-pixel-step-heading"><span className="df-pixel-step-number">01</span><div><h2>{t.opticalTitle}</h2><p>{t.opticalHint}</p></div></div>
          <TextField label={t.opticalIdentity} value={opticalText} maxLength={30} onChange={(event)=>{setOpticalText(event.target.value.replace(/[<>]/g,""));setOpticalCopied(false);}} placeholder="DAJJAL FAMILY" />
          <div className="df-pixel-optical-preview-wrap">
            <div className="df-pixel-text-preview-heading"><strong>{t.opticalPreview}</strong><span>3-layer depth</span></div>
            <div className="df-pixel-optical-preview" aria-label={t.opticalPreview}>
              {opticalText.trim() ? <div className="df-pixel-optical-stack"><span style={{color:opticalColors.echoA,transform:"translateY(5px)"}}>{opticalText}</span><span style={{color:opticalColors.echoB,transform:"translateY(-3px)"}}>{opticalText}</span><span style={{color:opticalColors.core}}>{opticalText}</span></div> : <span className="df-pixel-empty-preview">{t.opticalEmpty}</span>}
            </div>
          </div>
          <div className="df-pixel-optical-colors">
            {[{key:"core",label:t.opticalPrimary},{key:"echoA",label:t.opticalEchoA},{key:"echoB",label:t.opticalEchoB}].map((item)=><label key={item.key}>{item.label}<input type="color" value={opticalColors[item.key]} onChange={(event)=>{setOpticalColors((current)=>({...current,[item.key]:event.target.value}));setOpticalCopied(false);}} /></label>)}
          </div>
          <label className="df-pixel-optical-code-label">{t.opticalCode}<textarea readOnly value={opticalCode} rows={4} spellCheck={false}/></label>
          <Button className="df-pixel-create-button" onClick={async()=>setOpticalCopied(await copyText(opticalCode))} disabled={!opticalCode}>{opticalCopied?t.opticalCopied:t.opticalCopy}</Button>
        </Card>
      )}</div>

      {result ? (
        <div className="df-pixel-result-anchor" ref={resultPanelRef}>
        <Card className="df-pixel-result-panel">
          <div className="df-pixel-result-heading">
            <h2>{t.resultTitle}</h2>
            <span aria-hidden="true"><SvgIcon name="check" size={18}/></span>
          </div>
          <div className="df-pixel-result-preview">
            <img src={result.preview} alt={t.resultTitle} />
          </div>
          <div className="df-pixel-result-details" aria-label={t.resultTitle}>
            <div className="df-pixel-result-detail">
              <span>{t.detailCharacters}</span>
              <strong>{new Intl.NumberFormat(language === "en" ? "en-US" : "id-ID").format(result.characters)} / {new Intl.NumberFormat(language === "en" ? "en-US" : "id-ID").format(MAX_CHARACTERS)}</strong>
            </div>
            {result.mode === "intelligence" ? <>
              <div className="df-pixel-result-detail"><span>{t.scanFaces}</span><strong>{result.faceCount || 0}</strong></div>
              <div className="df-pixel-result-detail"><span>{t.scanObjects}</span><strong>{result.objectCount || 0}</strong></div>
            </> : null}
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
        </div>
        {history.length === 0 ? (
          <p className="df-pixel-history-empty">{t.historyEmpty}</p>
        ) : (
          <div className="df-pixel-history-list">
            {history.slice((historyPage-1)*HISTORY_PAGE_SIZE,historyPage*HISTORY_PAGE_SIZE).map((entry, index) => (
              <article className="df-pixel-history-item" key={entry.id}>
                <div className={`df-pixel-history-thumb ${entry.mode === "text" ? "df-pixel-history-thumb--text" : ""}`}>
                  <img src={entry.preview} alt={`${t.historyItem} ${history.length - ((historyPage - 1) * HISTORY_PAGE_SIZE + index)}`} />
                </div>
                <div className="df-pixel-history-meta">
                  <div className="df-pixel-history-meta-heading">
                    <strong>{t.historyItem} #{history.length - ((historyPage - 1) * HISTORY_PAGE_SIZE + index)} · {entry.mode === "text" ? t.tabText : entry.mode === "intelligence" ? t.tabIntelligence : t.tabImage}</strong>
                    <Button variant="danger" size="sm" onClick={() => setHistoryDeleteTarget(entry)} aria-label={t.historyDelete}>
                      <SvgIcon name="trash" size={14} />
                      <span>{t.historyDelete}</span>
                    </Button>
                  </div>
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
        {history.length>HISTORY_PAGE_SIZE?<div className="df-pixel-history-pagination"><Button size="sm" variant="secondary" disabled={historyPage===1} onClick={()=>setHistoryPage(page=>Math.max(1,page-1))}>Previous</Button><span>{historyPage} / {Math.ceil(history.length/HISTORY_PAGE_SIZE)}</span><Button size="sm" variant="secondary" disabled={historyPage>=Math.ceil(history.length/HISTORY_PAGE_SIZE)} onClick={()=>setHistoryPage(page=>Math.min(Math.ceil(history.length/HISTORY_PAGE_SIZE),page+1))}>Next</Button></div>:null}
      </Card>

      <ConfirmDialog
        open={Boolean(historyDeleteTarget)}
        onClose={() => { if (!historyDeleteBusy) setHistoryDeleteTarget(null); }}
        onConfirm={confirmDeleteHistory}
        title={t.historyDeleteTitle}
        description={t.historyDeleteConfirm}
        confirmLabel={t.historyDeleteConfirmAction}
        cancelLabel={t.historyDeleteCancel}
        loading={historyDeleteBusy}
      />

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
