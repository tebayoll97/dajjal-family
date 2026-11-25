import "server-only";

import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_API = "https://www.googleapis.com/drive/v3";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function encryptionKey() {
  const key = Buffer.from(requiredEnv("GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32) throw new Error("GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}

export function googleDriveRedirectUri() {
  return process.env.GOOGLE_DRIVE_REDIRECT_URI || "https://dajjalfamily.com/api/storage/google/callback";
}

export function googleDriveAuthorizationUrl(state) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: requiredEnv("GOOGLE_DRIVE_CLIENT_ID"),
    redirect_uri: googleDriveRedirectUri(),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  }).toString();
  return url.toString();
}

export function createOAuthState(adminId) {
  const nonce = crypto.randomBytes(24).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ adminId, nonce, issuedAt: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", requiredEnv("GOOGLE_DRIVE_STATE_SECRET")).update(payload).digest("base64url");
  return { value: `${payload}.${signature}`, nonce };
}

export function verifyOAuthState(value) {
  if (typeof value !== "string") return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", requiredEnv("GOOGLE_DRIVE_STATE_SECRET")).update(payload).digest();
  let supplied;
  try { supplied = Buffer.from(signature, "base64url"); } catch { return null; }
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.adminId || !data.nonce || Date.now() - data.issuedAt > 10 * 60 * 1000 || data.issuedAt > Date.now() + 30000) return null;
    return data;
  } catch { return null; }
}

function encryptToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    refresh_token_ciphertext: ciphertext.toString("base64"),
    refresh_token_iv: iv.toString("base64"),
    refresh_token_tag: cipher.getAuthTag().toString("base64"),
  };
}

export async function exchangeGoogleCode(code) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_DRIVE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_DRIVE_CLIENT_SECRET"),
      redirect_uri: googleDriveRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || "Google token exchange failed.");
  if (!data.refresh_token) throw new Error("Google did not return a refresh token. Revoke the app grant and reconnect with consent.");
  return { ...data, encrypted: encryptToken(data.refresh_token) };
}

export async function createDriveRootFolder(accessToken) {
  const response = await fetch(`${GOOGLE_API}/files?fields=id,name,mimeType`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "DAJJAL FAMILY STORAGE", mimeType: "application/vnd.google-apps.folder" }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Unable to create Drive root folder.");
  return data;
}

export async function getGoogleAccountEmail(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();
  if (!response.ok || !data.email) throw new Error("Unable to verify connected Google account.");
  return data.email;
}

export async function getStoredRefreshToken() {
  const { data, error } = await supabaseAdmin.from("df_storage_connections")
    .select("refresh_token_ciphertext,refresh_token_iv,refresh_token_tag")
    .eq("singleton", true).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Google Drive is not connected.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(data.refresh_token_iv, "base64"));
  decipher.setAuthTag(Buffer.from(data.refresh_token_tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(data.refresh_token_ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export async function getGoogleDriveAccessToken() {
  const refreshToken = await getStoredRefreshToken();
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_DRIVE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_DRIVE_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(data.error_description || "Unable to refresh Google Drive access token.");
  return data.access_token;
}

const DRIVE_FILE_EXTENSIONS = Object.freeze({
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/aac": ".aac",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
});

export function createDriveStoredFileName({ slot, mimeType }) {
  const extension = DRIVE_FILE_EXTENSIONS[mimeType];
  const safeSlot = typeof slot === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slot)
    ? slot
    : null;
  if (!extension || !safeSlot) throw new Error("Unsupported Drive filename slot or MIME type.");
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const uniqueSuffix = crypto.randomBytes(4).toString("hex");
  return `${safeSlot}-${timestamp}-${uniqueSuffix}${extension}`;
}

export async function uploadDriveFile({ accessToken, file, folderId, slot }) {
  const storedName = createDriveStoredFileName({ slot, mimeType: file.type });
  const boundary = "df_drive_" + crypto.randomBytes(12).toString("hex");
  const metadata = JSON.stringify({ name: storedName, mimeType: file.type, parents: [folderId] });
  const bytes = Buffer.from(await file.arrayBuffer());
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`),
    bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(60000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Google Drive upload failed.");
  return data;
}

export async function saveDriveConnection({ adminId, tokenData, rootFolder, email }) {
  const { data, error } = await supabaseAdmin.from("df_storage_connections").upsert({
    singleton: true,
    provider: "google_drive",
    account_email: email,
    drive_root_folder_id: rootFolder.id,
    ...tokenData.encrypted,
    scopes: (tokenData.scope || "").split(" ").filter(Boolean),
    connected_by: adminId,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "singleton" }).select("singleton,provider,account_email,drive_root_folder_id,connected_at").single();
  if (error) throw error;
  return data;
}


function escapeDriveQuery(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function findOrCreateDriveFolder({ accessToken, name, parentId }) {
  const safeName = escapeDriveQuery(name);
  const query = `'${escapeDriveQuery(parentId)}' in parents and name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = new URL(`${GOOGLE_API}/files`);
  searchUrl.search = new URLSearchParams({ q: query, pageSize: "10", fields: "files(id,name,mimeType)" }).toString();
  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const searchData = await searchResponse.json();
  if (!searchResponse.ok) throw new Error(searchData.error?.message || "Unable to find Drive folder.");
  const existing = searchData.files?.find((item) => item.name === name);
  if (existing) return existing;
  const createResponse = await fetch(`${GOOGLE_API}/files?fields=id,name,mimeType`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const created = await createResponse.json();
  if (!createResponse.ok || !created.id) throw new Error(created.error?.message || "Unable to create Drive folder.");
  return created;
}

export async function deleteDriveFile({ accessToken, fileId }) {
  const response = await fetch(`${GOOGLE_API}/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok && response.status !== 404) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || "Unable to remove incomplete Drive upload.");
  }
}


export async function makeDriveFilePubliclyReadable({ accessToken, fileId }) {
  const response = await fetch(`${GOOGLE_API}/files/${encodeURIComponent(fileId)}/permissions?fields=id,type,role`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "anyone", role: "reader" }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Unable to make avatar image publicly readable.");
  return data;
}
