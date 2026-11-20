import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const dynamic = "force-dynamic";
function error(message,status){return Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}});}
const FIELDS="id,music_id,title,artist,genre,description,mood,tags,language,audio_mime_type,audio_size_bytes,audio_duration_seconds,cover_mime_type,status,published_at,created_at,updated_at";
export async function GET(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return error(auth.error,auth.status);
 const url=new URL(request.url),search=(url.searchParams.get("q")||"").trim().slice(0,120),status=url.searchParams.get("status")||"all",genre=(url.searchParams.get("genre")||"").trim().slice(0,80),sort=url.searchParams.get("sort")||"recent";
 const allowed=["all","published","draft","archived"],sortMap={recent:["created_at",false],updated:["updated_at",false],title_asc:["title",true],title_desc:["title",false],duration:["audio_duration_seconds",true],size:["audio_size_bytes",false]};
 if(!allowed.includes(status)||!sortMap[sort])return error("Invalid catalog filter.",400);
 let query=supabaseAdmin.from("df_music_library").select(FIELDS).order(sortMap[sort][0],{ascending:sortMap[sort][1]}).limit(200);
 if(status!=="all")query=query.eq("status",status);if(genre)query=query.eq("genre",genre);
 if(search){const safe=search.replace(/[,%()]/g," ");query=query.or("title.ilike.%"+safe+"%,artist.ilike.%"+safe+"%,music_id.ilike.%"+safe+"%,genre.ilike.%"+safe+"%");}
 const {data,error:dbError}=await query;if(dbError){console.error("Music catalog query failed:",dbError);return error("Music catalog is not ready. Check the approved database migration.",503);}
 return Response.json({success:true,items:data||[]},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request){
 const auth=await verifyAdmin(request);if(!auth.authorized)return error(auth.error,auth.status);
 const body=await request.json().catch(()=>null);if(!body)return error("Invalid request body.");
 const title=String(body.title||"").trim(),genre=String(body.genre||"").trim(),duration=Number(body.durationSeconds),size=Number(body.audio?.size);
 if(!title||title.length>160||!genre||genre.length>80)return error("Title and Genre are required.");
 if(!body.audio?.id||!Number.isSafeInteger(size)||size<1||size>52428800||!Number.isInteger(duration)||duration<1||duration>900)return error("Valid audio file and duration (maximum 15 minutes) are required.");
 const mime=String(body.audio.mimeType||"");if(!["audio/mpeg","audio/mp4","audio/aac","audio/ogg","audio/wav"].includes(mime))return error("Unsupported audio format.");
 const now=new Date().toISOString();
 const payload={title,genre,artist:String(body.artist||"").trim().slice(0,160)||null,description:String(body.description||"").trim().slice(0,2000)||null,mood:String(body.mood||"").trim().slice(0,80)||null,tags:Array.isArray(body.tags)?body.tags.map(x=>String(x).trim()).filter(Boolean).slice(0,20):[],language:String(body.language||"").trim().slice(0,40)||null,audio_drive_file_id:String(body.audio.id),audio_original_name:String(body.audio.originalName||"").slice(0,255),audio_mime_type:mime,audio_size_bytes:size,audio_duration_seconds:duration,cover_drive_file_id:body.cover?.id||null,cover_mime_type:body.cover?.mimeType||null,cover_size_bytes:body.cover?.size||null,rights_holder:String(body.rightsHolder||"").trim().slice(0,160)||null,rights_source:String(body.rightsSource||"").trim().slice(0,500)||null,rights_license_notes:String(body.rightsNotes||"").trim().slice(0,1000)||null,created_by:auth.user.id,updated_by:auth.user.id,created_at:now,updated_at:now,status:"draft"};
 const {data,error:dbError}=await supabaseAdmin.from("df_music_library").insert(payload).select(FIELDS).single();
 if(dbError){console.error("Music create failed:",dbError);return error("Audio was uploaded, but catalog save failed. Keep the Drive upload details for recovery.",503);}
 return Response.json({success:true,item:data},{status:201,headers:{"Cache-Control":"no-store"}});
}
