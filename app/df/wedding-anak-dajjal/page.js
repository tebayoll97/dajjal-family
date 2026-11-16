"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "../../components/LanguageProvider";
import "./wedding.css";

const WEDDING_ASSETS = {
  // Google Drive public image endpoints optimized for direct browser rendering.
  couple: "https://drive.google.com/thumbnail?id=1tHIvwAqtgjxoEs4V8328-K4L2yyKdirh&sz=w1600",
  groom: "https://drive.google.com/thumbnail?id=1SaOMfTFvyp1DE25-6oUEicgjosxlx-Ur&sz=w1600",
  bride: "https://drive.google.com/thumbnail?id=1JwJP547UasyEMvtt4gfSFfUM1qXAmeEr&sz=w1600",
  // Direct file endpoint so the browser can stream the audio after user interaction.
  music: "/audio/Payung%20Teduh%20%20Akad%20Cover%20by%20Hanin%20Dhiya.mp3",
};

const words = {
  en: {
    eyebrow: "A LITTLE CELEBRATION, A LOT OF LOVE",
    title: "The Royal Wedding",
    invite: "You are warmly invited to celebrate",
    couple: "Anak Dajjal & Malika",
    intro: "Two characters, one joyful chapter. Join us for a day filled with smiles, warmth, and treasured memories.",
    reception: "Wedding Reception",
    date: "Date to be announced",
    venue: "Venue to be announced",
    time: "Time to be announced",
    schedule: "The Celebration",
    scheduleText: "Reception details and schedule will be announced soon.",
    rsvp: "Kindly Respond",
    rsvpText: "Let us know if you can join the celebration.",
    invitedName: "Name on invitation (optional)",
    guestCount: "Number of guests",
    rsvpSend: "SEND RSVP",
    name: "Your name",
    guests: "Number of guests",
    attendance: "Will you attend?",
    yes: "Joyfully attending",
    no: "Unable to attend",
    send: "SEND RSVP",
    guestbook: "Guestbook",
    guestbookText: "Leave a kind note for the happy couple.",
    message: "Your message / prayer",
    sign: "WRITE A MESSAGE",
    footer: "ONE FAMILY. ENDLESS STORIES.",
    coming: "This feature is being prepared. Your information has not been sent yet.",
    music: "MUSIC",
    musicSoon: "Piano music will be added before launch.",
    share: "SHARE INVITATION",
    copy: "COPY LINK",
    copied: "Link copied",
    count: "Guests",
    rsvpSuccess: "Thank you. Your RSVP has been received.",
    guestbookSuccess: "Thank you. Your message is now published.",
    submitError: "Something went wrong. Please try again.",
    sending: "SENDING…",
    musicOff: "MUSIC OFF",
    musicOn: "MUSIC ON",
    countdown: "COUNTDOWN TO THE CELEBRATION", days: "DAYS", hours: "HOURS", minutes: "MINUTES", seconds: "SECONDS",
    eventStarted: "THE CELEBRATION HAS BEGUN", parents: "WITH THE BLESSING OF OUR FAMILIES", story: "OUR LOVE STORY", playerId: "PLAYER ID", address: "ADDRESS", sonOf: "Son of", daughterOf: "Daughter of", father: "Mr.", mother: "Mrs.",
    photoAlt: "Anak Dajjal and Malika",
    navCouple: "COUPLE", navEvent: "EVENT", navGift: "GIFT", navWishes: "WISHES", navMore: "MORE",
    attendancePending: "Not sure yet", wishesTitle: "Wishes & Prayers", wishesIntro: "Leave your attendance confirmation and a message for the couple.",
    sendWishes: "SEND", wishesSuccess: "Thank you. Your response and message have been received.",
    wishesPartial: "Your attendance was saved, but your message could not be sent. Please contact the host.",
    wishesError: "Something went wrong. Please try again.",
  },
  id: {
    eyebrow: "SEDIKIT KEMERIAHAN, BANYAK CINTA",
    title: "Pernikahan Kerajaan",
    invite: "Dengan hangat kami mengundang Anda untuk merayakan",
    couple: "Anak Dajjal & Malika",
    intro: "Dua karakter, satu babak penuh keceriaan. Mari rayakan hari istimewa dengan senyum, kehangatan, dan kenangan indah.",
    reception: "Resepsi Pernikahan",
    date: "Tanggal akan diumumkan",
    venue: "Lokasi akan diumumkan",
    time: "Waktu akan diumumkan",
    schedule: "Rangkaian Acara",
    scheduleText: "Informasi resepsi dan susunan acara akan diumumkan segera.",
    rsvp: "Konfirmasi Kehadiran",
    rsvpText: "Beri tahu kami apakah Anda dapat hadir di perayaan ini.",
    invitedName: "Nama pada undangan (opsional)",
    guestCount: "Jumlah tamu",
    rsvpSend: "KIRIM RSVP",
    name: "Nama Anda",
    guests: "Jumlah tamu",
    attendance: "Apakah Anda akan hadir?",
    yes: "Dengan senang hati hadir",
    no: "Maaf, belum bisa hadir",
    send: "KIRIM RSVP",
    guestbook: "Buku Tamu",
    guestbookText: "Tinggalkan pesan manis untuk kedua mempelai.",
    message: "Pesan / Doa",
    sign: "TULIS PESAN",
    footer: "SATU KELUARGA. CERITA TANPA BATAS.",
    coming: "Fitur ini sedang disiapkan. Informasi Anda belum dikirim.",
    music: "MUSIK",
    musicSoon: "Musik piano akan ditambahkan sebelum peluncuran.",
    share: "BAGIKAN UNDANGAN",
    copy: "SALIN TAUTAN",
    copied: "Tautan disalin",
    count: "Tamu",
    rsvpSuccess: "Terima kasih. Konfirmasi kehadiran Anda sudah diterima.",
    guestbookSuccess: "Terima kasih. Pesan Anda berhasil dipublikasikan.",
    submitError: "Terjadi kendala. Silakan coba kembali.",
    sending: "MENGIRIM…",
    musicOff: "MUSIK MATI",
    musicOn: "MUSIK NYALA",
    countdown: "Menuju Hari Bahaya", days: "HARI", hours: "JAM", minutes: "MENIT", seconds: "DETIK",
    eventStarted: "PERAYAAN TELAH DIMULAI", parents: "DENGAN RESTU KELUARGA", story: "KISAH KAMI", playerId: "ID PEMAIN", address: "ALAMAT", sonOf: "Putra dari", daughterOf: "Putri dari", father: "Bapak", mother: "Ibu",
    photoAlt: "Anak Dajjal dan Malika",
    navCouple: "MEMPELAI", navEvent: "ACARA", navGift: "HADIAH", navWishes: "UCAPAN", navMore: "LAIN-LAIN",
    attendancePending: "Belum Pasti", wishesTitle: "Ucapan & Doa", wishesIntro: "Sampaikan konfirmasi kehadiran dan pesan untuk kedua karakter.",
    sendWishes: "KIRIM", wishesSuccess: "Terima kasih. Konfirmasi dan pesan Anda berhasil dikirim.",
    wishesPartial: "Konfirmasi kehadiran tersimpan, tetapi pesan belum berhasil dikirim. Silakan hubungi penyelenggara.",
    wishesError: "Terjadi kendala. Silakan coba kembali.",
  },
};

