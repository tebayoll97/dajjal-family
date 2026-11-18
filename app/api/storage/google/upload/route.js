import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGoogleDriveAccessToken, uploadDriveFile } from "@/lib/googleDriveStorage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function hasValidUploadedFileSignature(bytes, mimeType) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/gif") return ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"));
  if (mimeType === "image/webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (mimeType === "audio/wav") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WAVE";
  if (mimeType === "audio/ogg") return bytes.subarray(0, 4).toString("ascii") === "OggS";
  if (mimeType === "audio/mp4") return bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp";
  if (mimeType === "audio/aac") return bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xf6) === 0xf0;
  if (mimeType === "audio/mpeg") return bytes.subarray(0, 3).toString("ascii") === "ID3" || (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  return false;
}

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "audio/mpeg", "audio/mp4", "audio/aac", "audio/ogg", "audio/wav",
]);

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin.authorized) return NextResponse.json({ error: admin.error }, { status: admin.status, headers: { "Cache-Control": "no-store" } });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be between 1 byte and 20 MB." }, { status: 413 });
    }

    const { data: connection, error } = await supabaseAdmin.from("df_storage_connections")
      .select("drive_root_folder_id").eq("singleton", true).maybeSingle();
    if (error) throw error;
    if (!connection?.drive_root_folder_id) {
      return NextResponse.json({ error: "Central Google Drive is not connected." }, { status: 409 });
    }

    const accessToken = await getGoogleDriveAccessToken();
    const fileBytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidUploadedFileSignature(fileBytes, file.type)) {
      return NextResponse.json({ error: "The selected file does not match its declared file type." }, { status: 415 });
    }
    const storedSlot = file.type.startsWith("image/") ? "image" : "audio";
    const uploaded = await uploadDriveFile({
      accessToken,
      file: new File([fileBytes], "upload", { type: file.type }),
      folderId: connection.drive_root_folder_id,
      slot: storedSlot,
    });
    return NextResponse.json({
      success: true,
      file: {
        id: uploaded.id,
        name: uploaded.name,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        webViewLink: uploaded.webViewLink || null,
      },
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Central Drive upload failed:", error);
    return NextResponse.json({ error: "Upload to central Google Drive failed." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
