import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createDriveRootFolder, exchangeGoogleCode, getGoogleAccountEmail,
  saveDriveConnection, verifyOAuthState,
} from "@/lib/googleDriveStorage";

export const dynamic = "force-dynamic";

function finish(request, status) {
  const url = new URL("/admin/storage", request.url);
  url.searchParams.set("google_drive", status);
  const response = NextResponse.redirect(url);
  response.cookies.set("df-google-drive-oauth-state", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/api/storage/google/callback", maxAge: 0 });
  return response;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateValue = url.searchParams.get("state");
  const cookieState = request.cookies.get("df-google-drive-oauth-state")?.value;
  if (url.searchParams.has("error")) return finish(request, "denied");
  if (!code || !stateValue || !cookieState || stateValue !== cookieState) return finish(request, "invalid_state");

  let state;
  try { state = verifyOAuthState(stateValue); } catch { return finish(request, "configuration_error"); }
  if (!state) return finish(request, "invalid_state");

  try {
    const { data: admin, error: adminError } = await supabaseAdmin.from("admin_users")
      .select("user_id").eq("user_id", state.adminId).maybeSingle();
    if (adminError || !admin) return finish(request, "unauthorized");

    const tokenData = await exchangeGoogleCode(code);
    const email = await getGoogleAccountEmail(tokenData.access_token);
    const rootFolder = await createDriveRootFolder(tokenData.access_token);
    await saveDriveConnection({ adminId: state.adminId, tokenData, rootFolder, email });
    return finish(request, "connected");
  } catch (error) {
    console.error("Google Drive OAuth callback failed:", error);
    return finish(request, "connection_failed");
  }
}
