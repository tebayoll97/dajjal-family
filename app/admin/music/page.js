"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useAdminAuth } from "@/app/components/AdminAuthProvider";
import { useLanguage } from "@/app/components/LanguageProvider";
import "./music.css";

const copy = {
  id: {
    title: "Music Library", subtitle: "Kelola katalog musik DAJJAL FAMILY.",
    add: "Tambah Musik", search: "Cari judul, artis, Music ID, genre...",
    all: "Semua", published: "Published", draft: "Draft", archived: "Archived",
    genre: "Genre", sort: "Urutkan", recent: "Terbaru ditambahkan", updated: "Terakhir diperbarui",
    titleAsc: "Judul A–Z", titleDesc: "Judul Z–A", duration: "Durasi", size: "Ukuran file",
    empty: "Belum ada musik di katalog.", emptyHint: "Tambahkan audio pertama untuk mulai membangun katalog.",
    loading: "Memuat katalog...", failed: "Katalog belum tersedia. Pastikan migrasi database telah disetujui dan diterapkan.",
    retry: "Coba lagi", count: "lagu", idLabel: "MUSIC ID", noArtist: "Artis belum diisi",
    noGenre: "Tanpa genre", filters: "Filter tambahan", clear: "Reset filter", open: "Buka detail",
  },
  en: {
    title: "Music Library", subtitle: "Manage the DAJJAL FAMILY music catalog.",
    add: "Add Music", search: "Search title, artist, Music ID, genre...",
    all: "All", published: "Published", draft: "Draft", archived: "Archived",
    genre: "Genre", sort: "Sort by", recent: "Recently added", updated: "Recently updated",
    titleAsc: "Title A–Z", titleDesc: "Title Z–A", duration: "Duration", size: "File size",
    empty: "No music in the catalog yet.", emptyHint: "Add your first audio track to start the catalog.",
    loading: "Loading catalog...", failed: "Catalog is not available. Ensure the database migration has been approved and applied.",
    retry: "Retry", count: "tracks", idLabel: "MUSIC ID", noArtist: "Artist not provided",
    noGenre: "No genre", filters: "Additional filters", clear: "Clear filters", open: "Open details",
  },
};

function formatDuration(value) {
  const seconds = Number(value) || 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
function formatBytes(value) {
  const bytes = Number(value) || 0;
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AdminMusicCatalogPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { session } = useAdminAuth();
  const token = session?.access_token || "";
  const t = copy[language] || copy.id;
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");



  const loadCatalog = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setNotice("");
    const params = new URLSearchParams({ q: query, status, sort });
    if (genre) params.set("genre", genre);
    try {
      const response = await fetch(`/api/admin/music?${params}`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || t.failed);
      setItems(result.items || []);
    } catch (error) {
      setNotice(error.message || t.failed);
    } finally {
      setLoading(false);
    }
  }, [token, query, status, genre, sort, t.failed]);

  useEffect(() => { if (token) loadCatalog(); }, [token, loadCatalog]);
  const genres = useMemo(() => [...new Set(items.map((item) => item.genre).filter(Boolean))].sort(), [items]);



  return (
    <main className="music-page">
      <div className="music-shell">
        <header className="music-header">
          <div>
            <Link href="/admin" className="music-back">← {language === "id" ? "Dashboard Admin" : "Admin Dashboard"}</Link>
            <p className="music-eyebrow">DAJJAL FAMILY / ADMIN</p>
            <h1>{t.title}</h1>
            <p className="music-subtitle">{t.subtitle}</p>
          </div>
          <Link href="/admin/music/new" className="music-primary"><span aria-hidden="true">＋</span>{t.add}</Link>
        </header>

        <section className="music-panel" aria-label="Music catalog filters">
          <div className="music-search-wrap">
            <span aria-hidden="true">⌕</span>
            <input aria-label={t.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
            {query && <button type="button" onClick={() => setQuery("")} aria-label={language === "id" ? "Hapus pencarian" : "Clear search"}>×</button>}
          </div>
          <div className="music-filter-row">
            <div className="music-filter-group">
              <span className="music-filter-label">Status</span>
              <div className="music-chips">
                {["all", "published", "draft", "archived"].map((value) => (
                  <button key={value} type="button" className={status === value ? "music-chip is-active" : "music-chip"} onClick={() => setStatus(value)}>{t[value]}</button>
                ))}
              </div>
            </div>
            <label className="music-select-label">
              <span className="music-filter-label">{t.sort}</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="recent">{t.recent}</option><option value="updated">{t.updated}</option>
                <option value="title_asc">{t.titleAsc}</option><option value="title_desc">{t.titleDesc}</option>
                <option value="duration">{t.duration}</option><option value="size">{t.size}</option>
              </select>
            </label>
            <label className="music-select-label">
              <span className="music-filter-label">{t.genre}</span>
              <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                <option value="">{t.all}</option>
                {genres.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="music-filter-footer">
            <span>{items.length} {t.count}</span>
            <button type="button" onClick={() => { setQuery(""); setStatus("all"); setGenre(""); setSort("recent"); }} className="music-text-button">{t.clear}</button>
          </div>
        </section>

        {notice ? <div className="music-alert" role="alert"><span>{notice}</span><button type="button" onClick={loadCatalog}>{t.retry}</button></div> : null}
        {loading ? <div className="music-state" aria-live="polite">{t.loading}</div> : items.length === 0 && !notice ? (
          <div className="music-empty"><div className="music-empty-icon">♫</div><h2>{t.empty}</h2><p>{t.emptyHint}</p><Link href="/admin/music/new" className="music-primary">{t.add}</Link></div>
        ) : (
          <section className="music-list" aria-label={t.title}>
            {items.map((item) => (
              <Link className="music-item" href={`/admin/music/${item.id}`} key={item.id}>
                <div className="music-art" aria-hidden="true">♫</div>
                <div className="music-item-main">
                  <div className="music-item-heading"><h2>{item.title}</h2><span className={`music-status status-${item.status}`}>{item.status}</span></div>
                  <p>{item.artist || t.noArtist} · {item.genre || t.noGenre}</p>
                  <div className="music-item-meta"><span>{item.music_id}</span><span>{formatDuration(item.audio_duration_seconds)}</span><span>{formatBytes(item.audio_size_bytes)}</span></div>
                </div>
                <span className="music-item-arrow" aria-hidden="true">›</span>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
