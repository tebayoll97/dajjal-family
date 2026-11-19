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
    const whatsappMessage = locale === "id"
      ? "Halo DAJJAL FAMILY, saya ingin menghubungi tim."
      : "Hello DAJJAL FAMILY, I would like to contact your team.";
    const whatsappHref = `https://wa.me/6285141320943?text=${encodeURIComponent(whatsappMessage)}`;
    const telegramHref = "https://t.me/+6285141320943";

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

        <section className="df-contact-channels" aria-labelledby="df-contact-channels-title">
          <div className="df-contact-channels-heading">
            <span className="df-public-kicker">{locale === "id" ? "KANAL RESMI" : "OFFICIAL CHANNELS"}</span>
            <h2 id="df-contact-channels-title">{locale === "id" ? "Pilih cara terhubung" : "Choose how to connect"}</h2>
            <p>{locale === "id" ? "Hubungi tim DAJJAL FAMILY melalui kanal yang paling nyaman untukmu." : "Reach the DAJJAL FAMILY team through the channel that works best for you."}</p>
          </div>

          <div className="df-contact-channel-grid">
            <a className="df-contact-channel df-contact-channel-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={locale === "id" ? "Hubungi DAJJAL FAMILY melalui WhatsApp, buka di tab baru" : "Contact DAJJAL FAMILY on WhatsApp, opens in a new tab"}>
              <span className="df-contact-channel-icon df-contact-channel-icon-whatsapp" aria-hidden="true">W</span>
              <span className="df-contact-channel-copy">
                <strong>WhatsApp Business</strong>
                <span>{locale === "id" ? "Chat langsung dengan tim kami" : "Start a direct chat with our team"}</span>
                <small>+62 851-4132-0943</small>
              </span>
              <span className="df-contact-channel-arrow" aria-hidden="true">↗</span>
            </a>

            <a className="df-contact-channel df-contact-channel-telegram" href={telegramHref} target="_blank" rel="noopener noreferrer" aria-label={locale === "id" ? "Hubungi DAJJAL FAMILY melalui Telegram, buka di tab baru" : "Contact DAJJAL FAMILY on Telegram, opens in a new tab"}>
              <span className="df-contact-channel-icon df-contact-channel-icon-telegram" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><path d="M21.6 4.2 18.4 19c-.2 1- .8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L6.9 13.2l-4.4-1.4c-1-.3-1-1 .2-1.5L20 3.8c.9-.3 1.8.2 1.6.4Z"/></svg>
              </span>
              <span className="df-contact-channel-copy">
                <strong>Telegram</strong>
                <span>{locale === "id" ? "Terhubung melalui Telegram" : "Connect with us on Telegram"}</span>
                <small>+62 851-4132-0943</small>
              </span>
              <span className="df-contact-channel-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="df-contact-channel-hint">{locale === "id" ? "Kedua kanal menggunakan nomor yang sama. Ketersediaan akun Telegram melalui nomor telepon mengikuti pengaturan privasi Telegram." : "Both channels use the same number. Telegram phone-number discovery depends on the account's Telegram privacy settings."}</p>
        </section>

        <section className="df-contact-note">
          <h2>{t.noteTitle}</h2>
          <p>{t.note}</p>
        </section>
        <nav className="df-public-actions" aria-label={locale === "id" ? "Tautan lanjutan" : "Further links"}>
          <Link className="df-public-button df-public-button-primary" href={href("/")}>{t.homeAction}<span aria-hidden="true">↗</span></Link>
          <Link className="df-public-button df-public-button-secondary" href={href("/about")}>{t.aboutAction}</Link>
        </nav>

        <style jsx>{`
          .df-contact-channels { margin-top: clamp(3rem, 7vw, 5rem); }
          .df-contact-channels-heading { max-width: 680px; margin-bottom: 1.25rem; }
          .df-contact-channels-heading h2 { margin: .55rem 0 0; color: var(--df-text); font-size: clamp(1.65rem, 4vw, 2.35rem); font-weight: 900; letter-spacing: -.04em; line-height: 1.12; }
          .df-contact-channels-heading p { margin: .75rem 0 0; color: var(--df-text-secondary); font-size: .96rem; line-height: 1.7; }
          .df-contact-channel-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
          .df-contact-channel { display: flex; min-width: 0; min-height: 132px; align-items: center; gap: 1rem; padding: 1.25rem; border: 1px solid var(--df-border); border-radius: var(--df-radius-xl, 20px); background: var(--df-surface); color: var(--df-text); text-decoration: none; box-shadow: var(--df-shadow-sm); transition: transform 180ms ease, border-color 180ms ease, background 180ms ease; }
          .df-contact-channel:hover { transform: translateY(-3px); border-color: var(--df-primary); background: var(--df-surface-raised); }
          .df-contact-channel:focus-visible { outline: 3px solid var(--df-focus); outline-offset: 3px; }
          .df-contact-channel-icon { display: grid; width: 3.25rem; height: 3.25rem; flex: 0 0 3.25rem; place-items: center; border-radius: 1.1rem; color: white; font-size: 1.65rem; font-weight: 900; }
          .df-contact-channel-icon-whatsapp { background: #25a765; }
          .df-contact-channel-icon-telegram { background: #229ed9; }
          .df-contact-channel-icon-telegram svg { width: 1.8rem; height: 1.8rem; fill: currentColor; }
          .df-contact-channel-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: .22rem; }
          .df-contact-channel-copy strong { color: var(--df-text); font-size: 1.05rem; font-weight: 900; }
          .df-contact-channel-copy > span { color: var(--df-text-secondary); font-size: .86rem; line-height: 1.45; }
          .df-contact-channel-copy small { margin-top: .18rem; color: var(--df-text-muted); font-size: .78rem; font-weight: 750; letter-spacing: .025em; }
          .df-contact-channel-arrow { align-self: flex-start; color: var(--df-text-muted); font-size: 1.1rem; }
          .df-contact-channel-hint { margin: .85rem 0 0; color: var(--df-text-muted); font-size: .78rem; line-height: 1.6; }
          @media (max-width: 760px) {
            .df-contact-channels { margin-top: 2.75rem; }
            .df-contact-channel-grid { grid-template-columns: minmax(0, 1fr); gap: .8rem; }
            .df-contact-channel { min-height: 104px; gap: .9rem; padding: 1rem; border-radius: 1.15rem; }
            .df-contact-channel-icon { width: 3rem; height: 3rem; flex-basis: 3rem; border-radius: 1rem; }
            .df-contact-channel-copy strong { font-size: 1rem; }
            .df-contact-channel-copy > span { font-size: .82rem; }
            .df-contact-channel-copy small { font-size: .76rem; }
          }
          @media (max-width: 360px) {
            .df-contact-channel { gap: .7rem; padding: .85rem; }
            .df-contact-channel-icon { width: 2.7rem; height: 2.7rem; flex-basis: 2.7rem; }
          }
          @media (prefers-reduced-motion: reduce) {
            .df-contact-channel { transition: none; }
            .df-contact-channel:hover { transform: none; }
          }
        `}</style>
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
