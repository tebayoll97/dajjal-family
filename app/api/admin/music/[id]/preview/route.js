import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGoogleDriveAccessToken } from "@/lib/googleDriveStorage";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request,{params}){
 const auth=await verifyAdmin(request);if(!auth.authorized)return Response.json({error:auth.error},{status:auth.status});
 const {id}=await params;const {data,error}=await supabaseAdmin.from("df_music_library").select("audio_drive_file_id,audio_mime_type,audio_size_bytes").eq("id",id).maybeSingle();
 if(error||!data)return Response.json({error:"Music record not found."},{status:404});
 try{
  const token=await getGoogleDriveAccessToken();
  const headers={Authorization:"Bearer "+token};const range=request.headers.get("range");if(range)headers.Range=range;
  const upstream=await fetch("https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(data.audio_drive_file_id)+"?alt=media",{headers,cache:"no-store",signal:AbortSignal.timeout(30000)});
  if(!upstream.ok&&upstream.status!==206)return Response.json({error:"Unable to stream audio preview."},{status:upstream.status});
  const out=new Headers({"Content-Type":data.audio_mime_type,"Cache-Control":"private, no-store","Accept-Ranges":"bytes"});
  for(const name of ["content-length","content-range"])if(upstream.headers.get(name))out.set(name,upstream.headers.get(name));
  return new Response(upstream.body,{status:upstream.status,headers:out});
 }catch(error){console.error("Music preview failed:",error);return Response.json({error:"Music preview unavailable."},{status:502});}
}
