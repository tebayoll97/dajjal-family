"use client";
import {useEffect,useMemo,useState} from "react";
import CoupleMusicPlayer from "@/app/components/CoupleMusicPlayer";
import {coupleDriveImage,COUPLE_GALLERY_SLOTS} from "@/lib/coupleProfileDefaults";
function durationSince(date){if(!date)return[0,0,0,0];const s=Math.max(0,Math.floor((Date.now()-new Date(date+"T00:00:00").getTime())/1000));return[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];}
function EditableValue({value,label,editable,multiline,onSave}){
 const[open,setOpen]=useState(false),[draft,setDraft]=useState(value||""),[saving,setSaving]=useState(false),[saveError,setSaveError]=useState("");
 useEffect(()=>setDraft(value||""),[value]);
 async function commit(){setSaving(true);setSaveError("");try{await onSave(draft);setOpen(false)}catch(e){setSaveError(e.message||"Save failed.")}finally{setSaving(false)}}
 return <span className="df-couple-editable">{open?<span className="df-couple-inline-editor">{multiline?<textarea aria-label={label} value={draft} onChange={e=>setDraft(e.target.value)} rows={4}/>:<input aria-label={label} value={draft} onChange={e=>setDraft(e.target.value)} maxLength={label.toLowerCase().includes("name")?40:300}/>}<span className="df-couple-inline-actions"><button type="button" onClick={commit} disabled={saving}>{saving?"…":"Save"}</button><button type="button" className="df-couple-edit-cancel" onClick={()=>{setDraft(value||"");setOpen(false)}}>×</button></span>{saveError&&<small role="alert">{saveError}</small>}</span>:<>{value|| (editable?"—":"")}{editable&&<button type="button" className="df-couple-edit-trigger" aria-label={"Edit "+label} title={"Edit "+label} onClick={()=>setOpen(true)}>✎</button>}</>}</span>;
}
function EditableImage({fileId,label,editable,onSave,className=""}){
 const[open,setOpen]=useState(false),[draft,setDraft]=useState(fileId||""),[saving,setSaving]=useState(false),[saveError,setSaveError]=useState("");
 useEffect(()=>setDraft(fileId||""),[fileId]);
 async function commit(){setSaving(true);setSaveError("");try{await onSave(draft.trim());setOpen(false)}catch(e){setSaveError(e.message||"Save failed.")}finally{setSaving(false)}}
 return <div className={"df-couple-image-edit "+className}>{fileId?<img className={className.includes("featured")?"df-couple-featured-background":""} src={coupleDriveImage(fileId,1200)} alt={label} loading="lazy"/>:editable?<div className="df-couple-image-empty">{label} · Add image</div>:null}
 {editable&&<button type="button" className="df-couple-edit-trigger df-couple-image-edit-trigger" onClick={()=>setOpen(v=>!v)} aria-label={"Edit "+label}>✎</button>}
 {open&&<div className="df-couple-image-input"><label>{label} · Google Drive File ID<input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Paste Google Drive File ID"/></label><div className="df-couple-inline-actions"><button type="button" onClick={commit} disabled={saving}>{saving?"…":"Save"}</button><button type="button" className="df-couple-edit-cancel" onClick={()=>setOpen(false)}>Cancel</button></div>{saveError&&<small role="alert">{saveError}</small>}</div>}</div>;
}
export default function CoupleProfileView({profile,content,media=[],locale="id",editable=false,onSave}){
 const en=locale==="en",[time,setTime]=useState([0,0,0,0]),[lightbox,setLightbox]=useState(null);
 const mediaMap=useMemo(()=>Object.fromEntries(media.map(x=>[x.slot_key,x.google_drive_file_id])),[media]);
 const gallery=COUPLE_GALLERY_SLOTS.map((slot,index)=>({slot,index,fileId:mediaMap[slot]||""}));
 const filled=gallery.filter(x=>x.fileId),units=en?["Days","Hours","Minutes","Seconds"]:["Hari","Jam","Menit","Detik"];
 useEffect(()=>{const update=()=>setTime(durationSince(profile.anniversary_date));update();const id=window.setInterval(update,1000);return()=>window.clearInterval(id)},[profile.anniversary_date]);
 useEffect(()=>{if(!lightbox)return;const fn=e=>{if(e.key==="Escape")setLightbox(null)};window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn)},[lightbox]);
 const saveContent=(key,value)=>onSave?.({content:{...content,[key]:value}});
 const saveProfile=(key,value)=>onSave?.({profile:{[key]:value}});
 const saveMedia=(slot,value)=>onSave?.({media:{...mediaMap,[slot]:value}});
 const field=(key,label,multiline=false)=><EditableValue value={content[key]} label={label} editable={editable} multiline={multiline} onSave={v=>saveContent(key,v)}/>;
 return <main className="df-couple-profile-page"><div className="df-couple-shell">
  <header className="df-couple-hero" id="couple-home">
   <p className="df-couple-eyebrow">DAJJAL FAMILY · COUPLE PROFILE</p>
   <h1 className="df-couple-title"><EditableValue value={profile.male_nickname} label="Male name" editable={editable} onSave={v=>saveProfile("maleNickname",v)}/><span className="df-couple-connector" aria-hidden="true">×</span><EditableValue value={profile.female_nickname} label="Female name" editable={editable} onSave={v=>saveProfile("femaleNickname",v)}/></h1>
   <p className="df-couple-subtitle">{field("subtitle","Subtitle")}</p><p className="df-couple-intro">{field("intro","Introduction",true)}</p>
   <EditableImage fileId={mediaMap.cover} label="Cover image" editable={editable} onSave={v=>saveMedia("cover",v)} className="df-couple-featured-photo"/>
   <div className="df-couple-anniversary-heading"><p className="df-couple-eyebrow">{field("anniversary_label","Anniversary label")}</p></div>
   {profile.anniversary_date&&<section className="df-couple-metrics" aria-label="Anniversary">{time.map((v,i)=><div className="df-couple-metric" key={units[i]}><strong>{v.toLocaleString(en?"en-US":"id-ID")}</strong><span>{units[i]}</span></div>)}</section>}
   {editable&&<div className="df-couple-anniversary-edit"><label>{en?"Anniversary date":"Tanggal anniversary"}<input type="date" value={profile.anniversary_date||""} onChange={e=>onSave?.({profile:{anniversaryDate:e.target.value}})}/></label></div>}
  </header>
  <CoupleMusicPlayer/>
  <section className="df-couple-section" id="couple-identities"><div className="df-couple-section-heading"><p className="df-couple-eyebrow">{en?"THE COUPLE":"IDENTITAS PASANGAN"}</p><h2>{profile.male_nickname} &amp; {profile.female_nickname}</h2></div>
   <div className="df-couple-character-grid">
    <article className="df-couple-character-card" data-character="dajjal"><div className="df-couple-character-heading"><p className="df-couple-character-role">{field("male_role","Male role")}</p></div><div className="df-couple-character-body"><EditableImage fileId={mediaMap.male_portrait} label="Male portrait" editable={editable} onSave={v=>saveMedia("male_portrait",v)} className="df-couple-character-art"/><div className="df-couple-character-copy"><h3>{profile.male_nickname}</h3><p>{field("male_description","Male description",true)}</p></div></div></article>
    <article className="df-couple-character-card" data-character="veylora"><div className="df-couple-character-heading"><p className="df-couple-character-role">{field("female_role","Female role")}</p></div><div className="df-couple-character-body"><EditableImage fileId={mediaMap.female_portrait} label="Female portrait" editable={editable} onSave={v=>saveMedia("female_portrait",v)} className="df-couple-character-art"/><div className="df-couple-character-copy"><h3>{profile.female_nickname}</h3><p>{field("female_description","Female description",true)}</p></div></div></article>
   </div>
  </section>
  <section className="df-couple-gallery" id="couple-gallery"><div className="df-couple-section-heading"><p className="df-couple-eyebrow">{en?"MEMORIES":"KENANGAN"}</p><h2>{en?"Our Gallery":"Galeri Kita"}</h2><p className="df-couple-gallery-intro">{en?"Six moments, kept close.":"Enam momen yang ingin selalu dikenang."}</p></div>
   <div className="df-couple-gallery-group"><div className="df-couple-moments-carousel"><div className="df-couple-moments-controls"><span className="df-couple-moments-count">{String(filled.length).padStart(2,"0")} / 06</span><span className="df-couple-moments-count">{en?"Up to 6 photos":"Maksimal 6 foto"}</span></div>
    <div className="df-couple-moments-track">{gallery.map(({slot,index,fileId})=>fileId?<button className="df-couple-gallery-item" type="button" key={slot} onClick={()=>setLightbox({src:coupleDriveImage(fileId,1800),alt:(en?"Memory ":"Kenangan ")+(index+1)})}><img src={coupleDriveImage(fileId,600)} alt={(en?"Memory ":"Kenangan ")+(index+1)} loading="lazy"/><span>{en?"Memory ":"Kenangan "}{index+1}</span></button>:editable?<div className="df-couple-gallery-add" key={slot}><EditableImage fileId="" label={(en?"Gallery photo ":"Foto galeri ")+(index+1)} editable onSave={v=>saveMedia(slot,v)}/></div>:null)}</div>
   </div></div>
  </section>
  <section className="df-couple-story" id="couple-story"><div className="df-couple-story-symbol" aria-hidden="true">♡</div><div className="df-couple-story-copy"><p className="df-couple-eyebrow">{en?"OUR STORY":"CERITA KITA"}</p><h2>{field("story_title","Story title")}</h2><p>{field("story_text","Story text",true)}</p><span className="df-couple-signature">{field("signature","Signature",true)}</span></div></section>
  <footer className="df-couple-footer"><span>{en?"Made with love":"Dibuat dengan cinta"}</span><span>DAJJAL FAMILY UNIVERSE</span></footer>
 </div>
 <nav className="df-couple-bottom-nav" aria-label={en?"Couple navigation":"Navigasi Couple"}><a className="df-couple-bottom-nav-item" href="#couple-home"><span>⌂</span><span>{en?"Home":"Awal"}</span></a><a className="df-couple-bottom-nav-item" href="#couple-identities"><span>♡</span><span>{en?"Profile":"Profil"}</span></a><button className="df-couple-bottom-nav-music" type="button" onClick={()=>window.dispatchEvent(new CustomEvent("df-couple-music-toggle"))} aria-label={en?"Toggle music":"Putar/jeda musik"}>♫</button><a className="df-couple-bottom-nav-item" href="#couple-gallery"><span>▧</span><span>{en?"Gallery":"Galeri"}</span></a><a className="df-couple-bottom-nav-item" href="#couple-story"><span>▤</span><span>{en?"Story":"Kisah"}</span></a></nav>
 {lightbox&&<div className="df-couple-lightbox" role="presentation" onClick={()=>setLightbox(null)}><button type="button" className="df-couple-lightbox-backdrop" aria-label="Close image"/><div className="df-couple-lightbox-panel" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><button className="df-couple-lightbox-close" type="button" onClick={()=>setLightbox(null)} aria-label="Close">×</button><img src={lightbox.src} alt={lightbox.alt}/><p>{lightbox.alt}</p></div></div>}
 </main>;
}
