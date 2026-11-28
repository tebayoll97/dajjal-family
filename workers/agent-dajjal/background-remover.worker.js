import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { BACKGROUND_MODEL } from "../../lib/agent-dajjal/background-remover/model-manifest";

const VISION_VERSION = "1.2.3";
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
const CACHE_NAME = "df-agent-dajjal-background-model-v1";
const MAX_OUTPUT_PIXELS = 16000000;
let runtimePromise;
let segmenterPromise;

function post(id, type, detail = {}, transfer = []) { self.postMessage({ id, type, ...detail }, transfer); }

async function verifiedModel(id) {
  const cache = "caches" in self ? await caches.open(CACHE_NAME) : null;
  if (cache) {
    const cached = await cache.match(BACKGROUND_MODEL.url);
    if (cached) {
      const bytes = await cached.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
      if (hash === BACKGROUND_MODEL.sha256) { post(id, "progress", { stage: "model-ready", cached: true }); return bytes; }
      await cache.delete(BACKGROUND_MODEL.url);
    }
  }

  post(id, "progress", { stage: "model-download", progress: 0 });
  const response = await fetch(BACKGROUND_MODEL.url, { mode: "cors", credentials: "omit", cache: "no-cache" });
  if (!response.ok) throw new Error(`MODEL_DOWNLOAD_${response.status}`);
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength !== BACKGROUND_MODEL.bytes) throw new Error("MODEL_SIZE_MISMATCH");
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const hash = Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
  if (hash !== BACKGROUND_MODEL.sha256) throw new Error("MODEL_INTEGRITY_FAILED");
  if (cache) {
    try { await cache.put(BACKGROUND_MODEL.url, new Response(buffer.slice(0), { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } })); }
    catch { /* Continue processing if browser storage is unavailable or full. */ }
  }
  post(id, "progress", { stage: "model-ready", cached: false });
  return buffer;
}

async function getSegmenter(id) {
  if (!runtimePromise) runtimePromise = FilesetResolver.forVisionTasks(WASM_ROOT);
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const [vision, modelAssetBuffer] = await Promise.all([runtimePromise, verifiedModel(id)]);
      return ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetBuffer, delegate: "CPU" },
        runningMode: "IMAGE",
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    })().catch((error) => { segmenterPromise = null; throw error; });
  }
  return segmenterPromise;
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

async function removeBackground(image, segmenter, threshold, feather) {
  const width = image.width;
  const height = image.height;
  if (!width || !height || width * height > MAX_OUTPUT_PIXELS) throw new Error("IMAGE_PIXEL_LIMIT");
  const result = segmenter.segment(image);
  const mask = result.confidenceMasks?.[0];
  if (!mask) throw new Error("SEGMENTATION_MASK_MISSING");
  const maskWidth = mask.width;
  const maskHeight = mask.height;
  const confidence = mask.getAsFloat32Array();
  const output = new OffscreenCanvas(width, height);
  const context = output.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height);
  const low = clamp(threshold - feather, 0.01, 0.98);
  const high = clamp(threshold + feather, low + 0.01, 1);
  const scaleX = maskWidth / width;
  const scaleY = maskHeight / height;
  for (let y = 0; y < height; y++) {
    const sourceY = clamp((y + 0.5) * scaleY - 0.5, 0, maskHeight - 1);
    const y0 = Math.floor(sourceY);
    const y1 = Math.min(maskHeight - 1, y0 + 1);
    const fy = sourceY - y0;
    for (let x = 0; x < width; x++) {
      const sourceX = clamp((x + 0.5) * scaleX - 0.5, 0, maskWidth - 1);
      const x0 = Math.floor(sourceX);
      const x1 = Math.min(maskWidth - 1, x0 + 1);
      const fx = sourceX - x0;
      const top = confidence[y0 * maskWidth + x0] * (1 - fx) + confidence[y0 * maskWidth + x1] * fx;
      const bottom = confidence[y1 * maskWidth + x0] * (1 - fx) + confidence[y1 * maskWidth + x1] * fx;
      const alpha = Math.round(smoothstep(low, high, top * (1 - fy) + bottom * fy) * 255);
      const offset = (y * width + x) * 4 + 3;
      pixels.data[offset] = Math.round(pixels.data[offset] * alpha / 255);
    }
  }
  context.putImageData(pixels, 0, 0);
  result.close?.();
  return await createImageBitmap(output);
}

self.onmessage = async (event) => {
  const { id, image, threshold = 0.48, feather = 0.16 } = event.data || {};
  if (!image || !id) return;
  try {
    post(id, "progress", { stage: "loading" });
    const segmenter = await getSegmenter(id);
    post(id, "progress", { stage: "segmenting" });
    const output = await removeBackground(image, segmenter, threshold, feather);
    post(id, "result", { image: output, width: output.width, height: output.height }, [output]);
  } catch (error) {
    post(id, "error", { error: error?.message || "PROCESSING_FAILED" });
  } finally {
    image.close?.();
  }
};