export default function WeddingInvitationPage({ invitationSlug = "anak-dajjal-malika" } = {}) {
  const { language } = useLanguage();
  const t = words[language] || words.en;
  const [guestName, setGuestName] = useState("");
  const [eventInfo, setEventInfo] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [musicOn, setMusicOn] = useState(false);
  const [invitationOpened, setInvitationOpened] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setGuestName(new URLSearchParams(window.location.search).get("to") || "");
    let active = true;
    async function loadWeddingData() {
      const publicResponse = await fetch("/api/wedding/public/" + encodeURIComponent(invitationSlug), { cache: "no-store" });
      if (!publicResponse.ok) return;
      const publicData = await publicResponse.json();
      if (!active || !publicData.invitation) return;
      const profile = publicData.profile || {};
      setEventInfo({
        ...profile,
        rsvp_enabled: profile.rsvp_enabled === true,
        guestbook_enabled: profile.guestbook_enabled === true,
        invitation_title: publicData.invitation.title,
        couple_photo_url: profile.main_photo_url,
        groom_parent_names: profile.groom_parent_names || "",
        bride_parent_names: profile.bride_parent_names || "",
        address: profile.address || "",
        love_story: profile.love_story || "",
        schedule: Array.isArray(profile.event_schedule) ? profile.event_schedule.join(" · ") : "",
        couple_display: [profile.groom_name, profile.bride_name].filter(Boolean).join(" & "),
        event_date: profile.event_date,
        event_time: profile.event_time,
        venue: profile.venue,
      });
      if (Array.isArray(profile.gallery_urls)) setGalleryItems(profile.gallery_urls.map((url,index)=>({id:index,title:"",image_url:url})));
      if (profile.guestbook_enabled === true) {
        const messagesResponse = await fetch("/api/wedding/guestbook?slug=" + encodeURIComponent(invitationSlug), { cache: "no-store" });
        if (!active) return;
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setGuestbookEntries(Array.isArray(messagesData.entries) ? messagesData.entries : []);
        }
      }
    }
    loadWeddingData();
    return () => { active = false; };
  }, [invitationSlug]);

  useEffect(() => {
    if (!eventInfo?.event_date) {
      setCountdown(null);
      return;
    }
    const timeMatch = String(eventInfo.event_time || "").match(/^(\d{1,2}):(\d{2})/);
    const hour = timeMatch ? timeMatch[1].padStart(2, "0") : "00";
    const minute = timeMatch ? timeMatch[2] : "00";
    const target = new Date(String(eventInfo.event_date) + "T" + hour + ":" + minute + ":00").getTime();
    if (!Number.isFinite(target)) {
      setCountdown(null);
      return;
    }
    const updateCountdown = () => {
      const remaining = Math.max(0, target - Date.now());
      setCountdown({
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000),
        seconds: Math.floor((remaining % 60000) / 1000),
        complete: remaining === 0,
      });
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [eventInfo?.event_date, eventInfo?.event_time]);

  useEffect(() => {
    if (galleryItems.length < 2) return;
    const timer = window.setInterval(() => setGalleryIndex((index) => (index + 1) % galleryItems.length), 4500);
    return () => window.clearInterval(timer);
  }, [galleryItems.length]);

  useEffect(() => {
    if (!invitationOpened) return undefined;
    AOS.init({
      duration: 850,
      easing: "ease-out-cubic",
      offset: 90,
      once: true,
      mirror: false,
      anchorPlacement: "top-bottom",
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    const frame = window.requestAnimationFrame(() => AOS.refreshHard());
    return () => {
      window.cancelAnimationFrame(frame);
      AOS.refresh();
    };
  }, [invitationOpened]);

  const submitWishes = async (event) => {
    event.preventDefault();
    setRsvpLoading(true);
    setRsvpStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const guestNameValue = String(data.get("guest_name") || "").trim();
    const serverNameValue = String(data.get("server_name") || "").trim();
    const attendanceValue = String(data.get("attendance") || "");
    const messageValue = String(data.get("guestbook_message") || "").trim();
    const honeypot = String(data.get("website") || "");
    if (!guestNameValue || !serverNameValue || !["yes", "maybe", "no"].includes(attendanceValue) || !messageValue) {
      setRsvpStatus("error");
      setRsvpLoading(false);
      return;
    }
    let rsvpSaved = false;
    try {
      if (eventInfo?.rsvp_enabled) {
        const rsvpResponse = await fetch("/api/wedding/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: invitationSlug, guest_name: guestNameValue, server_name: serverNameValue, invited_name: "",
            guest_count: 1, attendance: attendanceValue, language, website: honeypot,
          }),
        });
        if (!rsvpResponse.ok) throw new Error("RSVP submission failed");
        rsvpSaved = true;
      }
      if (eventInfo?.guestbook_enabled) {
        const guestbookResponse = await fetch("/api/wedding/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: invitationSlug, guest_name: guestNameValue, server_name: serverNameValue, attendance: attendanceValue, message: messageValue, language, website: honeypot }),
        });
        if (!guestbookResponse.ok) throw new Error("Guestbook submission failed");
      }
      form.reset();
      setRsvpStatus("success");
      const refreshedMessages = await fetch("/api/wedding/guestbook?slug=" + encodeURIComponent(invitationSlug), { cache: "no-store" });
      if (refreshedMessages.ok) {
        const refreshedData = await refreshedMessages.json();
        setGuestbookEntries(Array.isArray(refreshedData.entries) ? refreshedData.entries : []);
      }
    } catch {
      setRsvpStatus(rsvpSaved ? "partial" : "error");
    } finally {
      setRsvpLoading(false);
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
      setMusicOn(false);
      return;
    }
    try {
      await audioRef.current.play();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  };

  const copyAddress = async () => {
    const addressText = "Panti Asuhan Anak Ceria #278 [X:291 Y:501]";
    try { await navigator.clipboard.writeText(addressText); setAddressCopied(true); window.setTimeout(() => setAddressCopied(false), 2200); }
    catch { setAddressCopied(false); }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const shareInvite = () => {
    const text = encodeURIComponent(
      language === "id"
        ? "Dengan hangat, kami mengundang Anda ke perayaan Anak Dajjal & Malika."
        : "You are warmly invited to celebrate Anak Dajjal & Malika."
    );
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer");
  };

  const openInvitation = async () => {
    setInvitationOpened(true);
    setCelebrationActive(true);
    window.setTimeout(() => setCelebrationActive(false), 5000);
    if (audioRef.current) {
      try { await audioRef.current.play(); setMusicOn(true); }
      catch { setMusicOn(false); }
    }
  };

  return (
    <main className="wedding-page">
      {!invitationOpened && (
        <section className="wedding-opening" aria-label="Buka undangan">
          <div className="wedding-opening-florals" aria-hidden="true">❀ ❧ ❀</div>
          <img className="wedding-opening-couple" src={WEDDING_ASSETS.couple} alt="Anak Dajjal dan Malika" />
          <h1><span className="opening-name">Anak Dajjal</span><span className="opening-amp">&amp;</span><span className="opening-name">Malika</span></h1>
          <div className="wedding-opening-recipient"><span>Kepada Yth Bapak/Ibu/Saudara/i</span><strong>Seluruh pemain Darkwar Survival</strong></div>
          <button type="button" onClick={openInvitation}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
            <span>Buka Undangan</span>
          </button>
        </section>
      )}
      {celebrationActive && <div className="wedding-falling-leaves" aria-hidden="true">{Array.from({length:24},(_,i)=><span key={i} style={{"--leaf-index":i}}>{i%3===0?"🍂":"🍃"}</span>)}</div>}
      <div className="wedding-content" hidden={!invitationOpened}>
          <p className="wedding-invitation-eyebrow">Undangan Pernikahan</p>
          <section className="wedding-hero" id="hero" data-panel-number="01" data-aos="fade-up">
            <div className="couple-frame">
              <div className="couple-placeholder">
                <img className="couple-photo" src={WEDDING_ASSETS.couple} alt={t.photoAlt} loading="eager" />
              </div>
              <span className="frame-corner frame-tl">✦</span><span className="frame-corner frame-tr">✦</span>
              <span className="frame-corner frame-bl">✦</span><span className="frame-corner frame-br">✦</span>
            </div>
            <h1 className="wedding-hero-couple-name"><span className="opening-name">Anak Dajjal</span><span className="opening-amp">&amp;</span><span className="opening-name">Malika</span></h1>
            <p className="wedding-hero-date">{eventInfo?.event_date ? new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${eventInfo.event_date}T12:00:00`)) : t.date}</p>
            <div className="wedding-countdown" id="countdown" aria-label={t.countdown}>
              <p className="wedding-kicker">{t.countdown}</p>
              {countdown ? (countdown.complete ? <h2 className="wedding-section-heading">{t.eventStarted}</h2> : (
                <div className="detail-grid">
                  {[[countdown.days,t.days],[countdown.hours,t.hours],[countdown.minutes,t.minutes],[countdown.seconds,t.seconds]].map(([value,label])=>(
                    <article key={label}><h3>{String(value).padStart(2,"0")}</h3><p>{label}</p></article>
                  ))}
                </div>
              )) : <p className="section-copy">{language === "id" ? "Hitung mundur akan tampil setelah tanggal acara ditentukan." : "The countdown will appear once the event date is set."}</p>}
            </div>
          </section>

          <p className="wedding-invitation-eyebrow wedding-couple-eyebrow">Mempelai</p>
          <section className="wedding-section wedding-family-panel wedding-groom" id="couple" data-panel-number="02" data-aos="fade-up">
            <p className="wedding-groom-message"><strong>Assalamu&apos;alaikum wr. wb.</strong><span>Tanpa mengurangi rasa hormat. Kami memberi info kepada kalian pada acara pernikahan kami.</span></p>
            <img className="wedding-family-photo" src={WEDDING_ASSETS.groom} alt="Anak Dajjal" loading="lazy" />
            <h2>Anak Dajjal</h2>
            <p>{t.sonOf} {t.father} Dajjal &amp; {t.mother} Veylora</p>
            <div className="wedding-couple-amp" aria-hidden="true">&amp;</div>
          </section>

          <section className="wedding-section wedding-family-panel wedding-bride" id="bride" data-panel-number="03" data-aos="fade-up">
            <img className="wedding-family-photo" src={WEDDING_ASSETS.bride} alt="Malika" loading="lazy" />
            <h2>Malika</h2>
            <p>{t.daughterOf} {t.father} JinuYourIdol &amp; {t.mother} Bubuah</p>
          </section>

          <p className="wedding-invitation-eyebrow wedding-event-eyebrow">Rangkaian Acara</p>
          <section className="wedding-section wedding-event-panel" id="event" data-panel-number="04" data-aos="fade-up">
            <h2 className="wedding-section-heading">Resepsi</h2>
            <div className="wedding-event-detail">
              <svg className="wedding-event-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
              <strong>{eventInfo?.event_date ? new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${eventInfo.event_date}T12:00:00`)) : t.date}</strong>
              <p>21.00 Waktu Server - Selesai</p>
            </div>
            <div className="wedding-event-detail">
              <svg className="wedding-event-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              <strong>Panti Asuhan Anak Ceria</strong>
              <p>Jl. IDs, No. Koordinat [X:239 Y:503]</p>
              <p>Kode state #278</p>
              <button className="wedding-copy-address" type="button" onClick={copyAddress}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>
                <span>{addressCopied ? "Alamat tersalin" : "Salin alamat"}</span>
              </button>
            </div>
          </section>

          <section className="wedding-section wedding-planting-panel" id="planting" data-panel-number="05" data-aos="fade-up">
            <h2 className="wedding-section-heading">Menanam Kedelai</h2>
            <div className="wedding-planting-icon" aria-hidden="true">🌱</div>
            <p className="section-copy">Kita mencoba untuk membuat bumi dari hijau menjadi hitam, seperti kedelai pilihan kami.</p>
          </section>

          <nav className="wedding-bottom-nav" aria-label={language === "id" ? "Navigasi undangan" : "Invitation navigation"}>
            <a href="#couple"><span aria-hidden="true">♙</span><small>{t.navCouple}</small></a>
            <a href="#event"><span aria-hidden="true">▣</span><small>{t.navEvent}</small></a>
            <a href="#gift"><span aria-hidden="true">♧</span><small>{t.navGift}</small></a>
            <a href="#wishes"><span aria-hidden="true">♡</span><small>{t.navWishes}</small></a>
            <a href="#share"><span aria-hidden="true">▦</span><small>{t.navMore}</small></a>
          </nav>


          <section className="wedding-section wedding-stories-section" id="story" data-panel-number="06">
            <h2 className="wedding-section-heading" data-aos="fade-up">{language === "id" ? "Kisah Kami" : "Our Stories"}</h2>
            <div className="wedding-stories-list">
              <article className="wedding-story-item" data-aos="fade-up">
                <div className="wedding-story-date">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
                  <span>4 November 2026</span>
                </div>
                <div className="wedding-story-card">
                  <img className="wedding-story-image wedding-story-image--one" src="https://drive.google.com/thumbnail?id=1EPSuY8vdPAtlINlxl43IqDozUbJvS6DU&sz=w1600" alt="Anak Dajjal bertemu Malika di tengah sawah" loading="lazy" decoding="async" />
                  <div className="wedding-story-card-content">
                    <h3>Awal Pertemuan</h3>
                    <p>Awalnya aku hanya kabur dari ibu panti yang galak. Namun, di tengah sawah aku justru menemukan dia, <span className="story-accent story-malika">Malika</span> — si <span className="story-accent story-soybean">Kedelai Hitam</span>. Sejak itu, aku merawatnya dengan kasih sayang seperti anak sendiri.</p>
                  </div>
                </div>
              </article>

              <article className="wedding-story-item" data-aos="fade-up" data-aos-delay="100">
                <div className="wedding-story-date">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
                  <span>10 November 2026</span>
                </div>
                <div className="wedding-story-card">
                  <img className="wedding-story-image wedding-story-image--two" src="https://drive.google.com/thumbnail?id=15LGrwtC3NSIjGKQSac96Uc35quycNSOA&sz=w1600" alt="Anak Dajjal dan Malika berlari bersama di panti asuhan" loading="lazy" decoding="async" />
                  <div className="wedding-story-card-content">
                    <h3>Perjalanan Bersama</h3>
                    <p>Di panti, di sekolah, bahkan saat dimarahi ibu panti, kami selalu bersama. Entah berapa banyak masalah yang kami lewati, tetapi justru dari situlah ikatan kami semakin erat.</p>
                  </div>
                </div>
              </article>

              <article className="wedding-story-item" data-aos="fade-up" data-aos-delay="150">
                <div className="wedding-story-date">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
                  <span>30 November 2026</span>
                </div>
                <div className="wedding-story-card">
                  <img className="wedding-story-image wedding-story-image--three" src="https://drive.google.com/thumbnail?id=1NilOhV3TtCCm1LdkgspOf4yzWEiizw0Y&sz=w1600" alt="Anak Dajjal dan Malika di pelaminan bersama ibu Anak Dajjal" loading="lazy" decoding="async" />
                  <div className="wedding-story-card-content">
                    <h3>Menuju Hari Bencana</h3>
                    <p>Siapa sangka, hubungan kami berujung di pelaminan? Padahal aku lahir tanpa pembuahan, sedangkan Malika adalah sejenis biji-bijian. Semua ini bermula dari satu keinginan ibu Anak Dajjal: ingin segera punya cucu!</p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="wedding-section wedding-gallery-section" id="gallery" data-panel-number="07">
            <h2 className="wedding-section-heading" data-aos="fade-up">Photo Gallery</h2>
            <div className="wedding-gallery-grid">
              <figure className="wedding-gallery-card" data-aos="fade-up" data-aos-delay="0" key="gallery-0">
                <img src="https://drive.google.com/thumbnail?id=1trVpyYoeq7cIdFJ6RwxlXz9oRb7aaQ17&sz=w1600" alt="The Runaway" loading="lazy" decoding="async" />
              </figure>
              <figure className="wedding-gallery-card" data-aos="fade-up" data-aos-delay="80" key="gallery-1">
                <img src="https://drive.google.com/thumbnail?id=12OHSVAGQpdgn92mEG68W8fGm_0K9Bcmo&sz=w1600" alt="Best Partners" loading="lazy" decoding="async" />
              </figure>
              <figure className="wedding-gallery-card" data-aos="fade-up" data-aos-delay="160" key="gallery-2">
                <img src="https://drive.google.com/thumbnail?id=1pfNX5y5gLboMwMrxAXazZCnBZt3gtfAp&sz=w1600" alt="Trouble Again" loading="lazy" decoding="async" />
              </figure>
              <figure className="wedding-gallery-card" data-aos="fade-up" data-aos-delay="240" key="gallery-3">
                <img src="https://drive.google.com/thumbnail?id=19wH_SN_InP9IaGY49uBQ-EmJjvmBie7K&sz=w1600" alt="Through the Rain" loading="lazy" decoding="async" />
              </figure>
              <figure className="wedding-gallery-card" data-aos="fade-up" data-aos-delay="320" key="gallery-4">
                <img src="https://drive.google.com/thumbnail?id=18jRHXfnlJsPGsHuMuJsTRlsugnJy3Ggo&sz=w1600" alt="The Wedding Disaster" loading="lazy" decoding="async" />
              </figure>
              <figure className="wedding-gallery-card" data-aos="fade-up" data-aos-delay="400" key="gallery-5">
                <img src="https://drive.google.com/thumbnail?id=1kNbCBK8zLfqTHfgn88ckvWqBG8gKc903&sz=w1600" alt="Grandma's Dream" loading="lazy" decoding="async" />
              </figure>
            </div>
          </section>

          <section className="wedding-section wedding-player-id" id="gift" data-panel-number="08" data-aos="fade-up">
            <h2 className="wedding-section-heading">{t.playerId}</h2>
            <div className="dawn-badge-card">
              <div className="dawn-badge-emblem" role="img" aria-label="Dawn Badge Darkwar Survival">
                <span className="dawn-badge-emblem__crown" aria-hidden="true">✦</span>
                <strong>DAWN</strong><small>BADGE</small>
              </div>
              <div className="dawn-badge-copy">
                <strong>DAWN BADGE</strong><span>DARKWAR SURVIVAL</span>
                <p>{language === "id" ? "ID pemain akan ditampilkan di sini." : "The player ID will appear here."}</p>
              </div>
            </div>
          </section>

          <section className="wedding-section wedding-wishes" id="wishes" data-panel-number="09" data-aos="fade-up">
              <p className="wedding-kicker">{language === "id" ? "UNTUK KEDUA KARAKTER" : "A NOTE FOR THE COUPLE"}</p>
              <h2 className="wedding-section-heading">{t.wishesTitle}</h2>
              <p className="section-copy">{t.wishesIntro}</p>
              {(eventInfo?.rsvp_enabled || eventInfo?.guestbook_enabled) && <form className="wedding-form" onSubmit={submitWishes}>
                <label>{language === "id" ? "Nama" : "Name"} <span className="wedding-required">*</span><input required name="guest_name" maxLength="100" placeholder={language === "id" ? "Nama pemain" : "Player name"} /></label>
                <label>{language === "id" ? "Server Darkwar" : "Darkwar Server"} <span className="wedding-required">*</span><input required name="server_name" maxLength="40" placeholder={language === "id" ? "Contoh: 278" : "Example: 278"} /></label>
                <fieldset className="wedding-attendance">
                  <legend>{language === "id" ? "Konfirmasi Kehadiran" : "Attendance Confirmation"} <span className="wedding-required">*</span></legend>
                  <label><input required type="radio" name="attendance" value="yes" />{language === "id" ? "Hadir" : "Attending"}</label>
                  <label><input type="radio" name="attendance" value="maybe" />{t.attendancePending}</label>
                  <label><input type="radio" name="attendance" value="no" />{language === "id" ? "Tidak Hadir" : "Not Attending"}</label>
                </fieldset>
                <label>{t.message} <span className="wedding-required">*</span><textarea required name="guestbook_message" rows="4" maxLength="500" placeholder={language === "id" ? "Tuliskan pesan atau doa..." : "Write your message or prayer..."} /></label>
                <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                <button className="wedding-primary" type="submit" disabled={rsvpLoading}>{rsvpLoading ? t.sending : t.sendWishes}</button>
                {rsvpStatus && <p className="form-notice" role="status">{rsvpStatus === "success" ? t.wishesSuccess : rsvpStatus === "partial" ? t.wishesPartial : t.wishesError}</p>}
              </form>}
            {!eventInfo?.rsvp_enabled && !eventInfo?.guestbook_enabled && <p className="section-copy">{language === "id" ? "Form ucapan dan konfirmasi akan segera tersedia." : "The response form will be available soon."}</p>}
          </section>

          <section className="wedding-guestbook-list" id="guestbook-list" data-aos="fade-up">
            <h2 className="wedding-guestbook-list-title">{language === "id" ? "Ucapan dan Doa Teman-teman" : "Friends' Wishes and Prayers"}</h2>
            <div className="wedding-guestbook-list-panel">
              {guestbookEntries.length > 0 ? guestbookEntries.map((entry) => (
                <article className="wedding-guest-entry" key={entry.id}>
                  <div className="wedding-guest-entry-heading">
                    <strong>{entry.guest_name}</strong>
                    <span className="wedding-guest-server">- [{entry.server_name || "—"}]</span>
                    <span className={"wedding-attendance-badge " + (entry.attendance === "yes" ? "is-yes" : entry.attendance === "maybe" ? "is-maybe" : "is-no")}>
                      {entry.attendance === "yes" ? (language === "id" ? "Hadir" : "Attending") : entry.attendance === "maybe" ? t.attendancePending : entry.attendance === "no" ? (language === "id" ? "Tidak Hadir" : "Not Attending") : (language === "id" ? "Tamu" : "Guest")}
                    </span>
                  </div>
                  <p className="wedding-guest-entry-message">{entry.message}</p>
                  <time className="wedding-guest-entry-time" dateTime={entry.created_at}>{new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(entry.created_at))} - {new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", { timeZone: "Asia/Jakarta", weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date(entry.created_at)).replace(/\./g, "").toUpperCase()}</time>
                </article>
              )) : <p className="wedding-guestbook-empty">{language === "id" ? "Belum ada ucapan. Jadilah yang pertama mengirim doa!" : "No wishes yet. Be the first to leave a message!"}</p>}
            </div>
          </section>

          <section className="wedding-share" id="share" data-panel-number="10" data-aos="fade-up">
            <p className="wedding-kicker">SPREAD THE JOY</p>
            <h2 className="wedding-section-heading">{t.couple}</h2>
            <div className="share-actions">
              <button type="button" onClick={shareInvite}>{t.share}</button>
              <button type="button" onClick={copyLink}>{copied ? t.copied : t.copy}</button>
            </div>
          </section>
          <footer className="wedding-closing" aria-label={language === "id" ? "Penutup undangan" : "Invitation closing"}>
            <h2 className="wedding-closing-couple-name"><span className="opening-name">Anak Dajjal</span><span className="opening-amp">&amp;</span><span className="opening-name">Malika</span></h2>
            <p className="wedding-closing-with-love"><svg className="wedding-closing-heart wedding-closing-heart--left" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg><span>With Love</span></p>
            <p className="wedding-closing-family">Dajjal Family <svg className="wedding-closing-heart wedding-closing-heart--right" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg></p>
          </footer>
      </div>

      <button
        className={"wedding-music-float " + (musicOn ? "is-playing" : "is-off")}
        type="button"
        onClick={toggleMusic}
        aria-label={musicOn ? "Matikan musik" : "Nyalakan musik"}
        aria-pressed={musicOn}
        title={musicOn ? "Musik menyala" : "Musik mati"}
      >
        <svg className="wedding-music-icon" viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          {musicOn ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></> : <path d="m16 9 5 6m0-6-5 6" />}
        </svg>
        <span className="wedding-music-state" aria-hidden="true">{musicOn ? "ON" : "OFF"}</span>
      </button>
      <audio ref={audioRef} src={WEDDING_ASSETS.music} loop preload="none" onError={() => setMusicOn(false)} />
    </main>
  );
}
