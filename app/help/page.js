"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

const content = {
  id: {
    eyebrow: "DAJJAL FAMILY / PUSAT BANTUAN",
    title: "Ada yang bisa kami bantu?",
    lead: "Temukan panduan dan jawaban untuk menggunakan ekosistem DAJJAL FAMILY.",
    searchLabel: "Cari bantuan",
    searchPlaceholder: "Ketik pertanyaan atau kata kunci…",
    all: "Semua topik",
    noResults: "Belum ada jawaban yang cocok.",
    noResultsHint: "Coba kata kunci lain atau hubungi tim dukungan kami.",
    contact: "Hubungi tim dukungan",
    contactUs: "Informasi kontak",
    clear: "Hapus pencarian",
    resultCount: (n) => `${n} jawaban ditemukan`,
    categories: [
      { id: "getting-started", label: "Memulai" },
      { id: "account", label: "Akun & Profil" },
      { id: "gaming", label: "Gaming" },
      { id: "support", label: "Kontak & Dukungan" },
      { id: "community", label: "Komunitas" },
    ],
    faqs: [
      { id: "what-is-df", category: "getting-started", question: "Apa itu DAJJAL FAMILY?", answer: "DAJJAL FAMILY adalah semesta digital terpadu yang menghubungkan gaming, pengetahuan, blog, produk digital, bisnis, dan komunitas dalam satu ekosistem. Setiap bagian dapat berkembang dengan identitasnya sendiri sambil tetap terhubung.", keywords: "tentang semesta digital ekosistem pilar" },
      { id: "need-account", category: "getting-started", question: "Apakah saya harus membuat akun untuk menjelajahi website?", answer: "Tidak. Halaman publik dan katalog game dapat dijelajahi tanpa masuk. Akun diperlukan ketika kamu menggunakan fitur yang membutuhkan identitas, penyimpanan data, atau akses personal.", keywords: "login daftar akun pengunjung publik" },
      { id: "language", category: "getting-started", question: "Bagaimana cara mengganti bahasa website?", answer: "Gunakan pilihan ID dan EN di bagian atas website. Bahasa Indonesia dan English tersedia. Pilihan bahasa juga tercermin pada alamat halaman dengan awalan /id atau /en.", keywords: "bahasa indonesia english locale language" },
      { id: "theme", category: "getting-started", question: "Bagaimana cara mengganti tampilan terang atau gelap?", answer: "Gunakan tombol tema di bagian atas website untuk memilih Light atau Dark. Pada kunjungan pertama, tampilan mengikuti preferensi perangkat sampai kamu memilih tema secara manual.", keywords: "tema light dark terang gelap mode" },
      { id: "profile", category: "account", question: "Di mana saya dapat mengelola profil?", answer: "Setelah masuk ke akun, buka menu Profil dari navigasi website. Fitur dan informasi yang tersedia dapat berbeda sesuai status akun dan fitur yang sedang digunakan.", keywords: "profil edit profile akun nickname avatar" },
      { id: "games", category: "gaming", question: "Di mana saya dapat menemukan game DAJJAL FAMILY?", answer: "Buka Game Library melalui menu Gaming atau halaman /games. Katalog pengunjung menampilkan game yang sudah tersedia untuk dimainkan.", keywords: "game library permainan katalog gaming" },
      { id: "game-login", category: "gaming", question: "Apakah semua game harus menggunakan akun?", answer: "Tidak selalu. DAJJAL FAMILY menerapkan akses bertahap. Pengalaman publik tertentu dapat dimainkan tanpa masuk, sedangkan fitur seperti penyimpanan progres atau data personal dapat membutuhkan akun.", keywords: "login game guest progres progress akun" },
      { id: "contact-center", category: "support", question: "Bagaimana cara menghubungi tim dukungan?", answer: "Untuk memulai percakapan dukungan secara privat, masuk ke akun lalu buka Contact Center. Kamu dapat membuat percakapan baru dan mengikuti balasan melalui halaman tersebut.", keywords: "contact center bantuan pesan support hubungi" },
      { id: "support-categories", category: "support", question: "Topik apa saja yang dapat saya pilih di Contact Center?", answer: "Saat membuat percakapan, tersedia kategori Umum, Akun, Teknis, Laporan, dan Kemitraan. Pilih kategori yang paling mendekati kebutuhanmu agar pesan lebih mudah diarahkan.", keywords: "kategori umum akun teknis laporan kemitraan partnership" },
      { id: "discord", category: "community", question: "Bagaimana cara bergabung dengan Discord resmi?", answer: "Tautan Discord resmi akan dipublikasikan melalui website ketika komunitas siap dibuka. Untuk menghindari tautan palsu, gunakan hanya tautan yang diumumkan melalui kanal resmi DAJJAL FAMILY.", keywords: "discord komunitas undangan invite server" },
    ],
  },
  en: {
    eyebrow: "DAJJAL FAMILY / HELP CENTER",
    title: "How can we help?",
    lead: "Find guides and answers for using the DAJJAL FAMILY digital universe.",
    searchLabel: "Search for help",
    searchPlaceholder: "Type a question or keyword…",
    all: "All topics",
    noResults: "No matching answers found.",
    noResultsHint: "Try another keyword or contact our support team.",
    contact: "Contact support",
    contactUs: "Contact information",
    clear: "Clear search",
    resultCount: (n) => `${n} answers found`,
    categories: [
      { id: "getting-started", label: "Getting Started" },
      { id: "account", label: "Account & Profile" },
      { id: "gaming", label: "Gaming" },
      { id: "support", label: "Contact & Support" },
      { id: "community", label: "Community" },
    ],
    faqs: [
      { id: "what-is-df", category: "getting-started", question: "What is DAJJAL FAMILY?", answer: "DAJJAL FAMILY is a connected digital universe bringing gaming, knowledge, blog, digital products, business, and community together in one ecosystem. Each area can grow with its own identity while remaining connected.", keywords: "about digital universe ecosystem pillars" },
      { id: "need-account", category: "getting-started", question: "Do I need an account to explore the website?", answer: "No. Public pages and the game catalogue can be explored without signing in. An account is needed when using features that require an identity, data persistence, or personal access.", keywords: "login sign up account visitor public" },
      { id: "language", category: "getting-started", question: "How do I change the website language?", answer: "Use the ID and EN controls at the top of the website. Bahasa Indonesia and English are available. Your selected language is also reflected in the page URL with the /id or /en prefix.", keywords: "language indonesia english locale" },
      { id: "theme", category: "getting-started", question: "How do I switch between light and dark appearance?", answer: "Use the theme control at the top of the website to choose Light or Dark. On your first visit, the appearance follows your device preference until you make a manual choice.", keywords: "theme light dark appearance mode" },
      { id: "profile", category: "account", question: "Where can I manage my profile?", answer: "After signing in, open Profile from the website navigation. Available information and features may vary according to your account status and the feature being used.", keywords: "profile edit account nickname avatar" },
      { id: "games", category: "gaming", question: "Where can I find DAJJAL FAMILY games?", answer: "Open the Game Library from the Gaming navigation group or visit /games. The visitor catalogue lists games that are currently available to play.", keywords: "game library games catalogue gaming" },
      { id: "game-login", category: "gaming", question: "Do all games require an account?", answer: "Not always. DAJJAL FAMILY uses progressive access. Some public experiences can be played without signing in, while features such as saved progress or personal data may require an account.", keywords: "login game guest progress account" },
      { id: "contact-center", category: "support", question: "How do I contact the support team?", answer: "To start a private support conversation, sign in and open Contact Center. You can create a new conversation and follow replies from that page.", keywords: "contact center help message support contact" },
      { id: "support-categories", category: "support", question: "Which topics can I choose in Contact Center?", answer: "When creating a conversation, you can choose General, Account, Technical, Report, or Partnership. Select the category that best matches your request so it can be routed more clearly.", keywords: "categories general account technical report partnership" },
      { id: "discord", category: "community", question: "How can I join the official Discord?", answer: "The official Discord link will be published on this website when the community is ready to open. To avoid fake invitations, use only links announced through official DAJJAL FAMILY channels.", keywords: "discord community invitation invite server" },
    ],
  },
};

