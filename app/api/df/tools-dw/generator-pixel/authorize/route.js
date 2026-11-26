import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin.authorized) {
    return NextResponse.json(
      { success: false, error: admin.error },
      { status: admin.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { success: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
