import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { findOrCreateDriveFolder, getGoogleDriveAccessToken, uploadDriveFile } from "@/lib/googleDriveStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function hasValidImageSignature(bytes, mimeType) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin.authorized) {
    return NextResponse.json({ error: admin.error }, { status: admin.status, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "A valid image file is required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WebP images are supported." }, { status: 415, headers: { "Cache-Control": "no-store" } });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image size must be between 1 byte and 20 MB." }, { status: 413, headers: { "Cache-Control": "no-store" } });
    }

    const { data: connection, error: connectionError } = await supabaseAdmin.from("df_storage_connections")
      .select("drive_root_folder_id").eq("singleton", true).maybeSingle();
    if (connectionError) throw connectionError;
    if (!connection?.drive_root_folder_id) {
      return NextResponse.json({ error: "Central Google Drive is not connected." }, { status: 409, headers: { "Cache-Control": "no-store" } });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageSignature(bytes, file.type)) {
      return NextResponse.json({ error: "The image content does not match its declared file type." }, { status: 415, headers: { "Cache-Control": "no-store" } });
    }

    const accessToken = await getGoogleDriveAccessToken();
    const toolsFolder = await findOrCreateDriveFolder({
      accessToken,
      name: "TOOLS",
      parentId: connection.drive_root_folder_id,
    });
    const generatorFolder = await findOrCreateDriveFolder({
      accessToken,
      name: "GENERATOR PIXEL",
      parentId: toolsFolder.id,
    });
    const uploaded = await uploadDriveFile({
      accessToken,
      file: new File([bytes], file.name || "pixel-bio-image", { type: file.type }),
      folderId: generatorFolder.id,
      slot: "image",
    });

    return NextResponse.json({
      success: true,
      file: {
        id: uploaded.id,
        name: uploaded.name,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
      },
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Pixel Bio Drive upload failed:", error);
    return NextResponse.json({ error: "Unable to save the image to central Google Drive." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
