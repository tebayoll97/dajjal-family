import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyBlogUser, BLOG_PRIVATE_HEADERS, blogError } from "@/lib/blog/auth";
export const dynamic="force-dynamic";
const allowed=new Set(["image/jpeg","image/png","image/webp","image/gif"]);
function validImage(bytes,type){
 if(type==="image/jpeg")return bytes.length>3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(type==="image/png")return bytes.length>8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 if(type==="image/gif")return bytes.length>6&&String.fromCharCode(...bytes.slice(0,6)).match(/^GIF8[79]a$/);
 if(type==="image/webp")return bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
 return false;
}
export async function POST(request){
 const auth=await verifyBlogUser(request,{approved:true});if(!auth.ok)return blogError(auth.error,auth.status);
 const form=await request.formData().catch(()=>null);const file=form?.get("file");
 if(!file||typeof file.arrayBuffer!=="function")return blogError("Select an image file.",422);
 if(file.size<1||file.size>8*1024*1024||!allowed.has(file.type))return blogError("Image must be JPEG, PNG, WEBP, or GIF and no larger than 8 MB.",422);
 const bytes=new Uint8Array(await file.arrayBuffer());if(!validImage(bytes,file.type))return blogError("Image content does not match its file type.",422);
 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"}[file.type];
 const path=`${auth.contributor.id}/${crypto.randomUUID()}.${ext}`;
 const {error}=await supabaseAdmin.storage.from("df-blog-media").upload(path,bytes,{contentType:file.type,cacheControl:"31536000",upsert:false});
 if(error){console.error("Blog media upload failed:",error);return blogError("Unable to upload the image.",500);}
 const {data}=supabaseAdmin.storage.from("df-blog-media").getPublicUrl(path);
 return Response.json({success:true,url:data.publicUrl,path},{status:201,headers:BLOG_PRIVATE_HEADERS});
}
