import { verifyAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
};

export async function GET(request) {
  const result = await verifyAdmin(request);

  if (!result.authorized) {
    return Response.json(
      { error: result.error },
      { status: result.status, headers: PRIVATE_HEADERS }
    );
  }

  return Response.json({
    success: true,
    admin: {
      id: result.user.id,
      email: result.user.email,
    },
  }, { headers: PRIVATE_HEADERS });
}
