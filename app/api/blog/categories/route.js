import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const dynamic="force-dynamic";
export async function GET(){const{data,error}=await supabaseAdmin.from("df_blog_categories").select("id,slug,name_id,name_en").eq("is_active",true).order("sort_order",{ascending:true});if(error)return Response.json({success:false,error:"Unable to load categories."},{status:500,headers:{"Cache-Control":"no-store"}});return Response.json({success:true,categories:data||[]},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=900"}});}
