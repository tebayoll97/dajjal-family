import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { BACKGROUND_MODEL } from "../../lib/agent-dajjal/background-remover/model-manifest";

const VISION_VERSION = "1.2.3";
const WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@" + VISION_VERSION + "/wasm";
const CACHE_NAME = "df-agent-dajjal-background-model-v1";
const MAX_OUTPUT_PIXELS = 16000000;
const MODEL_DOWNLOAD_TIMEOUT_MS = 60000;
let runtimePromise;
let segmenterPromise;

function post(id, type, detail = {}, transfer = []) {
  self.postMessage({ id, type, ...detail }, transfer);
}

async function hasValidIntegrity(buffer) {
  if (buffer.byteLength !== BACKGROUND_MODEL.bytes) return false;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const hash = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  return hash === BACKGROUND_MODEL.sha256;
}

async function verifiedModel(id) {
  let cache = null;
  try {
    if ("caches" in self) cache = await caches.open(CACHE_NAME);
  } catch {
    // Browser storage is best-effort; a verified in-memory model is sufficient.
  }

  if (cache) {
    try {
      const cached = await cache.match(BACKGROUND_MODEL.url);
      if (cached) {
        const cachedBytes = await cached.arrayBuffer();
        if (await hasValidIntegrity(cachedBytes)) {
          post(id, "progress", { stage: "model-verified", cached: true });
          return new Uint8Array(cachedBytes);
        }
        await cache.delete(BACKGROUND_MODEL.url);
      }
    } catch {
      // Ignore cache read/delete failures and recover from the verified network source.
    }
  }

  post(id, "progress", { stage: "model-download", progress: 0 });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODEL_DOWNLOAD_TIMEOUT_MS);
  let buffer;
  try {
    const response = await fetch(BACKGROUND_MODEL.url, {
      mode: "cors",
      credentials: "omit",
      cache: "no-cache",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("MODEL_DOWNLOAD_" + response.status);
    buffer = await response.arrayBuffer();
  } catch (error) {
    if (error?.message?.startsWith("MODEL_DOWNLOAD_")) throw error;
    throw new Error(error?.name === "AbortError" ? "MODEL_DOWNLOAD_TIMEOUT" : "MODEL_DOWNLOAD_FAILED");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!(await hasValidIntegrity(buffer))) {
    if (buffer.byteLength !== BACKGROUND_MODEL.bytes) throw new Error("MODEL_SIZE_MISMATCH");
    throw new Error("MODEL_INTEGRITY_FAILED");
  }

  if (cache) {
    try {
      await cache.put(BACKGROUND_MODEL.url, new Response(buffer.slice(0), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }));
    } catch {
      // Continue with the verified in-memory model if storage is unavailable or full.
    }
  }

  post(id, "progress", { stage: "model-verified", cached: false });
  return new Uint8Array(buffer);
}

async function getSegmenter(id) {
  if (!runtimePromise) {
    runtimePromise = FilesetResolver.forVisionTasks(WASM_ROOT).catch(() => {
      runtimePromise = null;
      throw new Error("WASM_RUNTIME_FAILED");
    });
  }

  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const [vision, modelAssetBuffer] = await Promise.all([runtimePromise, verifiedModel(id)]);
      let segmenter;
      try {
        segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: { modelAssetBuffer, delegate: "CPU" },
          runningMode: "IMAGE",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch {
        throw new Error("MODEL_INIT_FAILED");
      }
      post(id, "progress", { stage: "model-ready" });
      return segmenter;
    })().catch((error) => {
      segmenterPromise = null;
      throw error;
    });
  }

  return segmenterPromise;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

async function removeBackground(image, segmenter, threshold, feather) {
  const width = image.width;
  const height = image.height;
  if (!width || !height || width * height > MAX_OUTPUT_PIXELS) throw new Error("IMAGE_PIXEL_LIMIT");

  let result;
  try {
    result = segmenter.segment(image);
  } catch {
    throw new Error("SEGMENTATION_FAILED");
  }

  const mask = result.confidenceMasks?.[0];
  if (!mask) {
    result.close?.();
    throw new Error("SEGMENTATION_MASK_MISSING");
  }

  try {
    const maskWidth = mask.width;
    const maskHeight = mask.height;
    const confidence = mask.getAsFloat32Array();
    if (!maskWidth || !maskHeight || confidence.length !== maskWidth * maskHeight) {
      throw new Error("SEGMENTATION_MASK_INVALID");
    }

    const low = clamp(threshold - feather, 0.01, 0.98);
    const high = clamp(threshold + feather, low + 0.01, 1);
    const maskCanvas = new OffscreenCanvas(maskWidth, maskHeight);
    const maskContext = maskCanvas.getContext("2d", { alpha: true });
    if (!maskContext) throw new Error("CANVAS_UNAVAILABLE");

    const maskPixels = maskContext.createImageData(maskWidth, maskHeight);
    for (let index = 0; index < confidence.length; index += 1) {
      const alpha = Math.round(smoothstep(low, high, confidence[index]) * 255);
      const offset = index * 4;
      maskPixels.data[offset] = 255;
      maskPixels.data[offset + 1] = 255;
      maskPixels.data[offset + 2] = 255;
      maskPixels.data[offset + 3] = alpha;
    }
    maskContext.putImageData(maskPixels, 0, 0);

    const output = new OffscreenCanvas(width, height);
    const context = output.getContext("2d", { alpha: true });
    if (!context) throw new Error("CANVAS_UNAVAILABLE");

    context.drawImage(image, 0, 0, width, height);
    context.globalCompositeOperation = "destination-in";
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(maskCanvas, 0, 0, width, height);
    context.globalCompositeOperation = "source-over";

    try {
      return await createImageBitmap(output);
    } catch {
      throw new Error("IMAGE_EXPORT_FAILED");
    }
  } finally {
    mask.close?.();
    result.close?.();
  }
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
