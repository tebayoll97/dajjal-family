"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";

const COPY = {
  id: {
    eyebrow: "DAJJAL FAMILY · UNIVERSE",
    title: "GALERI COUPLE",
    subtitle: "Kumpulan cerita dan perjalanan pasangan dari keluarga Dajjal Family.",
    featured: "FEATURED STORY",
    special: "KISAH SPESIAL",
    specialTitle: "DAJJAL × VEYLORA",
    specialText: "Satu cerita istimewa yang menjadi bagian dari perjalanan Dajjal Family.",
    openSpecial: "JELAJAHI CERITA",
    collection: "COUPLE PROFILES",
    count: "profil dipublikasikan",
    loading: "Memuat galeri...",
    empty: "Belum ada Couple Profile yang dipublikasikan.",
    retry: "Coba lagi",
    error: "Galeri belum dapat dimuat. Silakan coba kembali.",
    page: "Halaman",
    of: "dari",
    previous: "SEBELUMNYA",
    next: "BERIKUTNYA",
    coverAlt: "Sampul Couple Profile",
  },
  en: {
    eyebrow: "DAJJAL FAMILY · UNIVERSE",
    title: "COUPLE GALLERY",
    subtitle: "A collection of stories and journeys from couples across Dajjal Family.",
    featured: "FEATURED STORY",
    special: "SPECIAL STORY",
    specialTitle: "DAJJAL × VEYLORA",
    specialText: "A special story woven into the journey of Dajjal Family.",
    openSpecial: "EXPLORE THE STORY",
    collection: "COUPLE PROFILES",
    count: "published profiles",
    loading: "Loading gallery...",
    empty: "There are no published Couple Profiles yet.",
    retry: "Try again",
    error: "The gallery could not be loaded. Please try again.",
    page: "Page",
    of: "of",
    previous: "PREVIOUS",
    next: "NEXT",
    coverAlt: "Couple Profile cover",
  },
};

export default function CoupleGalleryPage() {
  const { language } = useLanguage();
  const locale = language === "en" ? "en" : "id";
  const t = COPY[locale];
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGallery = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/couple/gallery?locale=${locale}&page=${page}&limit=24`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.error);
      setItems(result.items || []);
      setPagination(result.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }, [locale, t.error]);

  useEffect(() => { loadGallery(1); }, [loadGallery]);

  return (
    <main className="df-couple-gallery df-token-page">
      <div className="df-couple-gallery__inner">
        <header className="df-couple-gallery__intro">
          <p className="df-couple-gallery__eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </header>

        <section className="df-couple-gallery__featured" aria-labelledby="df-couple-featured-title">
          <div className="df-couple-gallery__featured-art">
            <img src="https://drive.google.com/thumbnail?id=1ft9M6JyMrdXsLncSVOm7yXiEEHH9LRQ_&sz=w1200" alt="Dajjal and Veylora" loading="eager" />
            <span>{t.featured}</span>
          </div>
          <div className="df-couple-gallery__featured-body">
            <p className="df-couple-gallery__eyebrow">{t.special}</p>
            <h2 id="df-couple-featured-title">{t.specialTitle}</h2>
            <p>{t.specialText}</p>
            <Link href={`/${locale}/df/couple`} className="df-couple-gallery__action">{t.openSpecial}<span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="df-couple-gallery__collection" aria-labelledby="df-couple-collection-title">
          <div className="df-couple-gallery__section-head">
            <div><p className="df-couple-gallery__eyebrow">DAJJAL FAMILY</p><h2 id="df-couple-collection-title">{t.collection}</h2></div>
            {!loading && <span>{pagination.total} {t.count}</span>}
          </div>

          {loading ? <p className="df-couple-gallery__state" role="status">{t.loading}</p> :
            error ? <div className="df-couple-gallery__state" role="alert"><p>{error}</p><button type="button" onClick={() => loadGallery(pagination.page)}>{t.retry}</button></div> :
            items.length === 0 ? <p className="df-couple-gallery__state">{t.empty}</p> :
            <>
              <div className="df-couple-gallery__grid">
                {items.map((item) => <Link className="df-couple-gallery__card" href={item.href} key={item.id} aria-label={`${item.maleNickname} × ${item.femaleNickname}`}>
                  <div className="df-couple-gallery__cover">
                    {item.coverUrl ? <img src={item.coverUrl} alt={t.coverAlt} loading="lazy" /> : <div className="df-couple-gallery__cover-fallback" aria-hidden="true">♡</div>}
                  </div>
                  <div className="df-couple-gallery__card-body">
                    <h3>{item.maleNickname} <span>×</span> {item.femaleNickname}</h3>
                    {item.subtitle && <p>{item.subtitle}</p>}
                  </div>
                  <span className="df-couple-gallery__card-arrow" aria-hidden="true">↗</span>
                </Link>)}
              </div>
              {pagination.totalPages > 1 && <nav className="df-couple-gallery__pagination" aria-label="Gallery pagination">
                <button type="button" disabled={loading || pagination.page <= 1} onClick={() => loadGallery(pagination.page - 1)}>{t.previous}</button>
                <span>{t.page} {pagination.page} {t.of} {pagination.totalPages}</span>
                <button type="button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => loadGallery(pagination.page + 1)}>{t.next}</button>
              </nav>}
            </>
          }
        </section>
      </div>
    </main>
  );
}
