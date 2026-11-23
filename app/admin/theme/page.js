"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { verifyAdminSession } from "@/lib/adminClientSession";
import { useLanguage } from "@/app/components/LanguageProvider";
import { getThemeTokens } from "@/app/theme/themeTokens";
import { THEME_REGISTRY } from "@/app/theme/themeRegistry";
import { Alert, Badge, Button, Card, ConfirmDialog, PageHeader, VerificationState } from "@/app/components/ui";

const copy = {
  en: {
    back:"Back to dashboard", title:"Theme Preset Manager",
    subtitle:"Choose a named global identity, then inspect its Light and Dark appearance.",
    preview:"Preset preview", previewNote:"This isolated preview is local only and never changes the visitor-facing website.",
    mode:"Preview mode", dark:"Dark", light:"Light", catalog:"Global preset catalog",
    active:"Current visitor preset", selected:"Draft selection", select:"Select for preview",
    selectedLabel:"Selected for preview", tecnoDesc:"The Dajjal Family purple, indigo, and cyan visual identity.",
    coupleDesc:"Azure blue and white in Light Mode; crimson red and black in Dark Mode.",
    protectedTitle:"Page-scoped & isolated experiences",
    protectedNote:"Couple remains page-scoped. Wedding and Games remain protected isolated experiences.",
    governance:"Publishing status",
    governanceNote:"Publishing changes the global identity for standard website pages. Couple, Wedding, and Games retain their protected scopes.",
    noPublish:"No visitor-facing changes have been published.",
    publish:"Publish selected preset", publishing:"Publishing...", confirmTitle:"Publish global preset?",
    confirmPublish:"This changes the global identity for standard website pages. Continue?",
    published:"Global preset published successfully.", publishError:"Unable to publish the preset.",
    denied:"Administrator access denied.", error:"Unable to verify administrator access.",
    primary:"Primary action", secondary:"Secondary action", current:"ACTIVE", previewBadge:"LOCAL PREVIEW",
  },
  id: {
    back:"Kembali ke dashboard", title:"Pengelola Preset Tema",
    subtitle:"Pilih identitas global, lalu periksa tampilannya dalam mode Terang dan Gelap.",
    preview:"Pratinjau preset", previewNote:"Pratinjau terisolasi dan hanya berlaku lokal. Tema pengunjung tidak berubah.",
    mode:"Mode pratinjau", dark:"Gelap", light:"Terang", catalog:"Katalog preset global",
    active:"Preset pengunjung saat ini", selected:"Pilihan draf", select:"Pilih untuk pratinjau",
    selectedLabel:"Dipilih untuk pratinjau", tecnoDesc:"Identitas visual Dajjal Family: ungu, indigo, dan cyan.",
    coupleDesc:"Biru azure dan putih pada mode Terang; merah crimson dan hitam pada mode Gelap.",
    protectedTitle:"Pengalaman khusus & terisolasi",
    protectedNote:"Couple tetap memiliki styling khusus halaman. Wedding dan Games tetap menjadi pengalaman terisolasi yang dilindungi.",
    governance:"Status publikasi",
    governanceNote:"Publikasi mengubah identitas global halaman standar. Couple, Wedding, dan Games tetap mempertahankan cakupan khususnya.",
    noPublish:"Belum ada perubahan yang dipublikasikan ke pengunjung.",
    publish:"Terbitkan preset terpilih", publishing:"Menerbitkan...", confirmTitle:"Terbitkan preset global?",
    confirmPublish:"Tindakan ini mengubah identitas global halaman standar. Lanjutkan?",
    published:"Preset global berhasil diterbitkan.", publishError:"Preset tidak dapat diterbitkan.",
    denied:"Akses administrator ditolak.", error:"Tidak dapat memverifikasi akses administrator.",
    primary:"Aksi utama", secondary:"Aksi sekunder", current:"AKTIF", previewBadge:"PRATINJAU LOKAL",
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
  const [activePreset, setActivePreset] = useState("tecno");
  const [accessToken, setAccessToken] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error: sessionError } = await supabaseAdminClient.auth.getSession();
        if (sessionError) throw sessionError;
        const session = data?.session;
        if (!session) { router.replace("/admin/login"); return; }
        const response = await verifyAdminSession(session);
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
        if (active) {
          setAdmin(result.admin);
          setAccessToken(session.access_token);
        }
        const themeResponse = await fetch("/api/admin/theme", {
          headers: { Authorization: "Bearer " + session.access_token },
          cache: "no-store",
        });
        const themeResult = await themeResponse.json().catch(() => ({}));
        if (!themeResponse.ok) throw new Error(themeResult.error || t.error);
        if (active && GLOBAL_PRESETS.includes(themeResult.activeThemePreset)) {
          setActivePreset(themeResult.activeThemePreset);
          setDraftPreset(themeResult.activeThemePreset);
        }
      } catch (e) {
        if (active) setError(e.message || t.error);
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [router, t.error]);

  const publishPreset = async () => {
    if (publishing || draftPreset === activePreset) return;
    setConfirmOpen(false);
    setPublishing(true);
    setPublishStatus("");
    try {
      const response = await fetch("/api/admin/theme", {
        method: "PATCH",
        headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
        body: JSON.stringify({ activeThemePreset: draftPreset }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || t.publishError);
      setActivePreset(result.activeThemePreset);
      setPublishStatus(t.published);
    } catch (e) {
      setPublishStatus(e.message || t.publishError);
    } finally {
      setPublishing(false);
    }
  };

  const tokens = useMemo(() => getThemeTokens(draftPreset, mode), [draftPreset, mode]);
  const previewStyle = {
    background: tokens["--df-bg"],
    color: tokens["--df-text"],
    borderColor: tokens["--df-border"],
    "--df-bg": tokens["--df-bg"],
    "--df-surface": tokens["--df-surface"],
    "--df-surface-raised": tokens["--df-surface-raised"],
    "--df-text": tokens["--df-text"],
    "--df-text-secondary": tokens["--df-text-secondary"],
    "--df-border": tokens["--df-border"],
    "--df-primary": tokens["--df-primary"],
    "--df-on-primary": tokens["--df-on-primary"],
    "--df-accent": tokens["--df-accent"],
  };

  if (checking) return <div className="df-theme-manager__verification"><VerificationState variant="admin" /></div>;
  if (!admin) return <main className="df-theme-manager"><Card className="df-theme-manager__denied"><Badge variant="danger">{t.denied}</Badge><h1 className="ui-heading-h2">{t.denied}</h1><Alert variant="danger">{error || t.error}</Alert><Button onClick={() => router.replace("/admin/login")}>ADMIN LOGIN</Button></Card></main>;

  return (
    <main className="df-theme-manager">
      <div className="df-theme-manager__inner">
        <Link href="/admin" className="ui-link ui-link-subtle">{t.back}</Link>
        <PageHeader eyebrow="DAJJAL FAMILY · ADMIN CONTROL" title={t.title} description={t.subtitle} />
        <div className="df-theme-manager__layout">
          <Card className="df-theme-manager__preview">
            <div className="df-theme-manager__section-head"><div><Badge variant="info">{t.previewBadge}</Badge><h2 className="ui-heading-h3">{t.preview}</h2><p className="ui-section-description">{t.previewNote}</p></div></div>
            <div className="ui-cluster" role="group" aria-label={t.mode}>
              <Button size="sm" variant={mode === "dark" ? "primary" : "secondary"} aria-pressed={mode === "dark"} onClick={() => setMode("dark")}>{t.dark}</Button>
              <Button size="sm" variant={mode === "light" ? "primary" : "secondary"} aria-pressed={mode === "light"} onClick={() => setMode("light")}>{t.light}</Button>
            </div>
            <section className="df-theme-manager__live-preview" style={previewStyle}>
              <div className="df-theme-manager__preview-top"><strong>DAJJAL FAMILY</strong><Badge>{mode.toUpperCase()}</Badge></div>
              <div className="df-theme-manager__preview-body">
                <p className="ui-eyebrow" style={{ color: "var(--df-accent)" }}>ONE ECOSYSTEM · MANY POSSIBILITIES</p>
                <h2 className="ui-heading-h2">One Family. Many Possibilities.</h2>
                <p className="ui-section-description">Preview semantic surfaces, readable text, borders, and primary actions.</p>
                <div className="ui-cluster">
                  <span className="df-theme-manager__sample-primary">{t.primary}</span>
                  <span className="df-theme-manager__sample-secondary">{t.secondary}</span>
                </div>
              </div>
            </section>
          </Card>

          <aside className="df-theme-manager__side">
            <Card className="df-theme-manager__status">
              <p className="df-theme-manager__label">{t.active}</p>
              <div className="ui-cluster"><Badge variant="success">{t.current}</Badge><strong>{THEME_REGISTRY[activePreset]?.label || activePreset}</strong></div>
              <p className="df-theme-manager__label">{t.selected}</p>
              <strong>{THEME_REGISTRY[draftPreset].label}</strong>
            </Card>
            <Card className="df-theme-manager__catalog">
              <h2 className="ui-heading-h3">{t.catalog}</h2>
              <div className="df-theme-manager__preset-list">
                {GLOBAL_PRESETS.map((id) => {
                  const entry = THEME_REGISTRY[id];
                  const selected = draftPreset === id;
                  return (
                    <button key={id} type="button" aria-pressed={selected} onClick={() => setDraftPreset(id)} className={selected ? "df-theme-manager__preset is-selected" : "df-theme-manager__preset"}>
                      <span className="df-theme-manager__preset-head"><strong>{entry.label}</strong>{selected ? <Badge variant="success">{t.selectedLabel}</Badge> : <Badge>{t.select}</Badge>}</span>
                      <span className="df-theme-manager__preset-description">{id === "tecno" ? t.tecnoDesc : t.coupleDesc}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </aside>
        </div>

        <Card className="df-theme-manager__notice">
          <h2 className="ui-heading-h3">{t.protectedTitle}</h2>
          <p>{t.protectedNote}</p>
        </Card>
        <Card className="df-theme-manager__governance">
          <Badge variant="warning">{t.governance}</Badge>
          <p>{t.governanceNote}</p>
          <div className="ui-cluster">
            <Button loading={publishing} disabled={draftPreset === activePreset} onClick={() => setConfirmOpen(true)}>{publishing ? t.publishing : t.publish}</Button>
            <span className="df-theme-manager__publish-status" role="status" aria-live="polite">{publishStatus || (draftPreset === activePreset ? t.noPublish : "")}</span>
          </div>
        </Card>
        <footer className="df-theme-manager__footer">DAJJAL FAMILY · THEME CONTROL · {admin.email}</footer>
      </div>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={publishPreset} title={t.confirmTitle} description={t.confirmPublish} confirmLabel={t.publish} cancelLabel={language === "id" ? "Batal" : "Cancel"} loading={publishing} />
    </main>
  );
}
