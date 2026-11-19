"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

const content = {
  en: {
    about: {
      eyebrow: "OUR UNIVERSE",
      title: "One Family. Many Possibilities.",
      lead: "A connected digital universe where people can explore, create, learn, and grow.",
      introTitle: "Who We Are",
      intro: "DAJJAL FAMILY is an independent digital ecosystem bringing different experiences and initiatives together under one identity. From gaming and knowledge to creativity, digital products, business, and community, each part has room to grow while remaining connected.",
      pillarsTitle: "Our Universe",
      pillarsLead: "Six connected pillars. Many ways to explore and take part.",
      pillars: [
        ["Gaming", "Play, discover, and share interactive experiences.", "/games"],
        ["Knowledge", "Explore ideas, learning resources, and practical insights.", "/knowledge"],
        ["Blog", "Read stories, perspectives, and ecosystem updates.", "/blog"],
        ["Digital Products", "Discover useful digital resources and creative tools.", "/digital-products"],
        ["Business", "Learn about initiatives and future collaboration opportunities.", "/business"],
        ["Community", "Find shared interests and opportunities to connect.", "/community"],
      ],
      visionTitle: "Our Vision",
      vision: "To build a connected digital universe where people can explore, create, learn, and grow without boundaries.",
      missionTitle: "Our Mission",
      missions: [
        "Develop innovative digital services and experiences.",
        "Connect people through community and collaboration.",
        "Open opportunities to learn, create, and grow.",
        "Build a safe, useful, and sustainable digital ecosystem.",
      ],
      valuesTitle: "Our Values",
      values: [
        ["Innovation", "We keep exploring better ideas and meaningful digital experiences."],
        ["Connection", "We bring people, ideas, and experiences together."],
        ["Possibilities", "We create room for people and projects to grow in different directions."],
      ],
      ctaTitle: "Become Part of Our Universe",
      cta: "Explore the experiences and projects as they become available.",
      ctaAction: "Explore the universe",
      contactAction: "Contact us",
    },
    contact: {
      eyebrow: "GET IN TOUCH",
      title: "Let's Connect.",
      lead: "Questions, ideas, feedback, or a potential collaboration? We welcome thoughtful conversations.",
      introTitle: "Contact DAJJAL FAMILY",
      intro: "We are building clear and reliable ways for people to reach the right part of our digital universe. This page is the public starting point for contact information.",
      statusTitle: "Contact Center is available",
      status: "Sign in to your DAJJAL FAMILY account to start a private support conversation, follow replies, and receive notifications.",
      contactCenterAction: "Open Contact Center",
      noteTitle: "For now",
      note: "Please follow the official DAJJAL FAMILY website for updates. Avoid sharing passwords, verification codes, or sensitive personal information through unofficial channels.",
      homeAction: "Back to home",
      aboutAction: "Discover our universe",
    },
  },
  id: {
    about: {
      eyebrow: "SEMESTA KAMI",
      title: "Satu Keluarga. Banyak Kemungkinan.",
      lead: "Semesta digital yang saling terhubung, tempat orang dapat menjelajahi, berkarya, belajar, dan berkembang.",
      introTitle: "Siapa Kami",
      intro: "DAJJAL FAMILY adalah ekosistem digital mandiri yang menyatukan berbagai pengalaman dan inisiatif dalam satu identitas. Mulai dari gaming dan pengetahuan hingga kreativitas, produk digital, bisnis, dan komunitas. Setiap bagian memiliki ruang untuk berkembang tanpa kehilangan keterhubungannya.",
      pillarsTitle: "Semesta Kami",
      pillarsLead: "Enam pilar yang saling terhubung. Banyak cara untuk menjelajah dan berpartisipasi.",
      pillars: [
        ["Gaming", "Bermain, menemukan, dan berbagi pengalaman interaktif.", "/games"],
        ["Pengetahuan", "Menjelajahi gagasan, sumber belajar, dan wawasan praktis.", "/knowledge"],
        ["Blog", "Membaca cerita, sudut pandang, dan kabar ekosistem.", "/blog"],
        ["Produk Digital", "Menemukan sumber daya digital dan perangkat kreatif yang bermanfaat.", "/digital-products"],
        ["Bisnis", "Mengenal inisiatif dan peluang kolaborasi ke depannya.", "/business"],
        ["Komunitas", "Menemukan minat bersama dan kesempatan untuk terhubung.", "/community"],
      ],
      visionTitle: "Visi Kami",
      vision: "Membangun ekosistem digital yang saling terhubung, tempat orang dapat menjelajahi, berkarya, belajar, dan berkembang tanpa batas.",
      missionTitle: "Misi Kami",
      missions: [
        "Mengembangkan layanan dan pengalaman digital yang inovatif.",
        "Menghubungkan orang melalui komunitas dan kolaborasi.",
        "Membuka kesempatan untuk belajar, berkarya, dan berkembang.",
        "Membangun ekosistem digital yang aman, bermanfaat, dan berkelanjutan.",
      ],
      valuesTitle: "Nilai Kami",
      values: [
        ["Inovasi", "Terus mengeksplorasi gagasan yang lebih baik dan pengalaman digital yang bermakna."],
        ["Koneksi", "Menghubungkan orang, gagasan, dan pengalaman."],
        ["Kemungkinan", "Membuka ruang agar orang dan proyek dapat berkembang ke berbagai arah."],
      ],
      ctaTitle: "Jadilah Bagian dari Semesta Kami",
      cta: "Jelajahi pengalaman dan proyek kami seiring ketersediaannya.",
      ctaAction: "Jelajahi semesta",
      contactAction: "Hubungi kami",
    },
    contact: {
      eyebrow: "HUBUNGI KAMI",
      title: "Mari Terhubung.",
      lead: "Punya pertanyaan, gagasan, masukan, atau peluang kolaborasi? Kami terbuka untuk percakapan yang bermakna.",
      introTitle: "Kontak DAJJAL FAMILY",
      intro: "Kami sedang membangun jalur komunikasi yang jelas dan tepercaya agar setiap orang dapat menghubungi bagian yang tepat dari semesta digital kami. Halaman ini menjadi titik awal informasi kontak publik.",
      statusTitle: "Contact Center sudah tersedia",
      status: "Masuk ke akun DAJJAL FAMILY untuk memulai percakapan dukungan secara privat, mengikuti balasan, dan menerima notifikasi.",
      contactCenterAction: "Buka Contact Center",
      noteTitle: "Untuk saat ini",
      note: "Ikuti situs resmi DAJJAL FAMILY untuk mendapatkan pembaruan. Hindari membagikan kata sandi, kode verifikasi, atau informasi pribadi sensitif melalui kanal tidak resmi.",
      homeAction: "Kembali ke beranda",
      aboutAction: "Kenali semesta kami",
    },
  },
};

