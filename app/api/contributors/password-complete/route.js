import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { BLOG_PRIVATE_HEADERS, blogError } from "@/lib/blog/auth";
export const dynamic="force-dynamic";
export async function POST(request){
 const match=/^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization")||"");
 if(!match)return blogError("Session required.",401);
 const {data,error}=await supabaseAdmin.auth.getUser(match[1]);
 if(error||!data?.user?.id)return blogError("Invalid session.",401);
 const {data:contributor,error:lookupError}=await supabaseAdmin.from("df_contributors").select("id,status,must_change_password").eq("account_user_id",data.user.id).maybeSingle();
 if(lookupError||!contributor||contributor.status!=="active")return blogError("Contributor account not found.",403);
 const {error:updateError}=await supabaseAdmin.from("df_contributors").update({must_change_password:false,activated_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",contributor.id);
 if(updateError)return blogError("Password changed, but account activation could not be completed. Contact Admin.",500);
 await supabaseAdmin.from("df_contributor_activity_logs").insert({contributor_id:contributor.id,actor_user_id:data.user.id,module_key:"account",action_key:"password_changed"});
 return Response.json({success:true},{headers:BLOG_PRIVATE_HEADERS});
}