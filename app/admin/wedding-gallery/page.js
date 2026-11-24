"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useAdminAuth } from "@/app/components/AdminAuthProvider";
import { useLanguage } from "@/app/components/LanguageProvider";

const SLUG = "anak-dajjal-malika";
const INVITATION_ID = "380f7e77-25af-46e7-8f83-ae6b19507e1c";
const input = "mt-2 w-full rounded-xl border border-[var(--df-border)] bg-[var(--df-surface-raised)] px-4 py-3 text-sm text-[var(--df-text)] outline-none focus:border-[var(--df-focus)]";
const label = "block text-xs font-bold text-[var(--df-text-secondary)]";
function driveUrl(value) {
  try {
    const u = new URL(String(value || "").trim());
    if (u.hostname.endsWith("drive.google.com")) {
      const id = u.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || u.searchParams.get("id");
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
    }
    return u.protocol === "https:" ? u.href : "";
  } catch { return ""; }
}
function Panel({ title, subtitle, open, onClick, children }) {
  return <section className="overflow-hidden rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)]">
    <button type="button" onClick={onClick} aria-expanded={open} className="flex w-full items-center justify-between gap-4 p-5 text-left">
      <span><strong className="block font-extrabold">{title}</strong><small className="mt-1 block text-[var(--df-text-secondary)]">{subtitle}</small></span><b className="text-xl text-[var(--df-primary)]">{open ? "−" : "+"}</b>
    </button>{open && <div className="border-t border-[var(--df-border)] p-5">{children}</div>}
  </section>;
}
export default function WeddingGalleryAdminPage() {
  const { language } = useLanguage();
  const { status: authStatus } = useAdminAuth();
  const id = language === "id";
  const tx = (indonesian, english) => id ? indonesian : english;
  const [invite,setInvite]=useState(null), [items,setItems]=useState([]);
  const [event,setEvent]=useState({event_title:"The Royal Wedding — Anak Dajjal & Malika",event_date:"",event_time:"",venue:"",schedule:"",music_url:"",couple_photo_url:""});
  const [cover,setCover]=useState(""), [urls,setUrls]=useState(""), [album,setAlbum]=useState("Prewedding"), [description,setDescription]=useState("");
  const [panel,setPanel]=useState("cover"), [busy,setBusy]=useState(false), [toast,setToast]=useState(""), [error,setError]=useState("");
  const notify=(s)=>{setToast(s);window.setTimeout(()=>setToast(""),3200);};
  const activeInvitationId = invite?.id || INVITATION_ID;
  const load=useCallback(async()=>{
    const {data:i,error:ie}=await supabaseAdminClient.from("df_invitations").select("*").eq("slug",SLUG).single(); if(ie) throw ie;
    const [{data:s,error:se},{data:g,error:ge}]=await Promise.all([
      supabaseAdminClient.from("df_event_settings").select("*").eq("invitation_id",i.id).maybeSingle(),
      supabaseAdminClient.from("df_gallery_items").select("*").eq("invitation_id",i.id).order("sort_order").order("created_at",{ascending:false})
    ]);
    if(se) throw se;if(ge) throw ge;setInvite(i);if(s){setEvent(current=>({...current,...s,event_date:s.event_date||""}));setCover(s.couple_photo_url||"");}setItems(g||[]);
  },[]);
  useEffect(()=>{if(authStatus!=="verified")return;let active=true;load().catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[authStatus,load]);
  async function saveCover(e){e.preventDefault();setBusy(true);setError("");const url=driveUrl(cover);if(!url){setError(tx("Masukkan URL HTTPS atau link Google Drive yang valid.","Enter a valid HTTPS or Google Drive URL."));setBusy(false);return;}try{const {error:e}=await supabaseAdminClient.from("df_event_settings").upsert({invitation_id:activeInvitationId,event_title:event.event_title,couple_photo_url:url},{onConflict:"invitation_id"});if(e)throw e;setCover(url);setEvent(v=>({...v,couple_photo_url:url}));notify(tx("Foto utama berhasil diperbarui.","Cover photo updated successfully."));}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function saveDetails(e){e.preventDefault();setBusy(true);setError("");try{const {error:e}=await supabaseAdminClient.from("df_event_settings").upsert({invitation_id:activeInvitationId,event_title:event.event_title||"Wedding Invitation",event_date:event.event_date||null,event_time:event.event_time||null,venue:event.venue||null,schedule:event.schedule||null,music_url:event.music_url||null,couple_photo_url:event.couple_photo_url||null},{onConflict:"invitation_id"});if(e)throw e;notify(tx("Detail undangan berhasil disimpan.","Invitation details saved successfully."));}catch(e){setError(e.message);}finally{setBusy(false);}}
  const testImage=(url)=>new Promise(resolve=>{const im=new Image();let done=false;const finish=v=>{if(!done){done=true;resolve(v);}};im.onload=()=>finish(true);im.onerror=()=>finish(false);im.src=url;window.setTimeout(()=>finish(false),8000);});
  async function saveBatch(e){e.preventDefault();setBusy(true);setError("");let saved=0,skipped=0;try{const lines=urls.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!lines.length)throw new Error(tx("Masukkan minimal satu URL.","Enter at least one URL."));const normalized=lines.map(driveUrl);skipped+=normalized.filter(x=>!x).length;const unique=[...new Set(normalized.filter(Boolean))];const existing=new Set(items.map(x=>x.image_url));let order=items.length;for(const url of unique){if(existing.has(url)||!(await testImage(url))){skipped++;continue;}const {error:e}=await supabaseAdminClient.from("df_gallery_items").insert({invitation_id:activeInvitationId,title:`Wedding Photo ${String(order+1).padStart(3,"0")}`,description:description.trim(),album:album.trim()||"Wedding",image_url:url,storage_path:null,is_published:true,sort_order:order});if(e)throw e;existing.add(url);order++;saved++;}await load();setUrls("");notify(id ? `${saved} foto dipublikasikan.${skipped? ` ${skipped} URL dilewati.`:""}` : `${saved} photos published.${skipped? ` ${skipped} URLs skipped.`:""}`);}catch(e){setError(e.message||"Gagal menyimpan foto.");await load();}finally{setBusy(false);}}
  async function toggle(item){setBusy(true);try{const {error:e}=await supabaseAdminClient.from("df_gallery_items").update({is_published:!item.is_published}).eq("id",item.id);if(e)throw e;await load();notify(item.is_published?tx("Foto disembunyikan.","Photo hidden."):tx("Foto dipublikasikan.","Photo published."));}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function remove(item){if(!window.confirm(tx("Hapus foto ini?","Delete this photo?")))return;setBusy(true);try{const {error:e}=await supabaseAdminClient.from("df_gallery_items").delete().eq("id",item.id);if(e)throw e;if(item.storage_path)await supabaseAdminClient.storage.from("df-wedding-gallery").remove([item.storage_path]);await load();notify(tx("Foto berhasil dihapus.","Photo deleted successfully."));}catch(e){setError(e.message);}finally{setBusy(false);}}

  return <main className="min-h-screen bg-[var(--df-bg)] px-4 py-5 text-[var(--df-text)] sm:px-6"><div className="mx-auto max-w-5xl">
    <Link href={`/${language}/admin`} className="inline-flex rounded-lg border border-[var(--df-border)] bg-[var(--df-primary-soft)] px-4 py-2 text-xs font-bold text-[var(--df-primary)]">← {tx("KEMBALI KE DASHBOARD","BACK TO DASHBOARD")}</Link>
    <header className="my-7"><p className="text-[10px] font-extrabold tracking-[.22em] text-[var(--df-primary)]">DAJJAL FAMILY · WEDDING MANAGEMENT</p><h1 className="mt-2 text-3xl font-black">{tx("PENGELOLA WEDDING","WEDDING MANAGER")}</h1><p className="mt-2 text-sm text-[var(--df-text-secondary)]">{invite?.title || "The Royal Wedding — Anak Dajjal & Malika"}</p><p className="text-xs text-[var(--df-accent)]">{tx("URL","URL")}: /df/wedding={invite?.slug || SLUG}</p></header>
    {error&&<p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-[var(--df-danger)]">{error}</p>}
    <div className="space-y-4">
      <Panel title={tx("01 · Foto Utama Pasangan","01 · Couple Cover Photo")} subtitle={tx("Foto yang tampil di panel pembuka undangan.","The photo shown in the invitation opening panel.")} open={panel==="cover"} onClick={()=>setPanel(panel==="cover"?"":"cover")}><form onSubmit={saveCover} className="space-y-4"><label className={label}>{tx("URL foto Google Drive / HTTPS","Google Drive / HTTPS photo URL")}<input className={input} value={cover} onChange={e=>setCover(e.target.value)} placeholder={tx("Tempel link foto di sini","Paste a photo link here")}/></label>{event.couple_photo_url&&<img src={event.couple_photo_url} alt={tx("Foto utama","Cover photo")} className="max-h-64 w-full rounded-xl object-contain"/>}<button disabled={busy} className="rounded-xl bg-[var(--df-primary)] px-5 py-3 text-sm font-bold">{busy?tx("MENYIMPAN...","SAVING..."):tx("SIMPAN FOTO UTAMA","SAVE COVER PHOTO")}</button></form></Panel>
      <Panel title={tx("02 · Album Prewedding / Wedding","02 · Prewedding / Wedding Albums")} subtitle={tx("Banyak URL sekaligus, satu URL per baris. Foto valid langsung Published.","Add multiple URLs, one per line. Valid photos are published immediately.")} open={panel==="album"} onClick={()=>setPanel(panel==="album"?"":"album")}><form onSubmit={saveBatch} className="space-y-4"><label className={label}>{tx("Daftar URL","URL list")}<textarea className={input} rows={6} value={urls} onChange={e=>setUrls(e.target.value)} placeholder={"https://drive.google.com/file/d/ID1/view\nhttps://drive.google.com/file/d/ID2/view"}/></label><div className="grid gap-4 sm:grid-cols-2"><label className={label}>{tx("Album","Album")}<input className={input} value={album} onChange={e=>setAlbum(e.target.value)}/></label><label className={label}>{tx("Deskripsi umum","General description")}<input className={input} value={description} onChange={e=>setDescription(e.target.value)}/></label></div><button disabled={busy||!urls.trim()} className="rounded-xl bg-[var(--df-primary)] px-5 py-3 text-sm font-bold">{busy?tx("MEMERIKSA FOTO...","CHECKING PHOTOS..."):tx("SIMPAN & PUBLISH FOTO","SAVE & PUBLISH PHOTOS")}</button></form><h3 className="mb-3 mt-7 font-bold">{tx("Foto tersimpan","Saved photos")} ({items.length})</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{items.map(item=><article key={item.id} className="overflow-hidden rounded-xl border border-[var(--df-border)] bg-[var(--df-surface)]"><img src={item.image_url} alt={item.title} className="aspect-[4/3] w-full object-cover"/><div className="p-3"><p className="truncate text-xs font-bold">{item.title}</p><p className="admin-meta text-[var(--df-text-secondary)]">{item.album}</p><div className="mt-2 flex gap-2"><button disabled={busy} onClick={()=>toggle(item)} className="flex-1 rounded border border-[var(--df-border)] p-2 text-[10px]">{item.is_published?tx("Sembunyikan","Hide"):tx("Publish","Publish")}</button><button disabled={busy} onClick={()=>remove(item)} className="rounded border border-[var(--df-danger)] p-2 text-[10px] text-[var(--df-danger)]">{tx("Hapus","Delete")}</button></div></div></article>)}</div></Panel>
      <Panel title={tx("03 · Tanggal & Detail Acara","03 · Event Date & Details")} subtitle={tx("Atur tanggal, waktu, lokasi, susunan acara, dan musik.","Set the date, time, venue, schedule, and music.")} open={panel==="details"} onClick={()=>setPanel(panel==="details"?"":"details")}><form onSubmit={saveDetails} className="space-y-4"><label className={label}>{tx("Judul undangan","Invitation title")}<input className={input} value={event.event_title||""} onChange={e=>setEvent({...event,event_title:e.target.value})}/></label><div className="grid gap-4 sm:grid-cols-2"><label className={label}>{tx("Tanggal","Date")}<input type="date" className={input} value={event.event_date||""} onChange={e=>setEvent({...event,event_date:e.target.value})}/></label><label className={label}>{tx("Waktu","Time")}<input className={input} value={event.event_time||""} onChange={e=>setEvent({...event,event_time:e.target.value})} placeholder="18.00 WIB"/></label></div><label className={label}>{tx("Lokasi","Venue")}<input className={input} value={event.venue||""} onChange={e=>setEvent({...event,venue:e.target.value})}/></label><label className={label}>{tx("Susunan acara","Event schedule")}<textarea rows={3} className={input} value={event.schedule||""} onChange={e=>setEvent({...event,schedule:e.target.value})}/></label><label className={label}>{tx("URL musik","Music URL")}<input className={input} value={event.music_url||""} onChange={e=>setEvent({...event,music_url:e.target.value})}/></label><button disabled={busy} className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold">{busy?tx("MENYIMPAN...","SAVING..."):tx("SIMPAN DETAIL UNDANGAN","SAVE INVITATION DETAILS")}</button></form></Panel>
    </div>{toast&&<div role="status" className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-[var(--df-success)] bg-[var(--df-surface)] p-4 text-center text-sm font-bold text-[var(--df-success)] shadow-2xl">{toast}</div>}
  </div></main>;
}
