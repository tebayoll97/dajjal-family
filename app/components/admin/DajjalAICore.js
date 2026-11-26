"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";
import {
  Badge, Button, Card, EmptyState, FeedbackDialog, SectionHeader, SwitchField, TextField
} from "@/app/components/ui";

const DEFAULT_SETTINGS = { enabled: false, times: ["10:00", "14:00", "20:00"] };

function formatDate(value, locale) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short",
  }).format(date);
}

export default function DajjalAICore() {
  const { language } = useLanguage();
  const id = language === "id";
  const [session, setSession] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [drafts, setDrafts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async (activeSession) => {
    if (!activeSession?.access_token) return;
    const response = await fetch("/api/admin/dajjalai-core", {
      headers: { Authorization: `Bearer ${activeSession.access_token}` },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Unable to load DAJJAL AI Core.");
    setSettings(result.settings || DEFAULT_SETTINGS);
    setDrafts(result.drafts || []);
    setHistory(result.history || []);
  }, []);

  useEffect(() => {
    let active = true;
    supabaseAdminClient.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      try {
        await load(data.session);
      } catch (err) {
        if (active) setError(err.message || "Unable to load settings.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [load]);

  function updateTime(index, value) {
    setSettings((current) => ({
      ...current,
      times: current.times.map((time, i) => i === index ? value : time),
    }));
  }

  async function save(event) {
    event.preventDefault();
    if (!session?.access_token || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/dajjalai-core", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(settings),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to save settings.");
      setSettings(result.settings);
      setMessage(id ? "Pengaturan auto-post berhasil disimpan." : "Auto-post settings saved.");
      await load(session);
    } catch (err) {
      setError(err.message || (id ? "Gagal menyimpan pengaturan." : "Unable to save settings."));
    } finally {
      setSaving(false);
    }
  }

  const statusLabel = (status) => {
    const labels = id
      ? { processing: "Memproses", published: "Terbit", no_draft: "Tidak ada draft", failed: "Gagal" }
      : { processing: "Processing", published: "Published", no_draft: "No draft", failed: "Failed" };
    return labels[status] || status;
  };

  return (
    <main className="ui-page ui-stack">
      <header className="ui-page-heading">
        <p className="ui-eyebrow">DAJJAL FAMILY / ADMIN / AI CORE</p>
        <h1 className="ui-heading-h1">DAJJAL AI CORE</h1>
        <p className="ui-subtitle">
          {id
            ? "Atur publikasi artikel otomatis dari antrean draft Blog."
            : "Control automatic publishing from the Blog draft queue."}
        </p>
      </header>

      <FeedbackDialog
        open={Boolean(error || message)}
        onClose={() => { setError(""); setMessage(""); }}
        title={error ? (id ? "Terjadi kendala" : "Something went wrong") : (id ? "Berhasil" : "Success")}
        message={error || message}
        variant={error ? "danger" : "success"}
        closeLabel={id ? "Tutup" : "Close"}
      />

      {loading ? <Card><p className="ui-caption">{id ? "Memuat pengaturan…" : "Loading settings…"}</p></Card> : (
        <>
          <Card className="ui-stack">
            <SectionHeader
              title={id ? "Pengaturan Auto Post" : "Auto Post Settings"}
              description={id ? "Pengaturan disimpan di database dan tetap aktif tanpa membuka dashboard." : "Settings are stored in the database and continue running without the dashboard being open."}
            />
            <form className="ui-stack" onSubmit={save}>
              <SwitchField
                label={id ? "Aktifkan Auto Post" : "Enable Auto Post"}
                description={id
                  ? "Jika aktif, setiap jadwal akan menerbitkan satu draft tertua yang siap dipublikasikan."
                  : "When enabled, each schedule publishes one oldest draft that is ready to publish."}
                checked={settings.enabled}
                onChange={(enabled) => setSettings((current) => ({ ...current, enabled }))}
                disabled={saving}
              />
              <div className="ui-stack">
                <SectionHeader
                  title={id ? "Tiga Jadwal Harian (WIB)" : "Three Daily Schedules (WIB)"}
                  description={id ? "Gunakan format 24 jam. Ketiga waktu harus berbeda." : "Use 24-hour time. All three times must be different."}
                />
                <div className="ui-grid-3">
                  {settings.times.map((time, index) => (
                    <TextField
                      key={index}
                      label={id ? `Jadwal ${index + 1}` : `Schedule ${index + 1}`}
                      type="time"
                      value={time}
                      onChange={(event) => updateTime(index, event.target.value)}
                      required
                      disabled={saving}
                    />
                  ))}
                </div>
              </div>
              <p className="ui-caption">
                {id
                  ? "Setiap jadwal aktif memproses maksimal satu artikel. Jika tidak ada draft, jadwal dilewati. Publikasi memakai penerjemahan AI yang sudah digunakan Blog."
                  : "Each active slot processes at most one article. Empty queues are skipped. Publishing uses the Blog's existing AI translation flow."}
              </p>
              <Button type="submit" disabled={saving || loading}>
                {saving ? (id ? "Menyimpan…" : "Saving…") : (id ? "Simpan Pengaturan" : "Save Settings")}
              </Button>
            </form>
          </Card>

          <section className="ui-stack">
            <SectionHeader
              title={id ? "Antrean Draft" : "Draft Queue"}
              description={id ? "Urutan dari draft paling lama ke paling baru." : "Ordered from oldest draft to newest."}
            />
            {drafts.length ? drafts.map((article, index) => (
              <Card key={article.id} className="ui-stack">
                <div className="ui-cluster">
                  <Badge>{id ? `Urutan ${index + 1}` : `Queue ${index + 1}`}</Badge>
                  <Badge variant="warning">{id ? "Draft" : "Draft"}</Badge>
                  {article.source_locale ? <Badge>{article.source_locale.toUpperCase()}</Badge> : null}
                </div>
                <strong>{id ? article.title_id : (article.title_en || article.title_id)}</strong>
                <p className="ui-caption">
                  {article.df_contributors?.display_name || "—"} · {formatDate(article.created_at, language)}
                </p>
              </Card>
            )) : (
              <EmptyState
                title={id ? "Belum ada draft artikel" : "No article drafts yet"}
                description={id ? "Artikel draft yang dibuat di Blog akan muncul di antrean ini." : "Drafts created in Blog will appear in this queue."}
              />
            )}
          </section>

          <section className="ui-stack">
            <SectionHeader
              title={id ? "Riwayat Auto Post" : "Auto Post History"}
              description={id ? "Catatan proses publikasi otomatis terbaru." : "Recent automatic publishing activity."}
            />
            {history.length ? history.map((entry) => (
              <Card key={entry.id} className="ui-stack">
                <div className="ui-cluster">
                  <Badge variant={entry.status === "published" ? "success" : entry.status === "failed" ? "danger" : "neutral"}>
                    {statusLabel(entry.status)}
                  </Badge>
                  <Badge>{entry.slot_key?.replace("slot_", id ? "Jadwal " : "Slot ")}</Badge>
                  <Badge>{String(entry.scheduled_time || "").slice(0, 5)} WIB</Badge>
                </div>
                <strong>{id
                  ? (entry.df_blog_articles?.title_id || (entry.status === "no_draft" ? "Tidak ada draft pada jadwal ini" : "Artikel"))
                  : (entry.df_blog_articles?.title_en || entry.df_blog_articles?.title_id || (entry.status === "no_draft" ? "No draft at this time" : "Article"))}</strong>
                <p className="ui-caption">
                  {formatDate(entry.created_at, language)} · {id ? `Percobaan: ${entry.attempts}` : `Attempts: ${entry.attempts}`}
                </p>
                {entry.error_message ? <p className="ui-field-error">{entry.error_message}</p> : null}
              </Card>
            )) : (
              <EmptyState title={id ? "Belum ada riwayat" : "No history yet"} />
            )}
          </section>
        </>
      )}
    </main>
  );
}
