"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {useLanguage} from "@/app/components/LanguageProvider";
import {COUPLE_CONTENT_DEFAULTS} from "@/lib/coupleProfileDefaults";
import CoupleProfileView from "@/app/components/CoupleProfileView";
export default function PublicCoupleProfilePage(){
 const{slug}=useParams(),{language}=useLanguage(),locale=language==="en"?"en":"id";
 const[data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{let active=true;fetch(`/api/couple/${slug}?locale=${locale}`,{cache:"no-store"}).then(async r=>{const v=await r.json();if(!r.ok)throw Error(v.error||"Unable to load profile.");return v}).then(v=>{if(active)setData(v)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[slug,locale]);
 if(error)return <main className="df-couple-profile-page"><div className="df-couple-shell"><h1>{locale==="en"?"Couple Profile not found":"Profil Couple tidak ditemukan"}</h1></div></main>;
 if(!data)return <main className="df-couple-profile-page"><div className="df-couple-shell">{locale==="en"?"Loading...":"Memuat..."}</div></main>;
 return <CoupleProfileView profile={data.profile} content={{...COUPLE_CONTENT_DEFAULTS[locale],...(data.content?.content||{})}} media={data.media||[]} locale={locale}/>;
}
