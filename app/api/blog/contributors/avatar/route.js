import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS } from "@/lib/blog/auth";
import { findOrCreateDriveFolder, getGoogleDriveAccessToken, uploadDriveFile, makeDriveFilePubliclyReadable, deleteDriveFile } from "@/lib/googleDriveStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_AVATAR_SIZE = 8 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const fail = (error, status = 400) => NextResponse.json({ success: false, error }, { status, headers: BLOG_PRIVATE_HEADERS });

function validSignature(bytes, type) {
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (type === "image/webp") return bytes.length >= 12 && bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP";
  return false;
}

export async function POST(request) {
  const auth = await verifyBlogUser(request, { approved: true });
  if (!auth.ok) return fail(auth.error, auth.status);
  if (!auth.contributor?.id || !auth.user?.id) return fail("Contributor profile was not found.", 404);
  let form;
  try { form = await request.formData(); } catch { return fail("Invalid upload form."); }
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") return fail("Choose an avatar image first.");
  if (!TYPES.has(file.type)) return fail("Use a JPG, PNG, or WEBP image.", 415);
  if (file.size < 1 || file.size > MAX_AVATAR_SIZE) return fail("Avatar image must be between 1 byte and 8 MB.", 413);
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!validSignature(bytes, file.type)) return fail("The selected file does not match its image type.", 415);

  let accessToken;
  let uploaded;
  try {
    const { data: connection, error: connectionError } = await supabaseAdmin.from("df_storage_connections")
      .select("drive_root_folder_id").eq("singleton", true).maybeSingle();
    if (connectionError) throw connectionError;
    if (!connection?.drive_root_folder_id) return fail("Central Google Drive is not connected.", 409);
    accessToken = await getGoogleDriveAccessToken();
    const blogFolder = await findOrCreateDriveFolder({ accessToken, name: "BLOG", parentId: connection.drive_root_folder_id });
    const authorsFolder = await findOrCreateDriveFolder({ accessToken, name: "AUTHORS", parentId: blogFolder.id });
    const authorFolder = await findOrCreateDriveFolder({ accessToken, name: auth.contributor.display_name, parentId: authorsFolder.id });
    const image = new File([bytes], "avatar", { type: file.type });
    uploaded = await uploadDriveFile({ accessToken, file: image, folderId: authorFolder.id, slot: auth.contributor.slug });
    await makeDriveFilePubliclyReadable({ accessToken, fileId: uploaded.id });
    const avatarUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(uploaded.id)}&sz=w512`;
    const { data, error } = await supabaseAdmin.from("df_blog_contributors")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", auth.contributor.id).eq("account_user_id", auth.user.id)
      .select("id,display_name,slug,avatar_url").single();
    if (error || !data) {
      await deleteDriveFile({ accessToken, fileId: uploaded.id }).catch(cleanup => console.error("Blog avatar orphan cleanup failed:", cleanup));
      throw error || new Error("Unable to save avatar reference.");
    }
    return NextResponse.json({ success: true, contributor: data }, { status: 201, headers: BLOG_PRIVATE_HEADERS });
  } catch (error) {
    if (uploaded?.id) await deleteDriveFile({ accessToken, fileId: uploaded.id }).catch(cleanup => console.error("Blog avatar cleanup failed:", cleanup));
    console.error("Blog contributor avatar upload failed:", error);
    return fail("Avatar upload failed. Check the Google Drive connection and sharing policy, then try again.", 500);
  }
}
