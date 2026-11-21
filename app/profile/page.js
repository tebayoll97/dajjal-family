"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";
import AccountLogout from "../components/AccountLogout";

function Icon({ name }) {
  const paths = {
    at: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/></>,
    phone: <><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4m-3 13h2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"/></>
  };
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function GoogleIcon(){return <svg viewBox="0 0 48 48" width="24" height="24" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.7-.4-4H24v7.6h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.7 6.1-14.8Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.8a20 20 0 0 0 0 17.2l6.8-5.2Z"/><path fill="#EA4335" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"/></svg>}
function DiscordIcon(){return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M19.7 5.1a18 18 0 0 0-4.4-1.4l-.5 1a16.7 16.7 0 0 0-5.6 0l-.5-1a18 18 0 0 0-4.4 1.4C1.5 9.2.8 13.2 1.2 17.1a18 18 0 0 0 5.4 2.7l1.2-2a11 11 0 0 1-1.9-.9l.5-.4a12.8 12.8 0 0 0 11.2 0l.5.4a11 11 0 0 1-1.9.9l1.2 2a18 18 0 0 0 5.4-2.7c.5-4.5-.8-8.5-3.1-12ZM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>}
function LoadingIcon(){return <svg className="df-profile-loading-mark" viewBox="0 0 64 64" aria-label="Loading" role="img"><circle className="df-profile-loading-track" cx="32" cy="32" r="25"/><circle className="df-profile-loading-spinner" cx="32" cy="32" r="25"/><circle className="df-profile-loading-core" cx="32" cy="32" r="12"/></svg>}

export default function ProfilePage() {
 const router=useRouter();
 const {language}=useLanguage();
 const id=language==="id";
 const [player,setPlayer]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [avatarFailed,setAvatarFailed]=useState(false);
 const [account,setAccount]=useState({email:"",lastSignInAt:null,emailVerified:false,googleConnected:false,discordConnected:false});
 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    const {data,error:sessionError}=await supabase.auth.getSession();
    if(sessionError)throw sessionError;
    const session=data.session;
    if(!session){router.replace("/login?next=%2Fprofile");return;}
    const user=session.user;
    const providers=new Set([...(user.app_metadata?.providers||[]),...(user.identities||[]).map(x=>x.provider),user.app_metadata?.provider].filter(Boolean));
    if(active)setAccount({email:user.email||"",lastSignInAt:user.last_sign_in_at||null,emailVerified:Boolean(user.email_confirmed_at),googleConnected:providers.has("google"),discordConnected:providers.has("discord")});
    const response=await fetch("/api/player/me",{headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"});
    const result=await response.json();
    if(response.status===401){router.replace("/login?next=%2Fprofile");return;}
    if(!response.ok||!result.player)throw new Error(result.error||(id?"Tidak dapat memuat profil.":"Unable to load profile."));
    if(active){setPlayer(result.player);setAvatarFailed(false);}
   }catch(e){if(active)setError(e.message);}
   finally{if(active)setLoading(false);}
  })();
  return()=>{active=false;};
 },[router,id]);
 if(loading)return <main className="df-token-page df-profile-page df-profile-loading" aria-busy="true"><div className="df-profile-loading-content"><LoadingIcon/><p>{id?"Memeriksa akun...":"Checking your account..."}</p></div></main>;
 if(error)return <main className="df-token-page df-profile-page df-profile-state"><p role="alert">{error}</p><button onClick={()=>window.location.reload()}>{id?"COBA LAGI":"TRY AGAIN"}</button></main>;
 if(!player)return null;
 const empty=id?"Belum diisi":"Not provided";
 const joined=player.created_at?new Date(player.created_at).toLocaleDateString(id?"id-ID":"en-US",{day:"numeric",month:"long",year:"numeric"}):"—";
 const last=account.lastSignInAt?new Date(account.lastSignInAt).toLocaleString(id?"id-ID":"en-US",{dateStyle:"medium",timeStyle:"short"}):(id?"Tidak tersedia":"Not available");
 const gender=player.gender==="male"?(id?"Laki-laki":"Male"):player.gender==="female"?(id?"Perempuan":"Female"):empty;
 const rows=[...(player.username?[{icon:"at",label:"Username",value:player.username}]:[]),...(player.profileIdentityEnabled?[{icon:"phone",label:id?"Nomor HP":"Phone number",value:player.phone_number||empty},{icon:"user",label:id?"Jenis kelamin":"Gender",value:gender},{icon:"calendar",label:id?"Tanggal lahir":"Date of birth",value:player.birth_date?new Date(player.birth_date+"T00:00:00").toLocaleDateString(id?"id-ID":"en-US"):empty}]:[]),{icon:"calendar",label:id?"Bergabung sejak":"Member since",value:joined}];
 return <main className="df-token-page df-profile-page"><div className="df-profile-content">
  {player.profileIdentityEnabled&&!player.username&&<section className="df-profile-task ui-card"><span className="df-profile-task-icon">✦</span><div className="df-profile-task-copy"><p>{id?"TASK PROFIL":"PROFILE TASK"}</p><h2>{id?"Lengkapi profil pemainmu":"Complete your player profile"}</h2><span>{id?"Tambahkan nama tampilan dan username agar identitasmu lengkap.":"Add a display name and username to complete your player identity."}</span></div><Link href="/profile/edit">{id?"LENGKAPI":"COMPLETE"}</Link></section>}
  <section className="df-profile-panel ui-card"><div className="df-profile-panel-heading"><h1>{id?"Profil Pemain":"Player Profile"}</h1><Link href="/profile/edit" className="df-profile-edit-link">{id?"EDIT PROFIL":"EDIT PROFILE"}</Link></div><div className="df-profile-identity-row"><div className="df-profile-avatar">{player.avatar_url&&!avatarFailed?<img src={player.avatar_url} alt={player.nickname||"Player avatar"} onError={()=>setAvatarFailed(true)}/>:<span>{(player.nickname||"?").charAt(0).toUpperCase()}</span>}</div><div className="df-profile-identity-copy"><h2 className="df-profile-name">{player.nickname||"—"}</h2><p className="df-profile-server">Server: {player.server_number||"—"}</p></div></div><div className="df-profile-data-list">{rows.map(row=><div className="df-profile-data-row" key={row.label}><span className="df-profile-data-icon"><Icon name={row.icon}/></span><span className="df-profile-data-label">{row.label}</span><strong>{row.value||"—"}</strong></div>)}</div></section>
  <section className="df-profile-panel ui-card"><div className="df-profile-panel-heading"><h2>{id?"Koneksi Akun":"Account Connections"}</h2></div><div className="df-profile-connection-row"><span className="df-profile-provider-icon"><GoogleIcon/></span><span className="df-profile-connection-copy"><strong>Google</strong><small>{id?"Login menggunakan Google":"Google sign-in"}</small></span><button className="df-profile-connected" disabled>{account.googleConnected?(id?"Terhubung":"Connected"):(id?"Tidak terhubung":"Not connected")}</button></div><div className="df-profile-connection-row"><span className="df-profile-provider-icon df-profile-discord-icon"><DiscordIcon/></span><span className="df-profile-connection-copy"><strong>Discord</strong><small>{id?"Hubungkan akun Discord":"Connect your Discord account"}</small></span>{account.discordConnected?<button className="df-profile-connected" disabled>{id?"Terhubung":"Connected"}</button>:<button className="df-profile-connect" disabled title={id?"Integrasi Discord belum dikonfigurasi.":"Discord integration is not configured yet."}>{id?"Hubungkan":"Connect"}</button>}</div>{!account.discordConnected&&<p className="df-profile-connection-note">{id?"Penghubungan Discord akan diaktifkan setelah OAuth dan penyimpanan koneksi disiapkan.":"Discord linking will be enabled after OAuth and connection storage are configured."}</p>}</section>
  <section className="df-profile-panel ui-card"><div className="df-profile-panel-heading"><h2>{id?"Informasi Login & Sesi":"Login & Session Information"}</h2></div><div className="df-profile-session-row"><span className="df-profile-data-icon"><Icon name="mail"/></span><span className="df-profile-session-copy"><small>{id?"Email akun":"Account email"}</small><strong>{account.email||"—"}</strong></span><span className={"df-profile-verification "+(account.emailVerified?"is-verified":"is-unverified")}>{account.emailVerified?(id?"Terverifikasi":"Verified"):(id?"Belum terverifikasi":"Not verified")}</span></div><div className="df-profile-session-row"><span className="df-profile-data-icon"><Icon name="clock"/></span><span className="df-profile-session-copy"><small>{id?"Login terakhir":"Last sign-in"}</small><strong>{last}</strong></span></div><div className="df-profile-logout"><AccountLogout/></div></section>
  <section className="df-profile-panel ui-card df-profile-couple"><div><h2>{id?"Profil Couple":"Couple Profile"}</h2><p>{id?"Buat dan kelola halaman cerita pasanganmu.":"Create and manage your couple story page."}</p></div><Link href="/app/create-profile-couple">{id?"BUKA COUPLE PROFILE":"OPEN COUPLE PROFILE"} ↗</Link></section>
 </div></main>;
}
