# Agent Dajjal — Background Remover

## Product behavior
- Public route: `/id/df/agent-dajjal/tools/background-remover` and its `/en` equivalent.
- Processing is browser-local. The selected image is passed to a dedicated Web Worker as an ImageBitmap and is never sent to an application API.
- Input: JPEG, PNG, WebP, AVIF, max 20 MiB and max 16 megapixels.
- Output: transparent PNG, downloaded only after an explicit user action.
- Controls: confidence threshold and edge feathering.
- Intended subject: human portrait/person segmentation. This is not a general-purpose arbitrary-object background remover.

## Model and licensing
- Runtime: existing `@mediapipe/tasks-vision@1.2.3` dependency.
- Model: Google MediaPipe SelfieSegmenter square, float16, 256×256 input.
- Upstream artifact: `https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite`
- Expected bytes: 249,537.
- SHA-256: `191ac9529ae506ee0beefa6b2c945a172dab9d07d1e802a290a4e4038226658b`.
- License: Apache-2.0. Attribution: MediaPipe Selfie Segmentation — Google.
- The worker verifies byte length and SHA-256 before model initialization and before adding the model to Cache Storage. A corrupt cached model is deleted and downloaded again.
- MediaPipe WASM runtime is loaded from the version-pinned jsDelivr package path; model is downloaded on demand and browser-cached.

## Resource and privacy controls
- File size and decoded pixel count are validated before processing.
- Worker owns segmentation and alpha-mask compositing; the main thread only renders the returned bitmap and encodes the PNG.
- The app does not persist source or output images. Closing the tab discards unsaved in-memory work.
- Cache Storage holds only the public, integrity-verified model asset; it does not hold user images.
- Browser storage failure does not block a verified in-memory model from processing.
- Worker is terminated after each job and on component unmount.

## Limitations
- The upstream selfie model targets people; object-only images may not segment correctly.
- Segmentation resolution is 256×256, so fine hair/fur and complex edges can be imperfect.
- First use requires network access to fetch the WASM runtime and model. Subsequent model loads may use browser cache.
- Actual device/browser performance and visual quality still require manual QA across mobile, tablet, desktop and all four theme combinations.
