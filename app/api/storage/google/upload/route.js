import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGoogleDriveAccessToken, uploadDriveFile } from "@/lib/googleDriveStorage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
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
    const uploaded = await uploadDriveFile({
      accessToken,
      file,
      folderId: connection.drive_root_folder_id,
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
