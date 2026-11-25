import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const BLOG_OWNER_USER_ID="448532d5-a990-4173-804c-93daa72d1dc4";
export const BLOG_OWNER_DISPLAY_NAME="Tebayoll";
async function isPermanentBlogOwner(user){
 if(!user?.id||user.id!==BLOG_OWNER_USER_ID||!user.email_confirmed_at)return false;
 const {data,error}=await supabaseAdmin.from("admin_users").select("user_id").eq("user_id",BLOG_OWNER_USER_ID).maybeSingle();
 if(error){console.error("Blog Owner membership verification failed:",error);return false;}
 return data?.user_id===BLOG_OWNER_USER_ID;
}
export async function verifyBlogUser(request,{approved=false}={}){
 const match=/^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization")||"");
 if(!match)return{ok:false,status:401,error:"Session required."};
 const {data,error}=await supabaseAdmin.auth.getUser(match[1]);
 if(error||!data?.user?.id||!data.user.email)return{ok:false,status:401,error:"Invalid session."};
 const isOwner=await isPermanentBlogOwner(data.user);
 if(data.user.id===BLOG_OWNER_USER_ID&&!isOwner)return{ok:false,status:403,error:"Permanent Blog Owner authorization could not be verified."};
 const {data:contributor,error:contributorError}=await supabaseAdmin.from("df_contributors")
  .select("id,account_user_id,display_name,slug,email,status,bio_id,bio_en,avatar_url,must_change_password,public_profile_enabled")
  .eq("account_user_id",data.user.id).maybeSingle();
 if(contributorError)return{ok:false,status:500,error:"Unable to verify contributor."};
 if(!contributor)return{ok:false,status:403,error:"This account is not registered as a contributor."};
 if(contributor.status!=="active")return{ok:false,status:403,error:"Contributor access is not active."};
 if(contributor.must_change_password)return{ok:false,status:428,error:"Change your temporary password before accessing Contributor modules."};
 let permissions=[];
 if(!isOwner){
  const {data:rows,error:permissionError}=await supabaseAdmin.from("df_contributor_permissions").select("permission_key").eq("contributor_id",contributor.id).eq("enabled",true);
  if(permissionError)return{ok:false,status:500,error:"Unable to verify contributor permissions."};
  permissions=(rows||[]).map(row=>row.permission_key);
 }
 if(approved&&!isOwner&&!permissions.includes("blog.access"))return{ok:false,status:403,error:"Blog module access is not assigned to this account."};
 return{ok:true,user:data.user,contributor,isOwner,ownerName:isOwner?BLOG_OWNER_DISPLAY_NAME:null,permissions};
}
export function hasContributorPermission(auth,key){return Boolean(auth?.isOwner||auth?.permissions?.includes(key));}
export const BLOG_PRIVATE_HEADERS={"Cache-Control":"private, no-store, max-age=0, must-revalidate",Vary:"Authorization"};
export function blogError(message,status=400){return Response.json({success:false,error:message},{status,headers:BLOG_PRIVATE_HEADERS});}
export function slugifyBlogTitle(value){return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,90);}
