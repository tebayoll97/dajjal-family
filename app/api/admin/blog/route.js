import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";
import { BLOG_OWNER_USER_ID } from "@/lib/blog/auth";
import { revalidatePath,revalidateTag } from "next/cache";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"private, no-store, max-age=0, must-revalidate"};
const fail=(message,status=400)=>Response.json({success:false,error:message},{status,headers:HEADERS});
export async function GET(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return fail(auth.error,auth.status);
 const [contributors,articles,categories]=await Promise.all([
  supabaseAdmin.from("df_contributors").select("id,account_user_id,display_name,email,status,created_at,invited_at,public_profile_enabled,slug").order("created_at",{ascending:false}).limit(200),
  supabaseAdmin.from("df_blog_articles").select("id,title_id,title_en,slug_id,slug_en,status,published_at,updated_at,df_contributors(display_name,email)").order("updated_at",{ascending:false}).limit(200),
  supabaseAdmin.from("df_blog_categories").select("id,slug,name_id,name_en,is_active,sort_order").order("sort_order",{ascending:true})
 ]);
 const error=contributors.error||articles.error||categories.error;if(error)return fail("Unable to load Blog administration data.",500);
 const items=(contributors.data||[]).map(c=>({...c,status:c.status==="active"?"approved":c.status==="invited"?"pending":c.status==="inactive"?"rejected":c.status}));
 return Response.json({success:true,contributors:items,articles:articles.data||[],categories:categories.data||[]},{headers:HEADERS});
}
export async function PATCH(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return fail(auth.error,auth.status);
 const body=await request.json().catch(()=>({}));
 if(body.type==="contributor"){
  const {data:target}=await supabaseAdmin.from("df_contributors").select("account_user_id").eq("id",body.id).maybeSingle();
  if(target?.account_user_id===BLOG_OWNER_USER_ID)return fail("The permanent Blog Owner role cannot be changed or suspended.",403);
  const statusMap={approved:"active",pending:"invited",rejected:"inactive",suspended:"suspended"};
  if(!statusMap[body.status])return fail("Invalid contributor status.");
  const {data,error}=await supabaseAdmin.from("df_contributors").update({status:statusMap[body.status],updated_at:new Date().toISOString()}).eq("id",body.id).select("id,status").maybeSingle();
  if(error||!data)return fail("Unable to update contributor status.",500);
  return Response.json({success:true,item:{...data,status:data.status==="active"?"approved":data.status==="invited"?"pending":data.status==="inactive"?"rejected":data.status}},{headers:HEADERS});
 }
 if(body.type==="article"){
  if(!["published","draft","archived"].includes(body.status))return fail("Invalid article status.");
  if(body.status==="published")return fail("Publish this article from the Contributor Blog Studio so Gemini can generate and validate both language versions.",409);
  const {data,error}=await supabaseAdmin.from("df_blog_articles").update({status:body.status,updated_at:new Date().toISOString()}).eq("id",body.id).select("id,status,published_at").maybeSingle();
  if(error||!data)return fail("Unable to update article status.",500);
  revalidateTag("df-blog-public");revalidatePath("/sitemap.xml");return Response.json({success:true,item:data},{headers:HEADERS});
 }
 if(body.type==="category"){
  const nameId=String(body.name_id||"").trim().slice(0,80),slug=String(body.slug||"").toLowerCase().trim();
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!nameId)return fail("Provide a valid category name and URL slug.",422);
  const record={slug,name_id:nameId,name_en:String(body.name_en||nameId).trim().slice(0,80),is_active:body.is_active!==false,sort_order:Number.isInteger(body.sort_order)?body.sort_order:0};
  const query=body.id?supabaseAdmin.from("df_blog_categories").update(record).eq("id",body.id):supabaseAdmin.from("df_blog_categories").insert(record);
  const {data,error}=await query.select("id,slug,name_id,name_en,is_active,sort_order").single();
  if(error)return fail(error.code==="23505"?"Category slug already exists.":"Unable to save category.",error.code==="23505"?409:500);
  revalidateTag("df-blog-public");return Response.json({success:true,item:data},{headers:HEADERS});
 }
 return fail("Unsupported Blog administration action.",422);
}
export async function DELETE(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return fail(auth.error,auth.status);
 const body=await request.json().catch(()=>({}));if(body.type!=="category"||!body.id)return fail("Invalid category deletion request.",422);
 const {error}=await supabaseAdmin.from("df_blog_categories").delete().eq("id",body.id);
 if(error)return fail("Unable to delete category. Articles may still reference it.",409);
 revalidateTag("df-blog-public");return Response.json({success:true},{headers:HEADERS});
}