"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabaseAdminClient} from "@/lib/supabaseAdminClient";
import {useLanguage} from "@/app/components/LanguageProvider";
import "../music.css";
export default function AddMusicPage(){
 const router=useRouter(),{language}=useLanguage(),id=language==="id";
 const [token,setToken]=useState(""),[checking,setChecking]=useState(true),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[notice,setNotice]=useState(""),[coverWarning,setCoverWarning]=useState(false);
 const [title,setTitle]=useState(""),[artist,setArtist]=useState(""),[genre,setGenre]=useState(""),[description,setDescription]=useState(""),[mood,setMood]=useState(""),[tags,setTags]=useState(""),[lang,setLang]=useState(""),[holder,setHolder]=useState(""),[source,setSource]=useState(""),[notes,setNotes]=useState("");
 const [audio,setAudio]=useState(null),[cover,setCover]=useState(null),[duration,setDuration]=useState(0),[uploadToken,setUploadToken]=useState(""),[uploadController,setUploadController]=useState(null);
 useEffect(()=>{let active=true;(async()=>{try{const {data}=await supabaseAdminClient.auth.getSession();if(!data?.session){router.replace("/admin/login");return;}const res=await fetch("/api/admin/me",{headers:{Authorization:"Bearer "+data.session.access_token},cache:"no-store"});if(!res.ok){router.replace("/admin/login");return;}if(active)setToken(data.session.access_token);}catch{if(active)setNotice("Admin session check failed.");}finally{if(active)setChecking(false);}})();return()=>{active=false;};},[router]);
 function chooseAudio(file){setAudio(file);setDuration(0);if(!file)return;const url=URL.createObjectURL(file),el=document.createElement("audio");el.preload="metadata";el.onloadedmetadata=()=>{if(Number.isFinite(el.duration))setDuration(Math.ceil(el.duration));URL.revokeObjectURL(url);};el.onerror=()=>URL.revokeObjectURL(url);el.src=url;}
 async function upload(file,slot){
  const start=await fetch("/api/admin/music/upload/start",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({name:file.name,mimeType:file.type,size:file.size,slot})});
  const init=await start.json();if(!start.ok)throw new Error(init.error||"Upload could not start.");
  const chunkSize=init.chunkSize||4194304;let offset=0,last=null;const controller=new AbortController();setUploadToken(init.token);setUploadController(controller);
  while(offset<file.size){const end=Math.min(offset+chunkSize,file.size),chunk=file.slice(offset,end);
   const res=await fetch("/api/admin/music/upload/chunk",{method:"PUT",headers:{Authorization:"Bearer "+token,"Content-Type":"application/octet-stream","Content-Range":"bytes "+offset+"-"+(end-1)+"/"+file.size,"X-Music-Upload-Token":init.token,"X-File-Mime":file.type},body:chunk,signal:controller.signal});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Upload failed.");offset=end;setProgress(Math.round(offset/file.size*100));if(data.complete)last=data.file;
  }
  if(!last)throw new Error("Upload completion was not confirmed.");setUploadToken("");setUploadController(null);
  return {id:last.id,mimeType:last.mimeType||file.type,size:Number(last.size)||file.size,originalName:file.name};
 }
 async function cancelUpload(){if(uploadController)uploadController.abort();if(uploadToken){await fetch("/api/admin/music/upload/cancel",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({token:uploadToken})}).catch(()=>{});setUploadToken("");}}
 async function submit(e){
  e.preventDefault();setNotice("");setCoverWarning(false);
  if(!audio||!duration||duration>900||audio.size>52428800){setNotice("Pilih audio valid. Durasi maksimal 15 menit dan ukuran maksimal 50 MB.");return;}
  if(!title.trim()||!genre.trim()){setNotice("Title dan Genre wajib diisi.");return;}
  if(!["audio/mpeg","audio/mp4","audio/aac","audio/ogg","audio/wav"].includes(audio.type)){setNotice("Format audio tidak didukung.");return;}
  setBusy(true);setProgress(0);
  try{
   const uploadedAudio=await upload(audio,"audio");let uploadedCover=null;
   if(cover){try{if(cover.size>5242880)throw new Error("Cover maksimal 5 MB.");uploadedCover=await upload(cover,"cover");}catch(err){setCoverWarning(true);}}
   const response=await fetch("/api/admin/music",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({title,artist,genre,description,mood,tags:tags.split(",").map(x=>x.trim()).filter(Boolean),language:lang,rightsHolder:holder,rightsSource:source,rightsNotes:notes,durationSeconds:duration,audio:uploadedAudio,cover:uploadedCover})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Could not save catalog record.");
   router.replace("/admin/music/"+result.item.id);
  }catch(err){if(uploadToken)await cancelUpload();setNotice(err.name==="AbortError"?"Upload canceled.":(err.message||"An error occurred."));}finally{setBusy(false);setProgress(0);setUploadController(null);}
 }
 if(checking)return <main className="music-page"><div className="music-state">Checking admin session...</div></main>;
 return <main className="music-page"><div className="music-shell music-form-shell">
  <header className="music-header"><div><Link href="/admin/music" className="music-back">← {id?"Kembali ke Music Library":"Back to Music Library"}</Link><p className="music-eyebrow">DAJJAL FAMILY / MUSIC</p><h1>{id?"Tambah Musik":"Add Music"}</h1><p className="music-subtitle">{id?"Unggah audio dan lengkapi metadata katalog.":"Upload audio and complete the catalog metadata."}</p></div></header>
  <form className="music-panel music-form" onSubmit={submit}>
   <div className="music-form-grid">
    <label className="music-field"><span>{id?"Judul":"Title"} *</span><input required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <label className="music-field"><span>Genre *</span><input required maxLength={80} value={genre} onChange={e=>setGenre(e.target.value)}/></label>
    <label className="music-field"><span>{id?"Artis / Kreator":"Artist / Creator"}</span><input value={artist} onChange={e=>setArtist(e.target.value)}/></label>
    <label className="music-field"><span>Mood</span><input value={mood} onChange={e=>setMood(e.target.value)}/></label>
    <label className="music-field"><span>{id?"Bahasa":"Language"}</span><input value={lang} onChange={e=>setLang(e.target.value)}/></label>
    <label className="music-field"><span>Tags (comma separated)</span><input value={tags} onChange={e=>setTags(e.target.value)}/></label>
    <label className="music-field music-field-full"><span>{id?"Deskripsi":"Description"}</span><textarea rows={3} maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)}/></label>
    <div className="music-field music-field-full"><span>{id?"File audio":"Audio file"} *</span><input type="file" accept=".mp3,.m4a,.aac,.wav,.ogg,audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/ogg" required onChange={e=>chooseAudio(e.target.files?.[0]||null)}/><small>MP3, M4A/AAC, WAV, OGG · Max 50 MB · Max 15 minutes</small>{audio&&<p className="music-file-meta">{audio.name} · {(audio.size/1048576).toFixed(1)} MB · {duration?Math.floor(duration/60)+":"+String(duration%60).padStart(2,"0"):"Reading duration..."}</p>}</div>
    <div className="music-field music-field-full"><span>{id?"Cover (opsional)":"Cover (optional)"}</span><input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={e=>setCover(e.target.files?.[0]||null)}/><small>JPG, PNG, WebP · Max 5 MB · Square recommended</small>{cover&&<p className="music-file-meta">{cover.name} · {(cover.size/1048576).toFixed(1)} MB</p>}</div>
   </div>
   <details className="music-optional"><summary>{id?"Catatan hak penggunaan":"Rights / attribution notes"}</summary><div className="music-form-grid">
    <label className="music-field"><span>{id?"Pemegang hak":"Rights holder"}</span><input value={holder} onChange={e=>setHolder(e.target.value)}/></label>
    <label className="music-field"><span>{id?"Sumber":"Source"}</span><input value={source} onChange={e=>setSource(e.target.value)}/></label>
    <label className="music-field music-field-full"><span>{id?"Lisensi / izin / atribusi":"License / permission / attribution"}</span><textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
   </div></details>
   {busy&&<div className="music-progress"><div><span>{id?"Mengunggah":"Uploading"}</span><strong>{progress}%</strong></div><progress value={progress} max="100"/></div>}
   {notice&&<div className="music-alert" role="alert">{notice}</div>}{coverWarning&&<div className="music-alert">{id?"Cover gagal diunggah. Track akan memakai cover default.":"Cover upload failed. The track will use the default cover."}</div>}
   <div className="music-form-actions"><Link href="/admin/music" className="music-secondary">{id?"Batal":"Cancel"}</Link>{busy&&<button type="button" className="music-secondary" onClick={cancelUpload}>Cancel upload</button>}<button className="music-primary" disabled={busy||!token}>{busy?(id?"Menyimpan...":"Saving..."):(id?"Simpan sebagai Draft":"Save as Draft")}</button></div>
  </form>
 </div></main>;
}
