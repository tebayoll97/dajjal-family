import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";
import { slugifyBlogTitle } from "@/lib/blog/auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"private, no-store, max-age=0, must-revalidate"};
const fail=(error,status=400)=>Response.json({success:false,error},{status,headers:HEADERS});
const ALLOWED=new Set(["blog.access","blog.article.create","blog.article.edit_own","blog.article.publish","lyrics.access","lyrics.timestamp.edit","lyrics.timestamp.submit","tasks.view"]);
export async function POST(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return fail(auth.error,auth.status);
 const body=await request.json().catch(()=>({}));
 const email=String(body.email||"").trim().toLowerCase(),displayName=String(body.display_name||"").trim().slice(0,80);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return fail("Provide a valid contributor email.",422);
 if(!displayName)return fail("Contributor display name is required.",422);
 const permissions=[...new Set((Array.isArray(body.permissions)?body.permissions:[]).filter(x=>ALLOWED.has(x)))];
 if(!permissions.length)return fail("Select at least one contributor permission.",422);
 const temporaryPassword=randomBytes(32).toString("base64url")+"aA1!";
 const {data:created,error:createError}=await supabaseAdmin.auth.admin.createUser({email,password:temporaryPassword,email_confirm:true,user_metadata:{full_name:displayName,account_type:"contributor"}});
 if(createError||!created?.user?.id)return fail(createError?.message||"Unable to create the authentication account.",createError?.status||500);
 const user=created.user,base=slugifyBlogTitle(displayName)||"contributor",slug=(base+"-"+user.id.replace(/-/g,"").slice(0,8)).slice(0,100);
 const {data:contributor,error:profileError}=await supabaseAdmin.from("df_contributors").insert({
  account_user_id:user.id,display_name:displayName,email,slug,status:"active",must_change_password:true,
  public_profile_enabled:true,invited_by:auth.user.id,invited_at:new Date().toISOString()
 }).select("id,display_name,email,slug,status,created_at").single();
 if(profileError||!contributor){
  await supabaseAdmin.auth.admin.deleteUser(user.id).catch(()=>{});
  return fail(profileError?.code==="23505"?"This email or contributor profile already exists.":"Unable to create the contributor profile.",profileError?.code==="23505"?409:500);
 }
 const grants=permissions.map(permission_key=>({contributor_id:contributor.id,permission_key,enabled:true,granted_by:auth.user.id}));
 const {error:permissionError}=await supabaseAdmin.from("df_contributor_permissions").insert(grants);
 if(permissionError){
  await supabaseAdmin.from("df_contributors").delete().eq("id",contributor.id);
  await supabaseAdmin.auth.admin.deleteUser(user.id).catch(()=>{});
  return fail("Contributor permissions could not be saved. Account creation was rolled back.",500);
 }
 await supabaseAdmin.from("df_contributor_activity_logs").insert({contributor_id:contributor.id,actor_user_id:auth.user.id,module_key:"contributors",action_key:"account_created",details:{permissions}});
 return Response.json({success:true,contributor,permissions,temporary_password:temporaryPassword,password_notice:"This password is shown once. Copy it now and send it privately; it is not stored in plaintext."},{status:201,headers:HEADERS});
}