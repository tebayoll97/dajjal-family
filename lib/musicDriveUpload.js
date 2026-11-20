import "server-only";
import crypto from "node:crypto";
import { findOrCreateDriveFolder, getGoogleDriveAccessToken } from "@/lib/googleDriveStorage";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const GOOGLE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const MAX_AUDIO = 50 * 1024 * 1024;
const MAX_COVER = 5 * 1024 * 1024;
const TYPES = {
  audio: new Set(["audio/mpeg", "audio/mp4", "audio/aac", "audio/ogg", "audio/wav"]),
  cover: new Set(["image/jpeg", "image/png", "image/webp"]),
};
function secret() {
  const value = process.env.GOOGLE_DRIVE_STATE_SECRET;
  if (!value) throw new Error("Music upload signing secret is not configured.");
  return value;
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return body + "." + mac;
}
export function verifyMusicUploadToken(token) {
  if (typeof token !== "string") return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest();
  let actual;
  try { actual = Buffer.from(signature, "base64url"); } catch { return null; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!data.sessionUrl || !data.mimeType || !data.total || Date.now() - data.issuedAt > 2 * 60 * 60 * 1000) return null;
    const url = new URL(data.sessionUrl);
    if (url.protocol !== "https:" || url.hostname !== "www.googleapis.com" || !url.pathname.startsWith("/upload/drive/v3/files")) return null;
    return data;
  } catch { return null; }
}
export async function beginMusicDriveUpload({ name, mimeType, size, slot }) {
  const isAudio = slot === "audio";
  if (!TYPES[slot]?.has(mimeType)) throw new Error("Unsupported file type.");
  const max = isAudio ? MAX_AUDIO : MAX_COVER;
  if (!Number.isSafeInteger(size) || size < 1 || size > max) throw new Error(isAudio ? "Audio must be 1 byte–50 MB." : "Cover must be 1 byte–5 MB.");
  const { data: connection, error } = await supabaseAdmin.from("df_storage_connections")
    .select("drive_root_folder_id").eq("singleton", true).maybeSingle();
  if (error) throw error;
  if (!connection?.drive_root_folder_id) throw new Error("Central Google Drive is not connected.");
  const accessToken = await getGoogleDriveAccessToken();
  const library = await findOrCreateDriveFolder({ accessToken, name: "MUSIC LIBRARY", parentId: connection.drive_root_folder_id });
  const target = await findOrCreateDriveFolder({ accessToken, name: isAudio ? "AUDIO" : "COVERS", parentId: library.id });
  const ext = ({ "audio/mpeg":".mp3", "audio/mp4":".m4a", "audio/aac":".aac", "audio/ogg":".ogg", "audio/wav":".wav", "image/jpeg":".jpg", "image/png":".png", "image/webp":".webp" })[mimeType];
  const safeName = (String(name || "upload").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "upload");
  const storedName = `${slot}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeName.replace(/\.[^.]+$/, "")}${ext}`;
  const response = await fetch(`${GOOGLE_UPLOAD}?uploadType=resumable&fields=id,name,mimeType,size,webViewLink`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": String(size),
    },
    body: JSON.stringify({ name: storedName, mimeType, parents: [target.id] }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok || !response.headers.get("location")) throw new Error("Unable to start Google Drive resumable upload.");
  return sign({ sessionUrl: response.headers.get("location"), mimeType, total: size, slot, issuedAt: Date.now() });
}
export async function sendMusicDriveChunk({ token, bytes, start, end }) {
  const data = verifyMusicUploadToken(token);
  if (!data) throw new Error("Upload session is invalid or expired.");
  if (!Buffer.isBuffer(bytes) || !bytes.length || start < 0 || end !== start + bytes.length - 1 || end >= data.total) throw new Error("Invalid upload chunk.");
  if (start % (256 * 1024) !== 0 || (end + 1 < data.total && bytes.length % (256 * 1024) !== 0)) throw new Error("Upload chunks must use 256 KB-aligned boundaries.");
  const accessToken = await getGoogleDriveAccessToken();
  const response = await fetch(data.sessionUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": data.mimeType,
      "Content-Length": String(bytes.length),
      "Content-Range": `bytes ${start}-${end}/${data.total}`,
    },
    body: bytes,
    cache: "no-store",
    signal: AbortSignal.timeout(60000),
  });
  if (response.status === 308) return { complete: false, range: response.headers.get("range") || null };
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) throw new Error(result.error?.message || "Google Drive chunk upload failed.");
  return { complete: true, file: result };
}
export async function cancelMusicDriveUpload(token) {
  const data = verifyMusicUploadToken(token);
  if (!data) return false;
  const accessToken = await getGoogleDriveAccessToken();
  const response = await fetch(data.sessionUrl, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(10000) });
  return response.ok || response.status === 404 || response.status === 410;
}
export function validateMusicFileSignature(bytes, mimeType) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mimeType === "image/webp") return bytes.length >= 12 && bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP";
  if (mimeType === "audio/wav") return bytes.length >= 12 && bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WAVE";
  if (mimeType === "audio/ogg") return bytes.subarray(0,4).toString() === "OggS";
  if (mimeType === "audio/mp4") return bytes.length >= 12 && bytes.subarray(4,8).toString() === "ftyp";
  if (mimeType === "audio/aac") return bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xf6) === 0xf0;
  if (mimeType === "audio/mpeg") return bytes.subarray(0,3).toString() === "ID3" || (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  return false;
}
