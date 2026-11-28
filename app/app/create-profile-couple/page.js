"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {useLanguage} from "@/app/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";
import { Skeleton } from "@/app/components/ui/Skeleton";
export default function CreateCoupleProfilePage(){
 const router=useRouter(),{language}=useLanguage(),en=language==="en";
 const editorBasePath=withLocalePrefix("/df/profile-couple-maker",language);
 const[maleNickname,setMaleNickname]=useState(""),[femaleNickname,setFemaleNickname]=useState(""),[checkState,setCheckState]=useState("checking"),[saving,setSaving]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState(false);
 useEffect(()=>{let active=true;(async()=>{try{const{data:{session}}=await supabase.auth.getSession();if(!session){if(active)setCheckState("redirecting");router.replace("/login?next=" + encodeURIComponent(editorBasePath));return;}const r=await fetch("/api/couple",{headers:{Authorization:`Bearer ${session.access_token}`},cache:"no-store"});const v=await r.json();if(r.status===401){if(active)setCheckState("redirecting");router.replace("/login?next=" + encodeURIComponent(editorBasePath));return;}if(!r.ok)throw Error(v.error||"Unable to check profile.");if(v.profile?.slug){if(active)setCheckState("redirecting");router.replace(`${editorBasePath}/${encodeURIComponent(v.profile.slug)}`);return;}if(active)setCheckState("ready");}catch(e){if(active){setError(e.message||"Unable to check profile.");setCheckState("error");}}})();return()=>{active=false}},[editorBasePath,router]);
 async function submit(e){e.preventDefault();if(saving)return;setSaving(true);setError("");try{const{data:{session}}=await supabase.auth.getSession();if(!session){router.replace("/login");return;}const r=await fetch("/api/couple",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({maleNickname,femaleNickname})}),v=await r.json();if(r.status===409&&v.profile?.slug){router.replace(`${editorBasePath}/${encodeURIComponent(v.profile.slug)}`);return;}if(!r.ok)throw Error(v.error||"Unable to create profile.");setSuccess(true);window.setTimeout(()=>router.replace(`${editorBasePath}/${encodeURIComponent(v.profile.slug)}`),2200)}catch(e){setError(e.message)}finally{setSaving(false)}}
 if(checkState!=="ready")return (
  <main className="df-couple-create-page df-couple-create-checking" aria-busy={checkState!=="error"}>
   <section className="df-couple-create-card">
    <p className="df-couple-create-eyebrow">DAJJAL FAMILY · COUPLE PROFILE</p>
    <p className="df-couple-checking-status" role={checkState==="error"?"alert":"status"}>{checkState==="error"?(error||(en?"Unable to verify your Couple Profile.":"Tidak dapat memeriksa Couple Profile.")):checkState==="redirecting"?(en?"Opening your Couple Profile…":"Membuka Couple Profile…"):(en?"Checking your account and Couple Profile…":"Memeriksa akun dan Couple Profile...")}</p>
    {checkState==="error"?<button type="button" onClick={()=>window.location.reload()}>{en?"Try again":"Coba lagi"}</button>:<><Skeleton width="78%" height="2rem"/>
    <Skeleton count={2}/>
    <div className="df-couple-checking-fields">
     <Skeleton width="7rem" height=".8rem"/>
     <Skeleton variant="rect" height="2.9rem"/>
     <Skeleton width="8rem" height=".8rem"/>
     <Skeleton variant="rect" height="2.9rem"/>
    </div>
    <Skeleton variant="rect" height="2.9rem"/></>}
   </section>
  </main>
 );
 return <main className="df-couple-create-page"><section className="df-couple-create-card"><p className="df-couple-create-eyebrow">DAJJAL FAMILY · COUPLE PROFILE</p><h1>{en?"Create your Couple Profile":"Buat Couple Profile"}</h1><p>{en?"A personal page to celebrate your story together. Only one partner needs a DAJJAL FAMILY account.":"Halaman pribadi untuk merayakan cerita kalian. Hanya satu pasangan yang perlu memiliki akun DAJJAL FAMILY."}</p>{success?<div className="df-couple-create-success">{en?"Profile created. Opening your editor...":"Profil berhasil dibuat. Membuka editor..."}</div>:<form onSubmit={submit}><label>{en?"Male nickname":"Nickname laki-laki"}<input required maxLength={40} value={maleNickname} onChange={e=>setMaleNickname(e.target.value)} placeholder={en?"Enter nickname":"Masukkan nickname"}/></label><label>{en?"Female nickname":"Nickname perempuan"}<input required maxLength={40} value={femaleNickname} onChange={e=>setFemaleNickname(e.target.value)} placeholder={en?"Enter nickname":"Masukkan nickname"}/></label>{error&&<p className="df-couple-create-error" role="alert">{error}</p>}<button type="submit" disabled={saving}>{saving?(en?"Creating...":"Membuat..."):(en?"Create Couple Profile":"Buat Couple Profile")}</button></form>}</section></main>;
}