export default function HelpCenterPage() {
  const { language } = useLanguage();
  const locale = language === "en" ? "en" : "id";
  const t = content[locale];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const filtered = useMemo(() => t.faqs.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const haystack = `${item.question} ${item.answer} ${item.keywords}`.toLocaleLowerCase(locale);
    return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
  }), [t, category, normalizedQuery, locale]);
  const href = (path) => withLocalePrefix(path, locale);

  return (
    <main className="df-public-info">
      <header className="df-public-hero">
        <span className="df-public-eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="df-public-lead">{t.lead}</p>
        <div className="df-help-search-wrap">
          <label className="df-help-search-label" htmlFor="df-help-search">{t.searchLabel}</label>
          <input id="df-help-search" className="df-help-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" />
          {query && <button className="df-help-clear" type="button" onClick={() => setQuery("")}>{t.clear}</button>}
        </div>
      </header>

      <section className="df-public-section df-help-content" aria-label={t.searchLabel}>
        <div className="df-help-categories" aria-label={t.all}>
          <button type="button" className={category === "all" ? "is-active" : ""} aria-pressed={category === "all"} onClick={() => setCategory("all")}>{t.all}</button>
          {t.categories.map((item) => <button type="button" key={item.id} className={category === item.id ? "is-active" : ""} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
        </div>
        <p className="df-help-result-count" aria-live="polite">{t.resultCount(filtered.length)}</p>
        <div className="df-help-faq-list">
          {filtered.map((item) => (
            <details className="df-help-faq" key={item.id}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <div className="df-help-answer"><p>{item.answer}</p></div>
            </details>
          ))}
        </div>
        {!filtered.length && <div className="df-contact-note"><h2>{t.noResults}</h2><p>{t.noResultsHint}</p></div>}
      </section>

      <section className="df-about-cta df-help-cta">
        <div><span className="df-public-kicker">DAJJAL FAMILY / SUPPORT</span><h2>{t.noResultsHint}</h2></div>
        <div className="df-public-actions">
          <Link className="df-public-button df-public-button-primary" href={href("/contact-center")}>{t.contact}<span aria-hidden="true">↗</span></Link>
          <Link className="df-public-button df-public-button-secondary" href={href("/contact")}>{t.contactUs}</Link>
        </div>
      </section>
    </main>
  );
}
