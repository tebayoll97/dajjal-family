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

function hasValidImageSignature(bytes, mimeType) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/gif") return bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a";
  if (mimeType === "image/webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
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
    const imageBytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageSignature(imageBytes, file.type)) return errorJson("The selected file does not match its image type.", 415);
    const slotLabels = {
      cover: "cover",
      male_portrait: "male-portrait",
      female_portrait: "female-portrait",
      gallery_1: "gallery-01",
      gallery_2: "gallery-02",
      gallery_3: "gallery-03",
      gallery_4: "gallery-04",
      gallery_5: "gallery-05",
      gallery_6: "gallery-06",
    };
    const uploadFile = new File([imageBytes], "upload", { type: file.type });
    uploaded = await uploadDriveFile({
      accessToken,
      file: uploadFile,
      folderId: profileFolder.id,
      slot: slotLabels[slotKey],
    });

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
