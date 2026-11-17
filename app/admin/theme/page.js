"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";
import { getThemeTokens } from "@/app/theme/themeTokens";
import { THEME_REGISTRY } from "@/app/theme/themeRegistry";

const copy = {
  en: {
    checking:"VERIFYING ADMIN ACCESS...", back:"BACK TO DASHBOARD", title:"THEME PRESET MANAGER",
    subtitle:"Choose a named global identity, then inspect its Light and Dark appearance.",
    preview:"PRESET PREVIEW", previewNote:"This is an isolated local preview. It never changes the visitor-facing website.",
    mode:"PREVIEW MODE", dark:"Dark", light:"Light", catalog:"GLOBAL PRESET CATALOG",
    active:"CURRENT VISITOR PRESET", current:"TECNO (temporary fallback)", selected:"DRAFT SELECTION",
    select:"Select for preview", selectedLabel:"Selected for preview", tecnoDesc:"The existing Dajjal Family purple, indigo, and cyan visual identity.",
    coupleDesc:"Azure blue and white in Light Mode; crimson red and black in Dark Mode, based on the Couple page identity.",
    scope:"GLOBAL PRESET", protectedTitle:"PAGE-SCOPED & ISOLATED EXPERIENCES",
    protectedNote:"Couple page styling remains page-scoped. Wedding and Games remain protected isolated experiences and are not global presets.",
    governance:"PUBLISHING STATUS",
    governanceNote:"Publishing is intentionally unavailable in this stage. It requires a persistent server-side active-preset setting, a protected admin write API, public read contract, and separate approval before any production database change.",
    noPublish:"No visitor-facing changes have been published.", denied:"Administrator access denied.", error:"Unable to verify administrator access.",
  },
  id: {
    checking:"MEMVERIFIKASI AKSES ADMIN...", back:"KEMBALI KE DASHBOARD", title:"PENGELOLA PRESET TEMA",
    subtitle:"Pilih identitas global bernama, lalu periksa tampilannya dalam mode Terang dan Gelap.",
    preview:"PRATINJAU PRESET", previewNote:"Pratinjau ini terisolasi dan hanya berlaku lokal. Tema website pengunjung tidak berubah.",
    mode:"MODE PRATINJAU", dark:"Gelap", light:"Terang", catalog:"KATALOG PRESET GLOBAL",
    active:"PRESET PENGUNJUNG SAAT INI", current:"TECNO (fallback sementara)", selected:"PILIHAN DRAF",
    select:"Pilih untuk pratinjau", selectedLabel:"Dipilih untuk pratinjau", tecnoDesc:"Identitas visual Dajjal Family yang sudah ada: ungu, indigo, dan cyan.",
    coupleDesc:"Biru azure dan putih pada mode Terang; merah crimson dan hitam pada mode Gelap, mengikuti identitas halaman Couple.",
    scope:"PRESET GLOBAL", protectedTitle:"PENGALAMAN KHUSUS & TERISOLASI",
    protectedNote:"Styling halaman Couple tetap khusus halaman. Wedding dan Games tetap menjadi pengalaman terisolasi yang dilindungi, bukan preset global.",
    governance:"STATUS PUBLIKASI",
    governanceNote:"Publikasi sengaja belum diaktifkan pada tahap ini. Diperlukan penyimpanan preset aktif di server, API tulis admin yang terlindungi, kontrak baca publik, serta persetujuan terpisah sebelum perubahan database produksi.",
    noPublish:"Belum ada perubahan yang dipublikasikan ke pengunjung.", denied:"Akses administrator ditolak.", error:"Tidak dapat memverifikasi akses administrator.",
  },
};

const GLOBAL_PRESETS = ["tecno", "dajjal-veylora"];

