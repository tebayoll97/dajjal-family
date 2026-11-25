"use client";
import { useCallback,useEffect,useMemo,useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { Badge,Button,Card,EmptyState,FeedbackDialog,PageHeader,SectionHeader,TextField,VerificationState } from "@/app/components/ui";
import AuthorPortal from "@/app/components/blog/AuthorPortal";
import ContributorProfileEditor from "@/app/components/blog/ContributorProfileEditor";

const copy = {
 id:{home:"Ringkasan ruang kerja",profile:"Profil saya",blog:"Blog Studio",tasks:"Tugas saya",security:"Keamanan akun",login:"Masuk ke Contributor Shell",email:"Email kontributor",password:"Password",signIn:"Masuk",signOut:"Keluar",welcome:"Selamat datang",intro:"Kelola kontribusi dan tugas lintas modul DAJJAL FAMILY dari satu ruang kerja.",changeTitle:"Buat password baru",changeHint:"Password sementara hanya untuk login pertama. Ganti sekarang sebelum melanjutkan.",newPassword:"Password baru",confirm:"Konfirmasi password baru",save:"Simpan password baru",tasksEmpty:"Belum ada tugas untuk akun ini.",taskIntro:"Tugas yang diberikan Admin akan muncul di sini.",noPermission:"Akun ini belum memiliki akses ke modul tersebut.",loading:"Memeriksa akun kontributor…",access:"Akses kontributor belum aktif. Hubungi Admin."},
 en:{home:"Workspace overview",profile:"My profile",blog:"Blog Studio",tasks:"My tasks",security:"Account security",login:"Sign in to Contributor Shell",email:"Contributor email",password:"Password",signIn:"Sign in",signOut:"Sign out",welcome:"Welcome",intro:"Manage your contributions and cross-module tasks from one DAJJAL FAMILY workspace.",changeTitle:"Create a new password",changeHint:"Your temporary password is for first sign-in only. Change it before continuing.",newPassword:"New password",confirm:"Confirm new password",save:"Save new password",tasksEmpty:"There are no tasks assigned to this account yet.",taskIntro:"Tasks assigned by Admin will appear here.",noPermission:"This account does not have access to this module.",loading:"Verifying contributor account…",access:"Contributor access is not active. Contact Admin."}
};

export default function ContributorPlatform({section="home"}){
 const {language}=useLanguage(), t=copy[language==="en"?"en":"id"], isEn=language==="en";
 const [session,setSession]=useState(null),[clientKey,setClientKey]=useState("member"),[contributor,setContributor]=useState(null),[permissions,setPermissions]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[newPassword,setNewPassword]=useState(""),[confirmPassword,setConfirmPassword]=useState(""),[error,setError]=useState(""),[message,setMessage]=useState(""),[tasks,setTasks]=useState([]);
 const client=clientKey==="admin"?supabaseAdminClient:supabase;
 const inspect=useCallback(async(active,key)=>{
  if(!active?.access_token){setLoading(false);return false;}
  const response=await fetch("/api/contributors/session",{headers:{Authorization:"Bearer "+active.access_token},cache:"no-store"});
  const result=await response.json().catch(()=>({}));
  if(!response.ok){setSession(null);setContributor(null);setPermissions([]);setError(result.error||t.access);setLoading(false);return false;}
  setSession(active);setClientKey(key);setContributor(result.contributor);setPermissions(result.permissions||[]);setEmail(result.contributor.email||active.user?.email||"");setError("");setLoading(false);return true;
 },[t.access]);
 useEffect(()=>{let live=true;(async()=>{
  const admin=await supabaseAdminClient.auth.getSession();
  if(admin.data?.session){const ok=await inspect(admin.data.session,"admin");if(ok||!live)return;}
  const member=await supabase.auth.getSession();
  if(live){if(member.data?.session)await inspect(member.data.session,"member");else setLoading(false);}
 })().catch(()=>{if(live){setError(t.access);setLoading(false);}});
 return()=>{live=false;};},[inspect,t.access]);
 const has=(key)=>permissions.includes(key);
 const nav=useMemo(()=>[
  ["home","/contributors/shell",t.home,true],
  ["profile","/contributors/shell/profile",t.profile,true],
  ["blog","/contributors/shell/blog",t.blog,has("blog.access")],
  ["tasks","/contributors/shell/tasks",t.tasks,true],
  ["security","/contributors/shell/security",t.security,true]
 ],[t,permissions]);
 async function signIn(e){e.preventDefault();setBusy(true);setError("");let result=await supabase.auth.signInWithPassword({email:email.trim(),password});let key="member";
  if(result.error){result=await supabaseAdminClient.auth.signInWithPassword({email:email.trim(),password});key="admin";}
  if(result.error){setError(result.error.message);setBusy(false);return;}
  await inspect(result.data.session,key);setPassword("");setBusy(false);
 }
 async function updatePassword(e){e.preventDefault();setError("");setMessage("");if(newPassword.length<12){setError(isEn?"Use at least 12 characters.":"Gunakan minimal 12 karakter.");return;}if(newPassword!==confirmPassword){setError(isEn?"Passwords do not match.":"Konfirmasi password tidak cocok.");return;}setBusy(true);
  const response=await fetch("/api/contributors/password-complete",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({password:newPassword})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){setError(body.error||"Unable to activate contributor account.");setBusy(false);return;}
  setContributor(c=>({...c,must_change_password:false}));setNewPassword("");setConfirmPassword("");setMessage(isEn?"Password updated. Your workspace is ready.":"Password berhasil diperbarui. Ruang kerja siap digunakan.");setBusy(false);
 }
 async function signOut(){await client.auth.signOut();setSession(null);setContributor(null);setPermissions([]);setPassword("");}
 useEffect(()=>{if(!session||section!=="tasks")return;let active=true;fetch("/api/contributors/tasks",{headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"}).then(r=>r.json()).then(j=>{if(active&&j.success)setTasks(j.tasks||[]);}).catch(()=>{});return()=>{active=false;};},[session,section]);
 
 return <main className="ui-page ui-stack">
  <PageHeader eyebrow="DAJJAL FAMILY / CONTRIBUTOR SHELL" title="Contributor Shell" description={t.intro}/>
  {loading?<Card><VerificationState variant="user" status="checking" compact title={t.loading}/></Card>:null}
  {!loading&&!session?<Card className="ui-stack"><SectionHeader title={t.login} description={t.access}/><form className="ui-stack" onSubmit={signIn}><TextField label={t.email} type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/><TextField label={t.password} type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/><Button type="submit" disabled={busy} loading={busy}>{t.signIn}</Button></form><Link className="ui-link" href={`/${language}/contributors`}>{isEn?"Learn about contributing":"Pelajari cara berkontribusi"}</Link></Card>:null}
  {session&&contributor?<><nav className="ui-cluster" aria-label="Contributor navigation">{nav.filter(x=>x[3]).map(([key,href,label])=><Link key={key} href={`/${language}${href}`} className={`ui-button ${section===key?"ui-button-primary":"ui-button-secondary"} ui-button-sm`}>{label}</Link>)}<span className="ui-caption">{contributor.display_name}</span><Button size="sm" variant="ghost" onClick={signOut}>{t.signOut}</Button></nav>
  {contributor.must_change_password?<Card className="ui-stack"><Badge variant="warning">{isEn?"First sign-in security":"Keamanan login pertama"}</Badge><SectionHeader title={t.changeTitle} description={t.changeHint}/><form className="ui-stack" onSubmit={updatePassword}><TextField label={t.newPassword} type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} minLength={12} autoComplete="new-password" required/><TextField label={t.confirm} type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} minLength={12} autoComplete="new-password" required/><Button type="submit" loading={busy} disabled={busy}>{t.save}</Button></form></Card>:<>
  {section==="home"?<Card className="ui-stack"><Badge variant="success">{isEn?"Account active":"Akun aktif"}</Badge><SectionHeader title={t.welcome+" "+contributor.display_name} description={t.intro}/><div className="ui-cluster">{permissions.map(p=><Badge key={p}>{p}</Badge>)}</div><p className="ui-caption">{isEn?"Use the navigation above to open the modules assigned to your account.":"Gunakan navigasi di atas untuk membuka modul yang ditugaskan ke akunmu."}</p></Card>:null}
  {section==="profile"?<ContributorProfileEditor contributor={contributor} accessToken={session.access_token} locale={language} onSaved={setContributor}/>:null}
  {section==="blog"?(has("blog.access")?<AuthorPortal mode="dashboard"/>:<EmptyState title={t.noPermission}/>):null}
  {section==="tasks"?<section className="ui-stack"><SectionHeader title={t.tasks} description={t.taskIntro}/>{tasks.length?tasks.map(task=><Card key={task.id} className="ui-stack"><div className="ui-cluster"><Badge>{task.module_key}</Badge><Badge variant={task.priority==="urgent"||task.priority==="high"?"warning":"neutral"}>{task.priority}</Badge><Badge>{task.status}</Badge></div><h2 className="ui-heading-h3">{task.title}</h2>{task.description?<p className="ui-text-body">{task.description}</p>:null}{task.due_at?<p className="ui-caption">{isEn?"Due":"Tenggat"}: {new Date(task.due_at).toLocaleString(language)}</p>:null}</Card>):<EmptyState title={t.tasksEmpty} description={t.taskIntro}/>}</section>:null}
  {section==="security"?<Card className="ui-stack"><SectionHeader title={t.security}/><p className="ui-text-body">{isEn?"Your account is protected by DAJJAL FAMILY authentication. Use a unique password and never share it.":"Akun dilindungi autentikasi DAJJAL FAMILY. Gunakan password unik dan jangan pernah membagikannya."}</p><Button variant="secondary" onClick={signOut}>{t.signOut}</Button></Card>:null}
  </>}</>:null}
  <FeedbackDialog open={Boolean(error||message)} onClose={()=>{setError("");setMessage("");}} title={error?(isEn?"Action failed":"Aksi gagal"):(isEn?"Success":"Berhasil")} message={error||message} variant={error?"danger":"success"} closeLabel={isEn?"Close":"Tutup"}/>
 </main>;
}