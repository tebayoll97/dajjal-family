"use client";
import { useState } from "react";
import { Badge,Button,Card,CheckboxField,FeedbackDialog,SectionHeader,TextField } from "@/app/components/ui";
import { useLanguage } from "@/app/components/LanguageProvider";
const choices=[
 ["blog.access","Blog Studio access","Akses Blog Studio"],
 ["blog.article.create","Create articles","Membuat artikel"],
 ["blog.article.edit_own","Edit own articles","Mengedit artikel sendiri"],
 ["blog.article.publish","Publish articles","Menerbitkan artikel"],
];
export default function ContributorProvisioning(){
 const {language}=useLanguage(),en=language==="en";
 const [email,setEmail]=useState(""),[name,setName]=useState(""),[permissions,setPermissions]=useState(["blog.access","blog.article.create","blog.article.edit_own","blog.article.publish"]),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState(""),[copied,setCopied]=useState(false);
 async function create(e){e.preventDefault();setBusy(true);setError("");setResult(null);setCopied(false);
  try{const {supabaseAdminClient}=await import("@/lib/supabaseAdminClient");const {data}=await supabaseAdminClient.auth.getSession();const token=data.session?.access_token;if(!token)throw new Error(en?"Admin session required.":"Sesi Admin diperlukan.");
   const response=await fetch("/api/admin/contributors",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({email,display_name:name,permissions})});
   const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||"Account creation failed.");setResult(body);setEmail("");setName("");
  }catch(e){setError(e.message||"Account creation failed.");}finally{setBusy(false);}
 }
 async function copy(){if(!result?.temporary_password)return;try{await navigator.clipboard.writeText(result.temporary_password);setCopied(true);}catch{setError(en?"Clipboard access failed. Select and copy the password manually.":"Gagal menyalin. Pilih dan salin password secara manual.");}}
 return <section className="ui-page ui-stack"><Card className="ui-stack"><SectionHeader title={en?"Create contributor account":"Buat akun kontributor"} description={en?"Admin-only provisioning. The temporary password is displayed once and must be changed on first sign-in.":"Pembuatan akun khusus Admin. Password sementara hanya ditampilkan sekali dan wajib diganti saat login pertama."}/><form className="ui-stack" onSubmit={create}><TextField label={en?"Contributor name":"Nama kontributor"} value={name} onChange={e=>setName(e.target.value)} maxLength={80} required/><TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><fieldset className="ui-stack" style={{border:0,padding:0,margin:0}}><legend className="ui-text-label">{en?"Module permissions":"Izin modul"}</legend>{choices.map(([key,eng,ind])=><CheckboxField key={key} label={en?eng:ind} checked={permissions.includes(key)} onChange={event=>setPermissions(current=>{const checked=event.target.checked;if(key==="blog.access"&&!checked)return current.filter(x=>!x.startsWith("blog."));if(key.startsWith("blog.article.")&&checked)return [...new Set([...current,"blog.access",key])];return checked?[...current,key]:current.filter(x=>x!==key);})}/>)}</fieldset><Button type="submit" loading={busy} disabled={busy||!permissions.length}>{en?"Create account":"Buat akun"}</Button></form></Card>
 {result?<Card className="ui-stack"><Badge variant="success">{en?"Account created":"Akun berhasil dibuat"}</Badge><h2 className="ui-heading-h3">{result.contributor.display_name}</h2><p className="ui-caption">{result.contributor.email}</p><p className="ui-text-body">{en?"Temporary password — copy and send privately now. It will not be shown again.":"Password sementara — salin dan kirim secara pribadi sekarang. Password tidak akan ditampilkan lagi."}</p><div className="ui-cluster"><code className="ui-input" style={{overflowWrap:"anywhere",height:"auto"}}>{result.temporary_password}</code><Button onClick={copy}>{copied?(en?"Copied":"Tersalin"):(en?"Copy password":"Salin password")}</Button></div><p className="ui-caption">{en?"The contributor must change this password at first sign-in.":"Kontributor wajib mengganti password ini saat login pertama."}</p></Card>:null}
 <FeedbackDialog open={Boolean(error)} onClose={()=>setError("")} title={en?"Could not complete action":"Aksi gagal"} message={error} variant="danger" closeLabel={en?"Close":"Tutup"}/>
 </section>;
}