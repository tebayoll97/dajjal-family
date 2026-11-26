import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/adminAuth";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"private, no-store, max-age=0, must-revalidate"};
const fail=(error,status=400)=>Response.json({success:false,error},{status,headers:HEADERS});
const STATUSES=new Set(["assigned","accepted","in_progress","submitted","revision_requested","completed","cancelled"]);
export async function GET(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return fail(auth.error,auth.status);
 const {data,error}=await supabaseAdmin.from("df_contributor_tasks").select("id,contributor_id,module_key,title,description,status,priority,due_at,created_at,updated_at,df_contributors(display_name,email)").order("updated_at",{ascending:false}).limit(100);
 if(error)return fail("Unable to load contributor tasks.",500);
 return Response.json({success:true,tasks:data||[]},{headers:HEADERS});
}
export async function POST(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return fail(auth.error,auth.status);
 const body=await request.json().catch(()=>({}));
 const contributorId=String(body.contributor_id||""),moduleKey=String(body.module_key||""),title=String(body.title||"").trim().slice(0,180),description=String(body.description||"").trim().slice(0,5000),priority=String(body.priority||"normal");
 if(!contributorId||!["blog","platform"].includes(moduleKey)||!title||!["low","normal","high","urgent"].includes(priority))return fail("Provide a contributor, module, task title, and valid priority.",422);
 const {data:contributor,error:lookupError}=await supabaseAdmin.from("df_contributors").select("id,status").eq("id",contributorId).maybeSingle();
 if(lookupError||!contributor||contributor.status!=="active")return fail("Choose an active contributor.",404);
 if(moduleKey==="blog"){
  const required="blog.access";
  const {data:grant,error:grantError}=await supabaseAdmin.from("df_contributor_permissions").select("id").eq("contributor_id",contributorId).eq("permission_key",required).eq("enabled",true).maybeSingle();
  if(grantError)return fail("Unable to verify module access.",500);
  if(!grant)return fail("The contributor does not have access to the selected module.",403);
 }
 let dueAt=null;if(body.due_at){const d=new Date(body.due_at);if(Number.isNaN(d.getTime()))return fail("Invalid due date.",422);dueAt=d.toISOString();}
 const {data:task,error}=await supabaseAdmin.from("df_contributor_tasks").insert({contributor_id:contributorId,module_key:moduleKey,title,description:description||null,priority,due_at:dueAt,assigned_by:auth.user.id}).select("id,contributor_id,module_key,title,description,status,priority,due_at,created_at").single();
 if(error)return fail("Unable to assign contributor task.",500);
 await supabaseAdmin.from("df_contributor_activity_logs").insert({contributor_id:contributorId,actor_user_id:auth.user.id,module_key:moduleKey,action_key:"task_assigned",target_type:"contributor_task",target_id:task.id});
 return Response.json({success:true,task},{status:201,headers:HEADERS});
}
export async function PATCH(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return fail(auth.error,auth.status);
 const body=await request.json().catch(()=>({}));
 if(typeof body.id!=="string"||!STATUSES.has(body.status))return fail("Invalid task status update.",422);
 const {data:task,error}=await supabaseAdmin.from("df_contributor_tasks").update({status:body.status,completed_at:body.status==="completed"?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",body.id).select("id,contributor_id,module_key,status").maybeSingle();
 if(error||!task)return fail("Unable to update task status.",404);
 await supabaseAdmin.from("df_contributor_activity_logs").insert({contributor_id:task.contributor_id,actor_user_id:auth.user.id,module_key:task.module_key,action_key:"task_status_changed",target_type:"contributor_task",target_id:task.id,details:{status:task.status}});
 return Response.json({success:true,task},{headers:HEADERS});
}