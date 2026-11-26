import { verifyAdmin } from "@/lib/adminAuth";
import { beginMusicDriveUpload } from "@/lib/musicDriveUpload";
export const dynamic = "force-dynamic";
export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json();
    const token = await beginMusicDriveUpload({ name: body.name, mimeType: body.mimeType, size: Number(body.size), slot: body.slot });
    return Response.json({ success: true, token, chunkSize: 4 * 1024 * 1024 }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to start upload." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
