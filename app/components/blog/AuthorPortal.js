"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Badge, Breadcrumbs, Button, Card, EmptyState, FeedbackDialog, PageHeader, SectionHeader, TextField, VerificationState } from "@/app/components/ui";
import EditorialEditor from "@/app/components/blog/EditorialEditor";
import ContributorProfileEditor from "@/app/components/blog/ContributorProfileEditor";

export default function AuthorPortal({ mode = "apply" }) {
  const { language } = useLanguage();
  const id = language === "id";
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [sessionSource, setSessionSource] = useState("member");
  const [isOwner, setIsOwner] = useState(false);
  const [contributor, setContributor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(null);

  const t = {
    home:id?"Beranda":"Home", blog:"Blog", apply:id?"Daftar sebagai penulis":"Apply as an author",
    dashboard:id?"Dashboard penulis":"Author dashboard", login:id?"Masuk":"Sign in",
    email:id?"Email akun DAJJAL FAMILY":"DAJJAL FAMILY account email", password:id?"Password":"Password",
    confirm:id?"Konfirmasi password":"Confirm password", applyNote:id?"Ceritakan pengalaman atau topik yang ingin kamu tulis (opsional)":"Tell us about your experience or topics you want to write about (optional)",
    submit:id?"Kirim pendaftaran":"Submit application", pending:id?"Menunggu persetujuan admin":"Waiting for admin approval",
    approved:id?"Penulis disetujui":"Author approved", suspended:id?"Akses penulis ditangguhkan":"Author access suspended",
    title:id?"Judul artikel":"Article title",
    slug:id?"URL artikel (opsional)":"Article URL (optional)", category:id?"Kategori":"Category",
    excerpt:id?"Ringkasan":"Excerpt", content:id?"Isi artikel (pisahkan paragraf dengan satu baris kosong)":"Article content (separate paragraphs with a blank line)",
    cover:id?"URL gambar sampul HTTPS":"HTTPS cover image URL", save:id?"Simpan Draft":"Save Draft",
    publish:id?"Terbitkan":"Publish", newArticle:id?"Artikel baru":"New article",
    noArticles:id?"Belum ada artikel. Mulai tulisan pertamamu.":"No articles yet. Start your first story.",
    saved:id?"Artikel berhasil disimpan.":"Article saved.", draft:id?"Draft":"Draft", published:id?"Terbit":"Published",
    edit:id?"Edit":"Edit", logout:id?"Keluar":"Sign out", 
  };

  const load = useCallback(async (activeSession) => {
    if (!activeSession?.access_token) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${activeSession.access_token}` };
    const [profileResponse, articleResponse] = await Promise.all([
      fetch("/api/blog/contributors", { headers, cache:"no-store" }),
      fetch("/api/blog/articles", { headers, cache:"no-store" }),
    ]);
    const profile = await profileResponse.json().catch(()=>({}));
    setContributor(profile.contributor || null);
    setIsOwner(profile.owner === true);
    if (profileResponse.ok && profile.contributor?.status === "approved") {
      const articleData = await articleResponse.json().catch(()=>({}));
      if (articleResponse.ok) setArticles(articleData.articles || []);
      const categoryResponse = await fetch("/api/blog/categories", { cache:"no-store" });
      const categoryData = await categoryResponse.json().catch(()=>({}));
      if (categoryResponse.ok) setCategories(categoryData.categories || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    async function initialize() {
      const { data: adminData } = await supabaseAdminClient.auth.getSession();
      const adminSession = adminData?.session;
      if (adminSession?.access_token) {
        const check = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${adminSession.access_token}` }, cache: "no-store" }).catch(() => null);
        if (check?.ok) {
          if (!alive) return;
          setSessionSource("admin"); setSession(adminSession); setEmail(adminSession.user?.email || "");
          await load(adminSession); return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      setSessionSource("member"); setSession(data.session); setEmail(data.session?.user?.email || "");
      await load(data.session);
    }
    initialize().catch(() => { if (alive) { setError(id ? "Gagal memuat data akun." : "Unable to load account data."); setLoading(false); } });
    const { data: adminListener } = supabaseAdminClient.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) {
        setSessionSource("admin"); setSession(nextSession); setEmail(nextSession.user?.email || "");
        if (alive) load(nextSession).catch(() => setError(id ? "Gagal memuat data akun." : "Unable to load account data."));
      }
    });
    return () => { alive = false; adminListener.subscription.unsubscribe(); };
  }, [load, id]);

  async function signIn(event) {
    event.preventDefault(); setBusy(true); setError("");
    const {data,error:authError}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(authError){setError(authError.message);setBusy(false);return;}
    setSession(data.session); await load(data.session); setBusy(false);
  }

  async function apply(event) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    if(password.length<8){setError(id?"Password minimal 8 karakter.":"Password must be at least 8 characters.");setBusy(false);return;}
    if(password!==confirmPassword){setError(id?"Konfirmasi password tidak cocok.":"Passwords do not match.");setBusy(false);return;}
    const {error:passwordError}=await supabase.auth.updateUser({password});
    if(passwordError){setError(passwordError.message);setBusy(false);return;}
    const {data:{session:current}}=await supabase.auth.getSession();
    const response=await fetch("/api/blog/contributors",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${current?.access_token||session?.access_token||""}`},body:JSON.stringify({application_note:note})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){setError(result.error||"Unable to submit application.");setBusy(false);return;}
    setContributor(result.contributor);setMessage(id?"Pendaftaran terkirim. Admin akan meninjau permohonanmu.":"Application submitted. An administrator will review it.");setBusy(false);
  }

  async function saveArticle(event) {
    event.preventDefault(); if(!session?.access_token)return;
    setBusy(true);setError("");setMessage("");
    const form=new FormData(event.currentTarget);
    const payload=Object.fromEntries(form.entries());
    payload.category_id=payload.category_id||null;
    payload.source_locale=language;
    const status=event.nativeEvent.submitter?.value==="publish"?"published":"draft";delete payload.intent;
    const response=await fetch(editing?.id?`/api/blog/articles/${editing.id}`:"/api/blog/articles",{method:editing?.id?"PATCH":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({...payload,status})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){setError(result.error||"Unable to save article.");setBusy(false);return;}
    setEditing(null);setMessage(t.saved);await load(session);setBusy(false);
  }

  async function signOut(){if(sessionSource==="admin")await supabaseAdminClient.auth.signOut();else await supabase.auth.signOut();setSession(null);setContributor(null);setArticles([]);setIsOwner(false);}

  const crumbs=[{label:t.home,href:`/${language}`},{label:t.blog,href:`/${language}/blog`},{label:mode==="apply"?t.apply:t.dashboard}];
  return <main className="ui-page df-blog-author ui-stack ui-author-workspace"><PageHeader eyebrow="DAJJAL FAMILY / BLOG" title={isOwner ? "Blog Owner — Tebayoll" : mode==="apply" ? t.apply : t.dashboard} description={mode==="dashboard" ? (id ? "Kelola profil publik dan seluruh pekerjaan editorial di satu tempat." : "Manage your public profile and editorial work in one place.") : (id ? "Gunakan akun DAJJAL FAMILY untuk mengajukan diri sebagai kontributor." : "Use your DAJJAL FAMILY account to apply as a contributor.")} meta={isOwner ? <Badge variant="success">PERMANENT OWNER · TEBAYOLL</Badge> : null} /><Breadcrumbs items={crumbs}/>
    {loading?<Card className="ui-stack"><VerificationState variant="user" status="checking" compact title={id ? "Memeriksa sesi akun…" : "Checking account session…"} /></Card>:null}
    <FeedbackDialog
      open={Boolean(error || message)}
      onClose={() => { setError(""); setMessage(""); }}
      title={error ? (id ? "Terjadi kendala" : "Something went wrong") : (id ? "Berhasil" : "Success")}
      message={error || message}
      variant={error ? "danger" : "success"}
      closeLabel={id ? "Tutup" : "Close"}
    />
    {!loading&&!session?<Card className="ui-stack"><SectionHeader title={t.login} description={id?"Masuk dengan email dan password akun DAJJAL FAMILY.":"Sign in with your DAJJAL FAMILY account email and password."}/><form className="ui-stack" onSubmit={signIn}><TextField label={t.email} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><TextField label={t.password} type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><Button type="submit" disabled={busy}>{busy?(id?"Memproses…":"Working…"):t.login}</Button></form><p className="ui-caption">{id?"Belum memiliki sesi akun? Masuk melalui":"Need an account session? Sign in through"} <Link href={`/${language}/login?redirect=%2F${language}%2Fblog%2Fauthor%2Fapply`} className="ui-link">DAJJAL FAMILY</Link>.</p></Card>:null}
    {!loading&&session&&mode==="apply"&&!contributor?<Card className="ui-stack"><Badge variant="info">{id?"Akun terhubung":"Account connected"}</Badge><p className="ui-text-body"><strong>{session.user.user_metadata?.full_name||session.user.user_metadata?.name||session.user.email}</strong><br/><span className="ui-caption">{session.user.email}</span></p><form className="ui-stack" onSubmit={apply}><TextField label={t.password} type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required/><TextField label={t.confirm} type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} minLength={8} required/><TextField as="textarea" label={t.applyNote} value={note} onChange={e=>setNote(e.target.value)} rows={4}/><Button type="submit" disabled={busy}>{busy?(id?"Mengirim…":"Submitting…"):t.submit}</Button></form></Card>:null}
    {!loading&&session&&contributor&&mode==="apply"?<Card className="ui-stack"><Badge variant={contributor.status==="approved"?"success":contributor.status==="rejected"?"danger":"warning"}>{contributor.status==="approved"?t.approved:contributor.status==="suspended"?t.suspended:t.pending}</Badge><p className="ui-text-body">{contributor.display_name} · {contributor.email}</p>{contributor.status==="approved"?<Button onClick={()=>router.push(`/${language}/author/me`)}>{t.dashboard}</Button>:<p className="ui-caption">{id?"Kamu akan dapat mengakses dashboard setelah disetujui admin.":"The author dashboard becomes available after admin approval."}</p>}</Card>:null}
    {!loading&&session&&mode==="dashboard"&&!contributor?<EmptyState title={id?"Belum terdaftar sebagai penulis":"Not registered as an author"} description={id?"Ajukan pendaftaran terlebih dahulu.":"Submit an author application first."} action={<Button onClick={()=>router.push(`/${language}/blog/author/apply`)}>{t.apply}</Button>}/>:null}
    {!loading&&session&&mode==="dashboard"&&contributor&&contributor.status!=="approved"?<Card><Badge variant="warning">{contributor.status}</Badge><p>{id?"Akses dashboard menunggu persetujuan atau sedang dibatasi.":"Dashboard access is pending approval or restricted."}</p></Card>:null}
    {!loading&&session&&mode==="dashboard"&&contributor?.status==="approved"?<section className="ui-stack"><ContributorProfileEditor contributor={contributor} accessToken={session.access_token} locale={language} onSaved={setContributor} /><div className="ui-section-heading"><SectionHeader title={isOwner ? (id ? "Semua Artikel" : "All Articles") : id?"Artikel saya":"My articles"} description={isOwner ? (id ? "Tebayoll dapat mengedit dan menerbitkan seluruh artikel kontributor." : "Tebayoll can edit and publish every contributor article.") : id?"Simpan draft atau terbitkan artikel langsung.":"Save drafts or publish articles directly."}/><Button onClick={()=>setEditing({})}>{t.newArticle}</Button></div>
      {editing!==null?<Card><form className="ui-stack df-editorial-form" onSubmit={saveArticle}><TextField label={t.title} name="title" defaultValue={id?editing.title_id||editing.title_en||"":editing.title_en||editing.title_id||""} required maxLength={180}/><TextField label={t.slug} name="slug" defaultValue={id?editing.slug_id||"":editing.slug_en||""} helpText={id?"Opsional. URL dibuat otomatis jika dikosongkan.":"Optional. URL is generated automatically when blank."}/><TextField as="select" label={t.category} name="category_id" defaultValue={editing.category_id||""}><option value="">{id?"Pilih kategori":"Choose category"}</option>{categories.map(c=><option key={c.id} value={c.id}>{id?c.name_id:c.name_en||c.name_id}</option>)}</TextField><TextField as="textarea" label={t.excerpt} name="excerpt" defaultValue={id?editing.excerpt_id||editing.excerpt_en||"":editing.excerpt_en||editing.excerpt_id||""} rows={3} maxLength={360}/><EditorialEditor key={editing.id||"new"} name="content" locale={language} defaultValue={id?editing.content_id||editing.content_en||"":editing.content_en||editing.content_id||""} sessionToken={session.access_token}/><TextField label={id?"Teks alternatif gambar":"Image alt text"} name="cover_image_alt" defaultValue={id?editing.cover_image_alt_id||"":editing.cover_image_alt_en||""} maxLength={180}/><TextField label={t.cover} name="cover_image_url" defaultValue={editing.cover_image_url||""} type="url"/><TextField label={id?"Judul SEO":"SEO title"} name="meta_title" defaultValue={id?editing.meta_title_id||"":editing.meta_title_en||""} maxLength={180}/><TextField as="textarea" label={id?"Deskripsi SEO":"SEO description"} name="meta_description" defaultValue={id?editing.meta_description_id||"":editing.meta_description_en||""} rows={2} maxLength={320}/><div className="ui-cluster"><Button type="submit" name="intent" value="draft" disabled={busy}>{t.save}</Button><Button type="submit" name="intent" value="publish" disabled={busy}>{t.publish}</Button><Button type="button" variant="secondary" onClick={()=>setEditing(null)}>{id?"Batal":"Cancel"}</Button></div></form></Card>:null}
      {articles.length?articles.map(a=><Card key={a.id} className="ui-cluster"><div className="ui-stack" style={{flex:"1 1 14rem"}}><strong>{a.title_id}</strong><span className="ui-caption">{id?"Penulis asli: ":"Original author: "}{a.df_blog_contributors?.display_name||contributor?.display_name||"—"}</span><span className="ui-caption">{a.updated_at?new Date(a.updated_at).toLocaleString(id?"id-ID":"en-US"):""}</span><Badge variant={a.status==="published"?"success":"neutral"}>{a.status==="published"?t.published:t.draft}</Badge></div><Button size="sm" variant="secondary" onClick={()=>setEditing(a)}>{t.edit}</Button>{isOwner?<Button size="sm" variant="danger" disabled={busy} onClick={async()=>{if(!window.confirm(id?"Hapus artikel ini secara permanen?":"Permanently delete this article?"))return;setBusy(true);const response=await fetch(`/api/blog/articles/${a.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${session.access_token}`}});const result=await response.json().catch(()=>({}));if(!response.ok)setError(result.error||"Unable to delete article.");else{setMessage(id?"Artikel berhasil dihapus.":"Article deleted.");await load(session);}setBusy(false);}}>{id?"Hapus":"Delete"}</Button>:null}</Card>):<EmptyState title={t.noArticles}/>}
      <Button variant="ghost" onClick={signOut}>{t.logout}</Button>
    </section>:null}
  </main>;
}