export default function AboutContactExperience({ section }) {
  const { language } = useLanguage();
  const locale = language === "en" ? "en" : "id";
  const t = content[locale][section];
  if (!t) return null;
  const href = (path) => withLocalePrefix(path, locale);

  if (section === "contact") {
    return (
      <main className="df-public-info df-contact-page">
        <header className="df-public-hero">
          <span className="df-public-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p className="df-public-lead">{t.lead}</p>
        </header>
        <section className="df-public-section df-contact-intro" aria-labelledby="df-contact-intro-title">
          <div className="df-public-copy">
            <span className="df-public-kicker">DAJJAL FAMILY</span>
            <h2 id="df-contact-intro-title">{t.introTitle}</h2>
            <p>{t.intro}</p>
          </div>
          <div className="df-contact-status" role="status">
            <span className="df-contact-status-icon" aria-hidden="true">✉</span>
            <h2>{t.statusTitle}</h2>
            <p>{t.status}</p>
            <div className="df-public-actions"><Link className="df-public-button df-public-button-primary" href={href("/contact-center")}>{t.contactCenterAction}<span aria-hidden="true">↗</span></Link></div>
          </div>
        </section>
        <section className="df-contact-note">
          <h2>{t.noteTitle}</h2>
          <p>{t.note}</p>
        </section>
        <nav className="df-public-actions" aria-label={locale === "id" ? "Tautan lanjutan" : "Further links"}>
          <Link className="df-public-button df-public-button-primary" href={href("/")}>{t.homeAction}<span aria-hidden="true">↗</span></Link>
          <Link className="df-public-button df-public-button-secondary" href={href("/about")}>{t.aboutAction}</Link>
        </nav>
      </main>
    );
  }

  return (
    <main className="df-public-info df-about-page">
      <header className="df-public-hero">
        <span className="df-public-eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="df-public-lead">{t.lead}</p>
        <div className="df-public-actions">
          <a className="df-public-button df-public-button-primary" href="#df-universe">{t.ctaAction}<span aria-hidden="true">↓</span></a>
          <Link className="df-public-button df-public-button-secondary" href={href("/contact")}>{t.contactAction}</Link>
        </div>
      </header>

      <section className="df-public-section df-about-intro" aria-labelledby="df-about-intro-title">
        <div className="df-public-section-heading">
          <span className="df-public-kicker">01 / IDENTITY</span>
          <h2 id="df-about-intro-title">{t.introTitle}</h2>
        </div>
        <p>{t.intro}</p>
      </section>

      <section className="df-public-section" id="df-universe" aria-labelledby="df-universe-title">
        <div className="df-public-section-heading">
          <span className="df-public-kicker">02 / EXPLORE</span>
          <h2 id="df-universe-title">{t.pillarsTitle}</h2>
          <p>{t.pillarsLead}</p>
        </div>
        <div className="df-universe-grid">
          {t.pillars.map(([name, description, route], index) => (
            <Link className="df-universe-card" href={href(route)} key={route}>
              <span className="df-universe-card-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="df-universe-card-arrow" aria-hidden="true">↗</span>
              <h3>{name}</h3>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="df-public-section df-about-vision" aria-labelledby="df-vision-title">
        <div className="df-about-statement">
          <span className="df-public-kicker">03 / DIRECTION</span>
          <h2 id="df-vision-title">{t.visionTitle}</h2>
          <p>{t.vision}</p>
        </div>
        <div className="df-about-mission">
          <h2>{t.missionTitle}</h2>
          <ol>{t.missions.map((mission) => <li key={mission}>{mission}</li>)}</ol>
        </div>
      </section>

      <section className="df-public-section" aria-labelledby="df-values-title">
        <div className="df-public-section-heading">
          <span className="df-public-kicker">04 / PRINCIPLES</span>
          <h2 id="df-values-title">{t.valuesTitle}</h2>
        </div>
        <div className="df-values-grid">
          {t.values.map(([name, description], index) => (
            <article className="df-value-card" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{name}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="df-about-cta">
        <div><span className="df-public-kicker">05 / YOUR NEXT STEP</span><h2>{t.ctaTitle}</h2><p>{t.cta}</p></div>
        <Link className="df-public-button df-public-button-primary" href={href("/games")}>{t.ctaAction}<span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
