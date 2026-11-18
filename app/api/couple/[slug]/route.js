import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {resolveAuthenticatedPlayer} from "@/lib/serverPlayerAccount";
import {COUPLE_CONTENT_KEYS,COUPLE_MEDIA_SLOTS} from "@/lib/coupleProfileDefaults";
export const dynamic="force-dynamic";
const errorJson=(error,status=400)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
async function getParams(context){return await context.params;}
export async function GET(request,context){
 const {slug}=await getParams(context),locale=new URL(request.url).searchParams.get("locale")==="en"?"en":"id";
 const {data:profile,error}=await supabaseAdmin.from("df_couple_profiles").select("id,male_nickname,female_nickname,slug,anniversary_date,is_published,created_at").eq("slug",slug).eq("is_published",true).maybeSingle();
 if(error)return errorJson("Unable to load Couple Profile.",500);if(!profile)return errorJson("Couple Profile not found.",404);
 const [{data:content,error:ce},{data:media,error:me}]=await Promise.all([
  supabaseAdmin.from("df_couple_contents").select("locale,content,seo_title,seo_description").eq("couple_id",profile.id).eq("locale",locale).maybeSingle(),
  supabaseAdmin.from("df_couple_media").select("slot_key,google_drive_file_id").eq("couple_id",profile.id).order("slot_key")
 ]);
 if(ce||me)return errorJson("Unable to load Couple Profile details.",500);
 return NextResponse.json({profile,content:content||null,media:media||[]},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}});
}
export async function PATCH(request,context){
 const auth=await resolveAuthenticatedPlayer(request);if(!auth.ok)return errorJson(auth.error,auth.status);
 const {slug}=await getParams(context);
 const {data:profile,error:oe}=await supabaseAdmin.from("df_couple_profiles").select("id").eq("slug",slug).eq("owner_player_id",auth.player.id).maybeSingle();
 if(oe)return errorJson("Unable to verify profile ownership.",500);if(!profile)return errorJson("Couple Profile not found.",404);
 let body;try{body=await request.json()}catch{return errorJson("Invalid JSON body.");}
 if(body.locale!=="id"&&body.locale!=="en")return errorJson("Invalid locale.");
 const update={updated_at:new Date().toISOString()};
 for(const [key,col] of [["maleNickname","male_nickname"],["femaleNickname","female_nickname"]]){
  if(body[key]!==undefined){if(typeof body[key]!=="string"||body[key].trim().length<1||body[key].trim().length>40)return errorJson("Invalid nickname.");update[col]=body[key].trim();}
 }
 if(body.anniversaryDate!==undefined){if(body.anniversaryDate!==null&&(typeof body.anniversaryDate!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(body.anniversaryDate)))return errorJson("Invalid anniversary date.");update.anniversary_date=body.anniversaryDate;}
 if(Object.keys(update).length>1){const {error}=await supabaseAdmin.from("df_couple_profiles").update(update).eq("id",profile.id);if(error)return errorJson("Unable to save profile details.",500);}
 if(body.content!==undefined){
  if(!body.content||typeof body.content!=="object"||Array.isArray(body.content))return errorJson("Content object is required.");
  const clean={};for(const key of COUPLE_CONTENT_KEYS){if(Object.prototype.hasOwnProperty.call(body.content,key)){const v=body.content[key];if(typeof v!=="string"||v.length>3000)return errorJson("Invalid content field.");clean[key]=v.trim();}}
  if(Object.keys(clean).length!==Object.keys(body.content).length)return errorJson("Unsupported content field.");
  const {error}=await supabaseAdmin.from("df_couple_contents").upsert({couple_id:profile.id,locale:body.locale,content:clean,updated_at:new Date().toISOString()},{onConflict:"couple_id,locale"});
  if(error)return errorJson("Unable to save Couple Profile content.",500);
 }
 if(body.media!==undefined){
  if(!Array.isArray(body.media)||body.media.length>COUPLE_MEDIA_SLOTS.length)return errorJson("Invalid media list.");
  const rows=[],submitted=new Set();
  for(const item of body.media){if(!COUPLE_MEDIA_SLOTS.includes(item?.slotKey)||submitted.has(item.slotKey)||typeof item?.googleDriveFileId!=="string"||!/^[A-Za-z0-9_-]{10,200}$/.test(item.googleDriveFileId.trim()))return errorJson("Invalid image reference.");submitted.add(item.slotKey);rows.push({couple_id:profile.id,slot_key:item.slotKey,google_drive_file_id:item.googleDriveFileId.trim(),updated_at:new Date().toISOString()});}
  if(rows.length){const {error}=await supabaseAdmin.from("df_couple_media").upsert(rows,{onConflict:"couple_id,slot_key"});if(error)return errorJson("Unable to save image references.",500);}
  for(const slot of COUPLE_MEDIA_SLOTS){if(!submitted.has(slot)){const {error}=await supabaseAdmin.from("df_couple_media").delete().eq("couple_id",profile.id).eq("slot_key",slot);if(error)return errorJson("Unable to update image references.",500);}}
 }
 return NextResponse.json({success:true},{headers:{"Cache-Control":"no-store"}});
}
export async function DELETE(request,context){
 const auth=await resolveAuthenticatedPlayer(request);if(!auth.ok)return errorJson(auth.error,auth.status);
 const {slug}=await getParams(context);
 const {data,error}=await supabaseAdmin.from("df_couple_profiles").delete().eq("slug",slug).eq("owner_player_id",auth.player.id).select("id").maybeSingle();
 if(error)return errorJson("Unable to reset Couple Profile.",500);if(!data)return errorJson("Couple Profile not found.",404);
 return NextResponse.json({success:true},{headers:{"Cache-Control":"no-store"}});
}
