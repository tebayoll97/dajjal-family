import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { createOAuthState, googleDriveAuthorizationUrl } from "@/lib/googleDriveStorage";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const admin = await verifyAdmin(request);
  if (!admin.authorized) return NextResponse.json({ error: admin.error }, { status: admin.status, headers: { "Cache-Control": "no-store" } });

  try {
    const state = createOAuthState(admin.user.id);
    const response = NextResponse.json({ url: googleDriveAuthorizationUrl(state.value) }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set("df-google-drive-oauth-state", state.value, {
      httpOnly: true, secure: true, sameSite: "lax", path: "/api/storage/google/callback", maxAge: 600,
    });
    return response;
  } catch (error) {
    console.error("Google Drive OAuth initialization failed:", error);
    return NextResponse.json({ error: "Google Drive OAuth is not configured on the server yet." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
