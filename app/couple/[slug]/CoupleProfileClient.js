"use client";
import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import CoupleMusicPlayer from "@/app/components/CoupleMusicPlayer";
import { coupleDriveImage, COUPLE_CONTENT_DEFAULTS } from "@/lib/coupleProfileDefaults";

function countdown(date) {
  if(!date)return [0,0,0,0];
  const start=new Date(date+"T00:00:00").getTime();
  const seconds=Math.max(0,Math.floor((Date.now()-start)/1000));
  return [Math.floor(seconds/86400),Math.floor(seconds%86400/3600),Math.floor(seconds%3600/60),seconds%60];
}
export default function PublicCoupleProfilePage(){
  const {slug}=useParams();
  const {language}=useLanguage();
  const locale=language==="en"?"en":"id";
  const en=locale==="en";
  const [data,setData]=useState(null);
  const [time,setTime]=useState([0,0,0,0]);
  const [error,setError]=useState("");
  useEffect(()=>{let active=true;fetch(`/api/couple/${slug}?locale=${locale}`,{cache:"no-store"}).then(r=>r.json().then(v=>({r,v}))).then(({r,v})=>{if(!r.ok)throw new Error(v.error);if(active)setData(v)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[slug,locale]);
  useEffect(()=>{if(!data?.profile?.anniversary_date)return;const update=()=>setTime(countdown(data.profile.anniversary_date));update();const id=window.setInterval(update,1000);return()=>window.clearInterval(id)},[data]);
  if(error)return <main className="df-couple-page"><div className="df-couple-shell"><h1>{en?"Couple Profile not found":"Profil Couple tidak ditemukan"}</h1></div></main>;
  if(!data)return <main className="df-couple-page"><div className="df-couple-shell">{en?"Loading...":"Memuat..."}</div></main>;
  const {profile,media=[]}=data;
  const t={...COUPLE_CONTENT_DEFAULTS[locale],...(data.content?.content||{})};
  const images=Object.fromEntries(media.map(item=>[item.slot_key,coupleDriveImage(item.google_drive_file_id)]));
  const units=en?["Days","Hours","Minutes","Seconds"]:["Hari","Jam","Menit","Detik"];
  return <main className="df-couple-page" data-theme-palette="couple"><div className="df-couple-shell">
    <header className="df-couple-hero">
      <p className="df-couple-eyebrow">DAJJAL FAMILY · COUPLE PROFILE</p>
      <h1 className="df-couple-title"><span>{profile.male_nickname}</span><span className="df-couple-connector" aria-hidden="true">×</span><span>{profile.female_nickname}</span></h1>
      <p className="df-couple-subtitle">{t.subtitle}</p><p className="df-couple-intro">{t.intro}</p>
      {images.cover&&<div className="df-couple-featured-photo"><img className="df-couple-featured-background" src={images.cover} alt={profile.male_nickname+" and "+profile.female_nickname}/></div>}
      <p className="df-couple-eyebrow">{t.anniversary_label}</p>
      {profile.anniversary_date&&<section className="df-couple-metrics">{time.map((v,i)=><div className="df-couple-metric" key={units[i]}><strong>{v.toLocaleString(en?"en-US":"id-ID")}</strong><span>{units[i]}</span></div>)}</section>}
    </header>
    <CoupleMusicPlayer/>
    <section className="df-couple-section"><div className="df-couple-section-heading"><p className="df-couple-eyebrow">{en?"THE COUPLE":"IDENTITAS PASANGAN"}</p><h2>{profile.male_nickname} &amp; {profile.female_nickname}</h2></div>
      <div className="df-couple-character-grid">
        <article className="df-couple-character-card" data-character="dajjal"><div className="df-couple-character-heading"><p className="df-couple-character-role">{t.male_role}</p></div><div className="df-couple-character-body">{images.male_portrait&&<div className="df-couple-character-art"><img src={images.male_portrait} alt={profile.male_nickname}/></div>}<div className="df-couple-character-copy"><h3>{profile.male_nickname}</h3><p>{t.male_description}</p></div></div></article>
        <article className="df-couple-character-card" data-character="veylora"><div className="df-couple-character-heading"><p className="df-couple-character-role">{t.female_role}</p></div><div className="df-couple-character-body">{images.female_portrait&&<div className="df-couple-character-art"><img src={images.female_portrait} alt={profile.female_nickname}/></div>}<div className="df-couple-character-copy"><h3>{profile.female_nickname}</h3><p>{t.female_description}</p></div></div></article>
      </div>
    </section>
    <section className="df-couple-section"><div className="df-couple-section-heading"><p className="df-couple-eyebrow">OUR LITTLE STORY</p><h2>{t.story_title}</h2></div><p className="df-couple-story-text">{t.story_text}</p><p className="df-couple-signature">{t.signature}</p></section>
    <footer className="df-couple-footer">DAJJAL FAMILY · COUPLE PROFILE</footer>
  </div></main>;
}
