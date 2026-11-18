import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";
import {
  deleteDriveFile,
  findOrCreateDriveFolder,
  getGoogleDriveAccessToken,
  uploadDriveFile,
} from "@/lib/googleDriveStorage";
import { COUPLE_MEDIA_SLOTS } from "@/lib/coupleProfileDefaults";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const errorJson = (error, status = 400) => NextResponse.json(
  { error },
  { status, headers: { "Cache-Control": "no-store" } },
);

function safeFileName(value, mimeType) {
  const extension = ({ "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" })[mimeType];
  const base = String(value || "couple-photo")
    .replace(/[\\/\\\\\u0000-\\u001f\\u007f]/g, "-")
    .replace(/\\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .trim()
    .slice(0, 90) || "couple-photo";
  return `${base}${extension}`;
}

export async function POST(request, context) {
  const auth = await resolveAuthenticatedPlayer(request);
  if (!auth.ok) return errorJson(auth.error, auth.status);

  const { slug } = await context.params;
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return errorJson("Invalid Couple Profile URL.", 400);
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("df_couple_profiles")
    .select("id,slug")
    .eq("slug", slug)
    .eq("owner_player_id", auth.player.id)
    .maybeSingle();
  if (profileError) return errorJson("Unable to verify profile ownership.", 500);
  if (!profile) return errorJson("Couple Profile not found.", 404);

  let form;
  try { form = await request.formData(); } catch { return errorJson("Invalid upload form.", 400); }
  const file = form.get("file");
  const slotKey = form.get("slotKey");
  if (!file || typeof file.arrayBuffer !== "function") return errorJson("Choose an image first.", 400);
  if (!COUPLE_MEDIA_SLOTS.includes(slotKey)) return errorJson("Invalid image slot.", 400);
  if (!ALLOWED_TYPES.has(file.type)) return errorJson("Use JPG, PNG, WEBP, or GIF images.", 415);
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) return errorJson("Image size must be between 1 byte and 12 MB.", 413);

  let accessToken;
  let uploaded;
  try {
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from("df_storage_connections")
      .select("drive_root_folder_id")
      .eq("singleton", true)
      .maybeSingle();
    if (connectionError) throw connectionError;
    if (!connection?.drive_root_folder_id) return errorJson("Central Google Drive is not connected.", 409);

    accessToken = await getGoogleDriveAccessToken();
    const coupleRoot = await findOrCreateDriveFolder({
      accessToken,
      name: "Couple Profile",
      parentId: connection.drive_root_folder_id,
    });
    const profileFolder = await findOrCreateDriveFolder({
      accessToken,
      name: slug,
      parentId: coupleRoot.id,
    });
    const uploadFile = new File([await file.arrayBuffer()], safeFileName(file.name, file.type), { type: file.type });
    uploaded = await uploadDriveFile({ accessToken, file: uploadFile, folderId: profileFolder.id });

    const { error: saveError } = await supabaseAdmin.from("df_couple_media").upsert({
      couple_id: profile.id,
      slot_key: slotKey,
      google_drive_file_id: uploaded.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "couple_id,slot_key" });
    if (saveError) {
      try { await deleteDriveFile({ accessToken, fileId: uploaded.id }); }
      catch (cleanupError) { console.error("Couple Drive orphan cleanup failed:", cleanupError); }
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      media: { slot_key: slotKey, google_drive_file_id: uploaded.id },
      file: { name: uploaded.name, mimeType: uploaded.mimeType, size: uploaded.size },
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Couple Profile image upload failed:", error);
    return errorJson("Upload foto gagal. Silakan coba lagi.", 500);
  }
}
