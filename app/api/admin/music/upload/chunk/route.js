import { verifyAdmin } from "@/lib/adminAuth";
import { sendMusicDriveChunk, validateMusicFileSignature } from "@/lib/musicDriveUpload";
export const dynamic = "force-dynamic";
export async function PUT(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const token = request.headers.get("x-music-upload-token");
    const range = request.headers.get("content-range") || "";
    const match = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(range);
    if (!match) return Response.json({ error: "Invalid Content-Range." }, { status: 400 });
    const start = Number(match[1]), end = Number(match[2]), total = Number(match[3]);
    const bytes = Buffer.from(await request.arrayBuffer());
    if (bytes.length > 4 * 1024 * 1024 || bytes.length !== end - start + 1) return Response.json({ error: "Invalid chunk size." }, { status: 413 });
    if (start === 0 && !validateMusicFileSignature(bytes, request.headers.get("x-file-mime") || "")) return Response.json({ error: "File signature does not match its declared type." }, { status: 415 });
    const result = await sendMusicDriveChunk({ token, bytes, start, end });
    return Response.json({ success: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error.message || "Upload chunk failed." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
