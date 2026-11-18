"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import { coupleDriveImage, COUPLE_CONTENT_DEFAULTS, COUPLE_MEDIA_SLOTS } from "@/lib/coupleProfileDefaults";

const fields = [
  ["subtitle","Subtitle"],["intro","Introduction"],["male_role","Male role"],["male_description","Male description"],
  ["female_role","Female role"],["female_description","Female description"],["story_title","Story title"],["story_text","Story text"],
  ["signature","Signature"],["anniversary_label","Anniversary label"],
];

export default function CoupleProfileEditorPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const en = language === "en";
  const [profile,setProfile] = useState(null);
  const [locale,setLocale] = useState(language === "en" ? "en" : "id");
  const [content,setContent] = useState(COUPLE_CONTENT_DEFAULTS[language === "en" ? "en" : "id"]);
  const [media,setMedia] = useState({cover:"",male_portrait:"",female_portrait:""});
  const [anniversary,setAnniversary] = useState("");
  const [editing,setEditing] = useState(false);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [confirmReset,setConfirmReset] = useState(false);

  async function load() {
    const {data:{session}} = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }
    const own = await fetch("/api/couple",{headers:{Authorization:`Bearer ${session.access_token}`},cache:"no-store"});
    const ownData = await own.json();
    if (!own.ok || !ownData.profile || ownData.profile.slug !== slug) { router.replace("/app/create-profile-couple"); return; }
    setProfile(ownData.profile);
    setAnniversary(ownData.profile.anniversary_date || "");
    const response = await fetch(`/api/couple/${slug}?locale=${locale}`,{cache:"no-store"});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load profile.");
    setContent(data.content?.content || COUPLE_CONTENT_DEFAULTS[locale]);
    setMedia(Object.fromEntries(COUPLE_MEDIA_SLOTS.map(slot=>[slot,data.media?.find(item=>item.slot_key===slot)?.google_drive_file_id || ""])));
  }

  useEffect(()=>{let active=true; load().catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[slug,locale]);

  async function save() {
    setSaving(true);setError("");
    try {
      const {data:{session}}=await supabase.auth.getSession();
      if(!session)throw new Error("Session expired.");
      const response=await fetch(`/api/couple/${slug}`,{
        method:"PATCH",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({locale,content,media:COUPLE_MEDIA_SLOTS.filter(slot=>media[slot].trim()).map(slot=>({slotKey:slot,googleDriveFileId:media[slot].trim()})),anniversaryDate:anniversary || null})
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || "Save failed.");
      setEditing(false);
    }catch(e){setError(e.message)}finally{setSaving(false)}
  }

  async function resetProfile() {
    setSaving(true);setError("");
    try {
      const {data:{session}}=await supabase.auth.getSession();
      if(!session)throw new Error("Session expired.");
      const response=await fetch(`/api/couple/${slug}`,{method:"DELETE",headers:{Authorization:`Bearer ${session.access_token}`}});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || "Reset failed.");
      router.replace("/app/create-profile-couple");
    }catch(e){setError(e.message);setSaving(false)}
  }

  if(loading)return <main className="df-couple-editor"><p>{en?"Loading editor...":"Memuat editor..."}</p></main>;
  if(!profile)return <main className="df-couple-editor"><p>{error}</p></main>;
  return <main className="df-couple-editor">
    <section className="df-couple-editor-card">
      <p className="df-couple-editor-eyebrow">COUPLE PROFILE EDITOR</p>
      <h1>{profile.male_nickname} × {profile.female_nickname}</h1>
      <p>{en?"Public profile URL":"URL profil publik"}: <a href={`/${locale}/couple/${slug}`} target="_blank" rel="noreferrer">dajjalfamily.com/{locale}/couple/{slug}</a></p>
      <div className="df-couple-editor-toolbar">
        <button type="button" className="secondary" onClick={()=>setLocale(locale==="id"?"en":"id")}>{locale==="id"?"English":"Bahasa Indonesia"}</button>
        <button type="button" onClick={()=>setEditing(v=>!v)}>{editing?(en?"Cancel edit":"Batal edit"):(en?"Edit content":"Edit konten")}</button>
      </div>
      <label>{en?"Anniversary date":"Tanggal anniversary"}<input type="date" disabled={!editing} value={anniversary} onChange={e=>setAnniversary(e.target.value)} /></label>
      {fields.map(([key,label])=><label key={key}>{en?label:({subtitle:"Subjudul",intro:"Perkenalan",male_role:"Peran laki-laki",male_description:"Deskripsi laki-laki",female_role:"Peran perempuan",female_description:"Deskripsi perempuan",story_title:"Judul cerita",story_text:"Cerita pasangan",signature:"Kalimat penutup",anniversary_label:"Label anniversary"}[key])}
        {key.endsWith("text")||key==="intro"||key.endsWith("description")?<textarea disabled={!editing} rows={4} value={content[key]||""} onChange={e=>setContent(v=>({...v,[key]:e.target.value}))}/>:<input disabled={!editing} value={content[key]||""} onChange={e=>setContent(v=>({...v,[key]:e.target.value}))}/>}
      </label>)}
      <h2>{en?"Main image references":"Referensi foto utama"}</h2>
      <p>{en?"Paste Google Drive file IDs. This template has no interactive gallery or voice note.":"Tempel Google Drive File ID. Template ini tidak memiliki galeri interaktif atau voice note."}</p>
      {COUPLE_MEDIA_SLOTS.map(slot=><label key={slot}>{({cover:en?"Cover image":"Foto cover",male_portrait:en?"Male portrait":"Potret laki-laki",female_portrait:en?"Female portrait":"Potret perempuan"})[slot]}
        <input disabled={!editing} value={media[slot]} onChange={e=>setMedia(v=>({...v,[slot]:e.target.value}))} placeholder="Google Drive File ID"/>
        {media[slot] && <img className="df-couple-media-preview" src={coupleDriveImage(media[slot],480)} alt={slot.replace("_"," ")}/>}
      </label>)}
      {error&&<p className="df-couple-error" role="alert">{error}</p>}
      {editing&&<button type="button" disabled={saving} onClick={save}>{saving?(en?"Saving...":"Menyimpan..."):(en?"Save changes":"Simpan perubahan")}</button>}
      <div className="df-couple-reset-area">
        {confirmReset ? <><p>{en?"This permanently deletes all Couple Profile data and frees its URL. Your DAJJAL FAMILY account and original Google Drive files remain untouched.":"Ini akan menghapus seluruh data Couple Profile dan membebaskan URL-nya. Akun DAJJAL FAMILY dan file asli Google Drive tetap aman."}</p><button className="danger" type="button" disabled={saving} onClick={resetProfile}>{en?"Confirm reset":"Ya, reset profil"}</button><button className="secondary" type="button" onClick={()=>setConfirmReset(false)}>{en?"Cancel":"Batal"}</button></> : <button className="danger" type="button" onClick={()=>setConfirmReset(true)}>{en?"Reset Couple Profile":"Reset Couple Profile"}</button>}
      </div>
    </section>
  </main>;
}
