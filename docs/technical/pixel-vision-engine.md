# Pixel Vision Engine

**Status:** Implemented in source; production build and device QA pending.  
**Feature:** DAJJAL PIXEL BIO — Intelligence Mode  
**Runtime:** MediaPipe Tasks Vision 1.2.3 in a dedicated browser Web Worker

## Purpose

Add actual on-device computer vision to Intelligence Mode while preserving Image Mode, Text Mode, the shared Rich Text encoder, and the existing IndexedDB history.

## Local inference architecture

1. The page crops the selected image to the existing 193×45 Pixel Bio composition.
2. The page transfers an `ImageBitmap` to `pixel-vision.worker.js`. The original File and image pixels are not sent to a server.
3. The worker initializes MediaPipe Tasks Vision:
   - Face Landmarker: detects up to five faces and returns 478-point face meshes. The engine derives a normalized face box and selected eye, nose, mouth, and chin landmarks.
   - EfficientDet-Lite0 INT8 Object Detector: detects COCO-labeled people, animals, and supported everyday objects, with a score threshold of 0.28 and at most 12 results.
4. The worker runs both models locally on CPU and returns compact detection metadata to the page.
5. The worker closes the transferred ImageBitmap after inference.
6. The browser Cache API stores downloaded model responses under `df-pixel-vision-models-v1`; later scans can reuse cached model bytes.
7. Pixel Intelligence combines the face boxes, facial landmarks, object boxes, user focus point, and local edge strength into a per-pixel importance map. That map weights the existing palette selection and adaptive reconstruction. The shared Rich Text encoder and 32,000-character guard remain unchanged.

## Network and privacy boundary

- Inference is performed on the user's device in a Web Worker. No image upload endpoint or AI inference server is used.
- On first use, the browser downloads the pinned MediaPipe WASM runtime from jsDelivr and the model files from Google's public MediaPipe model storage. Model bytes are cached in browser Cache Storage where available.
- The image bitmap is transferred only between the page and its local worker; it is not included in network requests.
- Offline inference is possible only after the runtime and both model assets have been fetched and remain available in browser caches. A first-time scan therefore requires connectivity.
- If a model cannot be downloaded or initialized, the scan reports an error; it does not silently claim that AI detection succeeded.

## Model scope and limitations

- Face Landmarker returns facial geometry, not identity. The feature does not identify who a person is.
- Object detection uses the COCO label vocabulary supported by EfficientDet-Lite0. It cannot recognize every possible animal, object, character, or custom game asset.
- This implementation does not yet perform general foreground/background segmentation. Face and object regions are prioritized from detection boxes and facial landmarks.
- Small, occluded, stylized, low-contrast, or unusual subjects may be missed. Confidence thresholds and crop composition affect results.
- Detection results are guidance for pixel reconstruction, not a guarantee of perfect source-image fidelity.

## Operational safeguards

- Models initialize lazily only when the user runs Pixel Vision Scan.
- Worker inference keeps synchronous model calls off the main UI thread.
- Model buffers are cached locally; model download or initialization errors are surfaced to the user.
- Changing the crop/zoom invalidates previous scan results so stale coordinates cannot influence a new composition.
- Existing Image Mode and Text Mode do not initialize or depend on MediaPipe.
- No database, Supabase, authentication, storage, or server secrets are involved.

## Verification checklist

- [ ] Production build and lint.
- [ ] Face detection and landmark placement on portrait samples.
- [ ] Person, animal, and object detection on representative samples.
- [ ] First-run model download and second-run Cache Storage reuse.
- [ ] Small Android memory/CPU behavior and Worker responsiveness.
- [ ] Four global theme combinations and ID/EN labels.
- [ ] Image Mode and Text Mode regression checks.
- [ ] Error behavior for offline/blocked model downloads and unsupported browsers.