export default function AdminThemePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language] || copy.en;
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("dark");
  const [draftPreset, setDraftPreset] = useState("tecno");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error: sessionError } = await supabaseAdminClient.auth.getSession();
        if (sessionError) throw sessionError;
        const session = data?.session;
        if (!session) { router.replace("/admin/login"); return; }
        const response = await fetch("/api/admin/me", {
          headers: { Authorization: "Bearer " + session.access_token },
          cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            await supabaseAdminClient.auth.signOut();
            router.replace("/admin/login");
            return;
          }
          throw new Error(result.error || t.error);
        }
        if (!result.admin) throw new Error(t.error);
        if (active) setAdmin(result.admin);
      } catch (e) {
        if (active) setError(e.message || t.error);
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [router, t.error]);

  const tokens = useMemo(() => getThemeTokens(draftPreset, mode), [draftPreset, mode]);
  const previewStyle = {
    background: tokens["--df-bg"],
    color: tokens["--df-text"],
    borderColor: tokens["--df-border"],
    "--p-surface": tokens["--df-surface"],
    "--p-raised": tokens["--df-surface-raised"],
    "--p-secondary": tokens["--df-text-secondary"],
    "--p-border": tokens["--df-border"],
    "--p-primary": tokens["--df-primary"],
    "--p-on-primary": tokens["--df-on-primary"],
    "--p-accent": tokens["--df-accent"],
  };

  if (checking) return <main className="min-h-screen grid place-items-center bg-[#080711] text-purple-200">{t.checking}</main>;
  if (!admin) return <main className="min-h-screen grid place-items-center bg-[#080711] px-5 text-center text-white"><div><h1 className="text-2xl font-black">{t.denied}</h1><p role="alert" className="mt-3 text-sm text-red-300">{error}</p><button onClick={() => router.replace("/admin/login")} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-bold">ADMIN LOGIN</button></div></main>;

  return (
    <main className="min-h-screen bg-[#080711] px-4 py-7 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="inline-flex min-h-11 items-center rounded-xl border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-200">← {t.back}</Link>
        <header className="my-7">
          <p className="text-[10px] font-extrabold tracking-[.22em] text-cyan-300">DAJJAL FAMILY · ADMIN CONTROL</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-400">{t.subtitle}</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
          <div className="min-w-0 rounded-2xl border border-purple-500/20 bg-[#151020] p-4 sm:p-6">
            <div className="text-[10px] font-extrabold tracking-[.2em] text-cyan-300">{t.preview}</div>
            <p className="mt-1 text-xs text-gray-400">{t.previewNote}</p>
            <div className="mt-4 flex gap-2" role="group" aria-label={t.mode}>
              {["dark", "light"].map((value) => (
                <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}
                  className={mode === value ? "min-h-11 rounded-xl border border-purple-300 bg-purple-500/20 px-4 text-xs font-bold text-purple-100" : "min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-gray-300"}>
                  {value === "dark" ? t.dark : t.light}
                </button>
              ))}
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border p-4 sm:p-6" style={previewStyle}>
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--p-border)" }}>
                <strong>DAJJAL FAMILY</strong>
                <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: "var(--p-raised)" }}>{mode.toUpperCase()}</span>
              </div>
              <div className="py-9">
                <p className="text-[10px] font-bold tracking-[.2em]" style={{ color: "var(--p-accent)" }}>ONE ECOSYSTEM · MANY POSSIBILITIES</p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">One Family. Many Possibilities.</h2>
                <p className="mt-3 max-w-lg text-sm" style={{ color: "var(--p-secondary)" }}>Preview semantic surfaces, readable text, borders, and primary actions.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-xl px-4 py-3 text-xs font-bold" style={{ background: "var(--p-primary)", color: "var(--p-on-primary)" }}>Primary action</span>
                  <span className="rounded-xl border px-4 py-3 text-xs font-bold" style={{ borderColor: "var(--p-border)", background: "var(--p-surface)" }}>Secondary action</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-purple-500/20 bg-[#151020] p-4 sm:p-5">
              <p className="text-[10px] font-extrabold tracking-[.18em] text-gray-500">{t.active}</p>
              <p className="mt-2 text-sm font-bold text-cyan-200">{t.current}</p>
              <p className="mt-5 text-[10px] font-extrabold tracking-[.18em] text-gray-500">{t.selected}</p>
              <p className="mt-2 text-sm font-bold">{THEME_REGISTRY[draftPreset].label}</p>
            </section>
            <section className="rounded-2xl border border-purple-500/20 bg-[#151020] p-4 sm:p-5">
              <h2 className="text-sm font-extrabold">{t.catalog}</h2>
              <div className="mt-3 space-y-2">
                {GLOBAL_PRESETS.map((id) => {
                  const entry = THEME_REGISTRY[id];
                  const selected = draftPreset === id;
                  return (
                    <button key={id} type="button" aria-pressed={selected} onClick={() => setDraftPreset(id)}
                      className={selected ? "w-full rounded-xl border border-purple-300 bg-purple-500/15 p-3 text-left" : "w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"}>
                      <span className="flex items-center justify-between gap-2 text-sm font-bold">
                        {entry.label}<span className="text-[9px] font-extrabold tracking-wider text-cyan-300">{selected ? t.selectedLabel : t.select}</span>
                      </span>
                      <span className="mt-2 block text-xs leading-relaxed text-gray-400">{id === "tecno" ? t.tecnoDesc : t.coupleDesc}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </section>

        <section className="mt-7 rounded-2xl border border-white/10 bg-[#151020] p-4 sm:p-5">
          <p className="text-[10px] font-extrabold tracking-[.2em] text-cyan-300">{t.protectedTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{t.protectedNote}</p>
        </section>

        <section className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 sm:p-5">
          <p className="text-[10px] font-extrabold tracking-[.2em] text-amber-300">{t.governance}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-300">{t.governanceNote}</p>
          <p className="mt-3 text-xs font-bold text-amber-200">ℹ {t.noPublish}</p>
        </section>
        <footer className="mt-10 border-t border-white/10 pt-5 text-center text-[10px] font-bold tracking-[.18em] text-gray-600">DAJJAL FAMILY · THEME CONTROL · {admin.email}</footer>
      </div>
    </main>
  );
}
