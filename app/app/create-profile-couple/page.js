"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function CreateCoupleProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const en = language === "en";
  const [maleNickname, setMaleNickname] = useState("");
  const [femaleNickname, setFemaleNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/login?next=%2Fapp%2Fcreate-profile-couple"); return; }
        const response = await fetch("/api/couple", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
        const result = await response.json();
        if (response.status === 401) { router.replace("/login"); return; }
        if (!response.ok) throw new Error(result.error || "Unable to check profile.");
        if (result.profile?.slug) { router.replace(`/app/create-profile-couple/${result.profile.slug}`); return; }
      } catch (err) { if (active) setError(err.message); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [router]);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const response = await fetch("/api/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ maleNickname, femaleNickname }),
      });
      const result = await response.json();
      if (response.status === 409 && result.profile?.slug) { router.replace(`/app/create-profile-couple/${result.profile.slug}`); return; }
      if (!response.ok) throw new Error(result.error || "Unable to create profile.");
      setSuccess(true);
      window.setTimeout(() => router.replace(`/app/create-profile-couple/${result.profile.slug}`), 3000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="df-couple-editor"><p>{en ? "Loading..." : "Memuat..."}</p></main>;
  return <main className="df-couple-editor">
    <section className="df-couple-editor-card">
      <p className="df-couple-editor-eyebrow">DAJJAL FAMILY · COUPLE PROFILE</p>
      <h1>{en ? "Create your Couple Profile" : "Buat Profil Couple"}</h1>
      <p>{en ? "One profile for your couple story. Only one partner needs a Dajjal Family account." : "Satu profil untuk cerita pasangan kalian. Hanya satu pasangan yang perlu memiliki akun Dajjal Family."}</p>
      {success ? <div className="df-couple-notice success">{en ? "Couple Profile created successfully. Continue to edit it." : "Pembuatan profil pasangan berhasil. Lanjut untuk mengeditnya."}</div> : <form onSubmit={submit}>
        <label>{en ? "Male nickname" : "Nickname laki-laki"}<input required maxLength={40} value={maleNickname} onChange={e=>setMaleNickname(e.target.value)} placeholder={en ? "Enter nickname" : "Masukkan nickname"} /></label>
        <label>{en ? "Female nickname" : "Nickname perempuan"}<input required maxLength={40} value={femaleNickname} onChange={e=>setFemaleNickname(e.target.value)} placeholder={en ? "Enter nickname" : "Masukkan nickname"} /></label>
        {error && <p className="df-couple-error" role="alert">{error}</p>}
        <button disabled={saving}>{saving ? (en ? "Creating..." : "Membuat...") : (en ? "Create Couple Profile" : "Buat Profil Couple")}</button>
      </form>}
      {error && success === false && <p className="df-couple-error" role="alert">{error}</p>}
    </section>
  </main>;
}
