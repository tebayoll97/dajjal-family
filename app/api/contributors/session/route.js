import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { BLOG_PRIVATE_HEADERS, blogError } from "@/lib/blog/auth";
export const dynamic = "force-dynamic";
export async function GET(request) {
 const match=/^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization")||"");
 if(!match)return blogError("Session required.",401);
 const {data,error}=await supabaseAdmin.auth.getUser(match[1]);
 if(error||!data?.user?.id)return blogError("Invalid session.",401);
 const {data:contributor,error:lookupError}=await supabaseAdmin.from("df_contributors")
  .select("id,display_name,email,slug,status,must_change_password,public_profile_enabled")
  .eq("account_user_id",data.user.id).maybeSingle();
 if(lookupError)return blogError("Unable to verify contributor account.",500);
 if(!contributor||contributor.status!=="active")return blogError("Contributor access is not active.",403);
 const {data:permissions,error:permissionError}=await supabaseAdmin.from("df_contributor_permissions")
  .select("permission_key").eq("contributor_id",contributor.id).eq("enabled",true);
 if(permissionError)return blogError("Unable to load contributor permissions.",500);
 await supabaseAdmin.from("df_contributors").update({last_seen_at:new Date().toISOString()}).eq("id",contributor.id);
 return Response.json({success:true,contributor,permissions:(permissions||[]).map(x=>x.permission_key)},{headers:BLOG_PRIVATE_HEADERS});
}