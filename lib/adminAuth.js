import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function verifyAdmin(request) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const bearerMatch = /^Bearer ([^\s]+)$/i.exec(authorization);

    if (!bearerMatch) {
      return {
        authorized: false,
        status: 401,
        error: "Unauthorized.",
      };
    }

    const token = bearerMatch[1];

    // Verify the token with Supabase Auth; never trust client profile metadata.
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authData?.user?.id) {
      return {
        authorized: false,
        status: 401,
        error: "Invalid session.",
      };
    }

    // Resolve administrator membership from the protected server-side table
    // on every request. Do not cache this authorization decision.
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Admin verification error:", adminError);
      return {
        authorized: false,
        status: 500,
        error: "Unable to verify administrator.",
      };
    }

    if (!admin || admin.user_id !== authData.user.id) {
      return {
        authorized: false,
        status: 403,
        error: "Access denied. Admin privileges required.",
      };
    }

    return {
      authorized: true,
      user: authData.user,
    };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return {
      authorized: false,
      status: 500,
      error: "Internal server error.",
    };
  }
}
