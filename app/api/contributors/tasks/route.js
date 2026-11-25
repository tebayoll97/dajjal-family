import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError } from "@/lib/blog/auth";
export const dynamic="force-dynamic";
export async function GET(request){
 const auth=await verifyBlogUser(request);
 if(!auth.ok)return blogError(auth.error,auth.status);
 if(!auth.contributor?.id)return blogError("Contributor profile not found.",404);
 const {data,error}=await supabaseAdmin.from("df_contributor_tasks").select("id,module_key,title,description,status,priority,due_at,created_at,updated_at").eq("contributor_id",auth.contributor.id).order("updated_at",{ascending:false}).limit(100);
 if(error)return blogError("Unable to load assigned tasks.",500);
 return Response.json({success:true,tasks:data||[]},{headers:BLOG_PRIVATE_HEADERS});
}