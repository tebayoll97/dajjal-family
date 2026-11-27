import { FilesetResolver, FaceLandmarker, ObjectDetector } from "@mediapipe/tasks-vision";

const VISION_VERSION = "1.2.3";
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const OBJECT_MODEL = "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite";
const CACHE_NAME = "df-pixel-vision-models-v1";

let runtimePromise;
let faceLandmarkerPromise;
let objectDetectorPromise;

async function getModelBuffer(url, onProgress) {
  const cache = "caches" in self ? await caches.open(CACHE_NAME) : null;
  const cached = cache ? await cache.match(url) : null;
  if (cached) {
    onProgress?.({ stage: "cache", model: url === FACE_MODEL ? "face" : "objects" });
    return new Uint8Array(await cached.arrayBuffer());
  }
  const response = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!response.ok) throw new Error(`Model download failed (${response.status}).`);
  const clone = response.clone();
  const buffer = new Uint8Array(await response.arrayBuffer());
  if (cache) { try { await cache.put(url, clone); } catch { /* Inference can continue when local cache quota is unavailable. */ } }
  return buffer;
}

async function getRuntime() {
  if (!runtimePromise) runtimePromise = FilesetResolver.forVisionTasks(WASM_ROOT);
  return runtimePromise;
}

async function getFaceLandmarker(onProgress) {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = (async () => {
      onProgress?.({ stage: "model", model: "face" });
      const [vision, modelAssetBuffer] = await Promise.all([getRuntime(), getModelBuffer(FACE_MODEL, onProgress)]);
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetBuffer, delegate: "CPU" },
        runningMode: "IMAGE",
        numFaces: 5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
    })().catch((error) => { faceLandmarkerPromise = null; throw error; });
  }
  return faceLandmarkerPromise;
}

async function getObjectDetector(onProgress) {
  if (!objectDetectorPromise) {
    objectDetectorPromise = (async () => {
      onProgress?.({ stage: "model", model: "objects" });
      const [vision, modelAssetBuffer] = await Promise.all([getRuntime(), getModelBuffer(OBJECT_MODEL, onProgress)]);
      return ObjectDetector.createFromOptions(vision, {
        baseOptions: { modelAssetBuffer, delegate: "CPU" },
        runningMode: "IMAGE",
        scoreThreshold: 0.28,
        maxResults: 12,
      });
    })().catch((error) => { objectDetectorPromise = null; throw error; });
  }
  return objectDetectorPromise;
}

function summarizeFaces(result, width, height) {
  return (result.faceLandmarks || []).map((landmarks) => {
    const xs = landmarks.map((point) => point.x);
    const ys = landmarks.map((point) => point.y);
    const minX = Math.max(0, Math.min(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxX = Math.min(1, Math.max(...xs));
    const maxY = Math.min(1, Math.max(...ys));
    const pointAt = (index) => landmarks[index] ? { x: landmarks[index].x, y: landmarks[index].y } : null;
    return {
      box: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      landmarks: { leftEye: pointAt(33), rightEye: pointAt(263), nose: pointAt(1), mouth: pointAt(13), chin: pointAt(152) },
      confidence: null,
    };
  }).filter((face) => face.box.width > 0 && face.box.height > 0).slice(0, 5);
}

function summarizeObjects(result) {
  return (result.detections || []).map((detection) => {
    const category = detection.categories?.[0];
    const box = detection.boundingBox;
    return {
      label: category?.displayName || category?.categoryName || "object",
      score: category?.score || 0,
      box: box ? { x: box.originX, y: box.originY, width: box.width, height: box.height } : null,
    };
  }).filter((item) => item.box && item.score >= 0.28).slice(0, 12);
}

self.onmessage = async (event) => {
  const { id, image } = event.data || {};
  if (!image) return;
  const progress = (detail) => self.postMessage({ id, type: "progress", detail });
  try {
    progress({ stage: "loading" });
    const [faceTask, objectTask] = await Promise.all([getFaceLandmarker(progress), getObjectDetector(progress)]);
    progress({ stage: "analyzing" });
    const [faceResult, objectResult] = await Promise.all([
      Promise.resolve(faceTask.detect(image)),
      Promise.resolve(objectTask.detect(image)),
    ]);
    self.postMessage({
      id,
      type: "result",
      result: {
        width: image.width,
        height: image.height,
        faces: summarizeFaces(faceResult, image.width, image.height),
        objects: summarizeObjects(objectResult),
        engine: "MediaPipe Tasks Vision",
        version: VISION_VERSION,
      },
    });
  } catch (error) {
    self.postMessage({ id, type: "error", error: error?.message || "Local vision analysis failed." });
  } finally {
    image.close?.();
  }
};
