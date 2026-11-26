import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const admin = await verifyAdmin(request);
  if (!admin.authorized) return NextResponse.json({ error: admin.error }, { status: admin.status, headers: { "Cache-Control": "no-store" } });

  const { data, error } = await supabaseAdmin.from("df_storage_connections")
    .select("provider,account_email,drive_root_folder_id,connected_at,updated_at")
    .eq("singleton", true).maybeSingle();
  if (error) {
    console.error("Google Drive status lookup failed:", error);
    return NextResponse.json({ error: "Unable to read storage connection status." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({
    connected: Boolean(data),
    provider: data?.provider || null,
    accountEmail: data?.account_email || null,
    rootFolderReady: Boolean(data?.drive_root_folder_id),
    connectedAt: data?.connected_at || null,
  }, { headers: { "Cache-Control": "no-store" } });
}
