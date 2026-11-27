const MAX_INPUT_BYTES = 40 * 1024 * 1024;
const MAX_EDGE = 12000;

export async function compressImage(file, options = {}) {
  if (!(file instanceof File)) throw new Error("INVALID_FILE");
  if (!/^image\/(jpeg|png|webp|avif)$/i.test(file.type)) throw new Error("UNSUPPORTED_FORMAT");
  if (file.size > MAX_INPUT_BYTES) throw new Error("FILE_TOO_LARGE");

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width > MAX_EDGE || bitmap.height > MAX_EDGE) throw new Error("IMAGE_TOO_LARGE");
    const scale = Math.min(1, Math.max(0.1, Number(options.scale) || 1));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("CANVAS_UNAVAILABLE");
    context.drawImage(bitmap, 0, 0, width, height);

    const requestedType = options.format || "image/webp";
    const type = ["image/jpeg", "image/png", "image/webp"].includes(requestedType) ? requestedType : "image/webp";
    const quality = type === "image/png" ? undefined : Math.min(0.95, Math.max(0.1, Number(options.quality) || 0.82));
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("ENCODE_FAILED")), type, quality);
    });
    if (!blob.type || !blob.type.startsWith("image/")) throw new Error("ENCODE_FAILED");
    return { blob, width, height, type: blob.type, originalSize: file.size, outputSize: blob.size };
  } finally {
    bitmap.close();
  }
}
