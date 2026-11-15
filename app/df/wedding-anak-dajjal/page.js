"use client";

import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { supabase } from "../../../lib/supabase";
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
    eventStarted: "THE CELEBRATION HAS BEGUN", parents: "WITH THE BLESSING OF OUR FAMILIES", story: "OUR LOVE STORY", playerId: "PLAYER ID", address: "ADDRESS",
    photoAlt: "Anak Dajjal and Malika",
    navCouple: "COUPLE", navEvent: "EVENT", navGift: "PLAYER ID", navWishes: "WISHES", navMore: "MORE",
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
    countdown: "MENUJU HARI BAHAGIA", days: "HARI", hours: "JAM", minutes: "MENIT", seconds: "DETIK",
    eventStarted: "PERAYAAN TELAH DIMULAI", parents: "DENGAN RESTU KELUARGA", story: "KISAH KAMI", playerId: "ID PEMAIN", address: "ALAMAT",
    photoAlt: "Anak Dajjal dan Malika",
    navCouple: "MEMPELAI", navEvent: "ACARA", navGift: "ID PEMAIN", navWishes: "UCAPAN", navMore: "LAIN-LAIN",
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
  const audioRef = useRef(null);

  useEffect(() => {
    setGuestName(new URLSearchParams(window.location.search).get("to") || "");
    let active = true;
    async function loadWeddingData() {
      const publicResponse = await fetch("/api/wedding/public/" + encodeURIComponent(invitationSlug), { cache: "no-store" });
      if (!publicResponse.ok) return;
      const publicData = await publicResponse.json();
      if (!active || !publicData.invitation) return;
      const id = publicData.invitation.id;
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
        const messagesResult = await supabase.from("df_guestbook").select("id, guest_name, message, created_at").eq("invitation_id", id).eq("is_approved", true).order("created_at", { ascending: false }).limit(30);
        if (!active) return;
        if (messagesResult.data) setGuestbookEntries(messagesResult.data);
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
    AOS.init({
      duration: 850,
      easing: "ease-out-cubic",
      offset: 90,
      once: false,
      mirror: true,
      anchorPlacement: "top-bottom",
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    AOS.refreshHard();
    return () => AOS.refresh();
  }, []);

  const submitWishes = async (event) => {
    event.preventDefault();
    setRsvpLoading(true);
    setRsvpStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const guestNameValue = String(data.get("guest_name") || "").trim();
    const messageValue = String(data.get("guestbook_message") || "").trim();
    const honeypot = String(data.get("website") || "");
    let rsvpSaved = false;
    try {
      if (eventInfo?.rsvp_enabled) {
        const rsvpResponse = await fetch("/api/wedding/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: invitationSlug, guest_name: guestNameValue, invited_name: "",
            guest_count: 1, attendance: String(data.get("attendance") || ""), language, website: honeypot,
          }),
        });
        if (!rsvpResponse.ok) throw new Error("RSVP submission failed");
        rsvpSaved = true;
      }
      if (eventInfo?.guestbook_enabled) {
        const guestbookResponse = await fetch("/api/wedding/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: invitationSlug, guest_name: guestNameValue, message: messageValue, language, website: honeypot }),
        });
        if (!guestbookResponse.ok) throw new Error("Guestbook submission failed");
      }
      form.reset();
      setRsvpStatus("success");
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
    window.setTimeout(() => setCelebrationActive(false), 4200);
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
          <h1>Anak Dajjal <span>&amp;</span> Malika</h1>
          <p>Kepada Seluruh pemain Darkwar Survival</p>
          <button type="button" onClick={openInvitation}>✉ Buka Undangan</button>
        </section>
      )}
      {celebrationActive && <div className="wedding-confetti" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{"--i":i}} />)}</div>}
      <div className="wedding-content" hidden={!invitationOpened}>
          <section className="wedding-hero" id="couple" data-aos="fade-right">
            <div className="wedding-ornament">✦ ❧ ✦</div>
            <h1>Anak Dajjal &amp; Malika</h1>
            <p className="wedding-intro">{t.intro}</p>
            <div className="couple-frame">
              <div className="couple-placeholder">
                <img className="couple-photo" src={WEDDING_ASSETS.couple} alt={t.photoAlt} loading="eager" />
              </div>
              <span className="frame-corner frame-tl">✦</span><span className="frame-corner frame-tr">✦</span>
              <span className="frame-corner frame-bl">✦</span><span className="frame-corner frame-br">✦</span>
            </div>
            <h2 className="couple-names">Anak Dajjal &amp; Malika</h2>
            <div className="wedding-note wedding-family-note">
              <strong>{t.parents}</strong>
              <p>Dajjal &amp; Veylora</p>
              <p>JinuYourIdol &amp; Bubuah</p>
            </div>
          </section>

          <section className="wedding-section wedding-family-panel" id="groom" data-aos="fade-up">
            <img src={WEDDING_ASSETS.groom} alt="Anak Dajjal" loading="lazy" />
            <h2>Anak Dajjal</h2>
            <p>Putra dari Dajjal &amp; Veylora</p>
          </section>
          <section className="wedding-section wedding-family-panel" id="bride" data-aos="fade-up">
            <img src={WEDDING_ASSETS.bride} alt="Malika" loading="lazy" />
            <h2>Malika</h2>
            <p>Putri dari JinuYourIdol &amp; Bubuah</p>
          </section>

          <nav className="wedding-bottom-nav" aria-label={language === "id" ? "Navigasi undangan" : "Invitation navigation"}>
            <a href="#couple"><span aria-hidden="true">♙</span><small>{t.navCouple}</small></a>
            <a href="#event"><span aria-hidden="true">▣</span><small>{t.navEvent}</small></a>
            <a href="#gift"><span aria-hidden="true">♧</span><small>{t.navGift}</small></a>
            <a href="#wishes"><span aria-hidden="true">♡</span><small>{t.navWishes}</small></a>
            <a href="#share"><span aria-hidden="true">▦</span><small>{t.navMore}</small></a>
          </nav>

          {countdown && (
            <section className="wedding-section wedding-countdown" id="countdown" data-aos="fade-up" aria-label={t.countdown}>
              <p className="wedding-kicker">{t.countdown}</p>
              {countdown.complete ? <h2 className="wedding-section-heading">{t.eventStarted}</h2> : (
                <div className="detail-grid">
                  {[[countdown.days,t.days],[countdown.hours,t.hours],[countdown.minutes,t.minutes],[countdown.seconds,t.seconds]].map(([value,label])=>(
                    <article key={label}><h3>{String(value).padStart(2,"0")}</h3><p>{label}</p></article>
                  ))}
                </div>
              )}
            </section>
          )}

          {eventInfo?.love_story?.trim() && (
            <section className="wedding-section" id="story" data-aos="fade-right">
              <p className="wedding-kicker">{t.story}</p>
              <h2 className="wedding-section-heading">{t.story}</h2>
              <div className="wedding-note"><p style={{ whiteSpace: "pre-line" }}>{eventInfo.love_story}</p></div>
            </section>
          )}

          {galleryItems.length > 0 && (
            <section className="wedding-section wedding-gallery-section" id="gallery" data-aos="fade-left">
              <p className="wedding-kicker">OUR PRECIOUS MOMENTS</p>
              <h2 className="wedding-section-heading">{language === "id" ? "Galeri Kenangan" : "Our Photo Gallery"}</h2>
              <div className="wedding-gallery-viewer">
                <img src={galleryItems[galleryIndex]?.image_url} alt={galleryItems[galleryIndex]?.title || t.photoAlt} className="wedding-gallery-image" />
                <div className="wedding-gallery-controls">
                  <button type="button" aria-label={language === "id" ? "Foto sebelumnya" : "Previous photo"} onClick={() => setGalleryIndex((galleryIndex - 1 + galleryItems.length) % galleryItems.length)}>‹</button>
                  <span>{galleryIndex + 1} / {galleryItems.length}</span>
                  <button type="button" aria-label={language === "id" ? "Foto berikutnya" : "Next photo"} onClick={() => setGalleryIndex((galleryIndex + 1) % galleryItems.length)}>›</button>
                </div>
                {galleryItems[galleryIndex]?.title && <p className="wedding-gallery-caption">{galleryItems[galleryIndex].title}</p>}
              </div>
            </section>
          )}

          <section className="wedding-section" id="event" data-aos="fade-left">
            <p className="wedding-kicker">SAVE THE CELEBRATION</p>
            <h2 className="wedding-section-heading">{t.reception}</h2>
            <div className="detail-grid">
              <article><span>◷</span><h3>{eventInfo?.event_date ? new Date(`${eventInfo.event_date}T00:00:00`).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { dateStyle: "long" }) : t.date}</h3><p>DATE</p></article>
              <article><span>⌖</span><h3>{eventInfo?.venue || t.venue}</h3><p>LOCATION</p></article>
              <article><span>♧</span><h3>{eventInfo?.event_time || t.time}</h3><p>TIME</p></article>
            </div>
            <div className="wedding-note">
              <strong>{t.schedule}</strong>
              <p>{eventInfo?.schedule || t.scheduleText}</p>
              {eventInfo?.address && <><strong>{t.address}</strong><p>{eventInfo.address}</p></>}
            </div>
          </section>

          <section className="wedding-section wedding-player-id" id="gift" data-aos="fade-left">
            <p className="wedding-kicker">{t.playerId}</p>
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

          <section className="wedding-section wedding-wishes" id="wishes" data-aos="fade-right">
              <p className="wedding-kicker">{language === "id" ? "UNTUK KEDUA KARAKTER" : "A NOTE FOR THE COUPLE"}</p>
              <h2 className="wedding-section-heading">{t.wishesTitle}</h2>
              <p className="section-copy">{t.wishesIntro}</p>
              {(eventInfo?.rsvp_enabled || eventInfo?.guestbook_enabled) && <form className="wedding-form" onSubmit={submitWishes}>
                <label>{language === "id" ? "Nama" : "Name"}<input required name="guest_name" maxLength="100" placeholder={language === "id" ? "Nama pemain" : "Player name"} /></label>
                {eventInfo?.rsvp_enabled && (
                  <fieldset className="wedding-attendance">
                    <legend>{language === "id" ? "Konfirmasi Kehadiran" : "Attendance Confirmation"} <span aria-hidden="true">*</span></legend>
                    <label><input required type="radio" name="attendance" value="yes" />{language === "id" ? "Hadir" : "Attending"}</label>
                    <label><input type="radio" name="attendance" value="maybe" />{t.attendancePending}</label>
                    <label><input type="radio" name="attendance" value="no" />{language === "id" ? "Tidak Hadir" : "Not Attending"}</label>
                  </fieldset>
                )}
                {eventInfo?.guestbook_enabled && (
                  <label>{t.message}<textarea required name="guestbook_message" rows="4" maxLength="500" placeholder={language === "id" ? "Tuliskan pesan atau doa..." : "Write your message or prayer..."} /></label>
                )}
                <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                <button className="wedding-primary" type="submit" disabled={rsvpLoading}>{rsvpLoading ? t.sending : t.sendWishes}</button>
                {rsvpStatus && <p className="form-notice" role="status">{rsvpStatus === "success" ? t.wishesSuccess : rsvpStatus === "partial" ? t.wishesPartial : t.wishesError}</p>}
              </form>}
              {guestbookEntries.length > 0 && <div className="approved-messages">{guestbookEntries.map((entry) => <article key={entry.id}><strong>{entry.guest_name}</strong><p>{entry.message}</p></article>)}</div>}
            {!eventInfo?.rsvp_enabled && !eventInfo?.guestbook_enabled && <p className="section-copy">{language === "id" ? "Form ucapan dan konfirmasi akan segera tersedia." : "The response form will be available soon."}</p>}
          </section>

          <section className="wedding-share" id="share" data-aos="fade-left">
            <p className="wedding-kicker">SPREAD THE JOY</p>
            <h2 className="wedding-section-heading">{t.couple}</h2>
            <div className="share-actions">
              <button type="button" onClick={shareInvite}>{t.share}</button>
              <button type="button" onClick={copyLink}>{copied ? t.copied : t.copy}</button>
            </div>
          </section>
      </div>

      <button
        className={"wedding-music-float " + (musicOn ? "is-playing" : "is-off")}
        type="button"
        onClick={toggleMusic}
        aria-label={musicOn ? "Matikan musik" : "Nyalakan musik"}
        aria-pressed={musicOn}
        title={musicOn ? "Musik menyala" : "Musik mati"}
      >
        <span className="wedding-music-icon" aria-hidden="true">♫</span>
        {!musicOn && <span className="wedding-music-off-mark" aria-hidden="true">／</span>}
      </button>
      <audio ref={audioRef} src={WEDDING_ASSETS.music} loop preload="none" onError={() => setMusicOn(false)} />
    </main>
  );
}
