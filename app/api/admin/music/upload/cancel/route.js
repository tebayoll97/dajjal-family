import { verifyAdmin } from "@/lib/adminAuth";
import { cancelMusicDriveUpload } from "@/lib/musicDriveUpload";
export const dynamic = "force-dynamic";
export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const { token } = await request.json();
    const canceled = await cancelMusicDriveUpload(token);
    return Response.json({ success: true, canceled }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ success: false, canceled: false, warning: "Upload cleanup could not be confirmed; inspect Google Drive." }, { status: 202 });
  }
}
