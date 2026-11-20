"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";

const copy = {
  en: {
    checking: "VERIFYING ADMIN ACCESS...",
    title: "ADMIN",
    accent: "DASHBOARD",
    subtitle: "Your Dajjal Family platform control center.",
    admin: "SIGNED IN AS",
    secure: "SECURE ACCESS VERIFIED",
    management: "MANAGEMENT",
    players: "User Management",
    playersDesc: "Manage login accounts, player profiles, access, and activity.",
    contactCenter: "Contact Center",
    contactCenterDesc: "Review member conversations, reply to requests, and manage support notifications.",
    statistics: "Game Statistics",
    statisticsDesc: "Track engagement, scores, and overall game performance.",
    gallery: "Wedding Gallery",
    galleryDesc: "Upload, organize, publish, and manage wedding photos.",
    storage: "Central Storage",
    storageDesc: "Connect Google Drive and manage the platform storage provider.",
    music: "Music Library",
    musicDesc: "Upload, organize, preview, and publish the music catalog.",
    open: "OPEN MODULE",
    coming: "COMING SOON",
    quick: "QUICK ACCESS",
    login: "ADMIN PORTAL",
    logout: "SIGN OUT",
    loggingOut: "SIGNING OUT...",
    logoutTitle: "SIGN OUT?",
    logoutMessage: "Are you sure you want to leave the admin dashboard?",
    cancel: "CANCEL",
    confirm: "YES, SIGN OUT",
    denied: "Administrator access denied.",
    error: "Unable to verify administrator access.",
    footer: "DAJJAL FAMILY · ADMIN CONTROL CENTER",
  },
  id: {
    checking: "MEMVERIFIKASI AKSES ADMIN...",
    title: "DASHBOARD",
    accent: "ADMIN",
    subtitle: "Pusat kendali platform Dajjal Family.",
    admin: "MASUK SEBAGAI",
    secure: "AKSES AMAN TERVERIFIKASI",
    management: "PENGELOLAAN",
    players: "Manajemen Pengguna",
    playersDesc: "Kelola akun login, profil pemain, akses, dan aktivitas.",
    contactCenter: "Contact Center",
    contactCenterDesc: "Tinjau percakapan anggota, balas permintaan, dan kelola notifikasi dukungan.",
    statistics: "Statistik Permainan",
    statisticsDesc: "Pantau aktivitas, perolehan poin, dan performa game.",
    gallery: "Galeri Pernikahan",
    galleryDesc: "Upload, susun, publikasikan, dan kelola foto pernikahan.",
    storage: "Penyimpanan Terpusat",
    storageDesc: "Hubungkan Google Drive dan kelola penyimpanan platform.",
    music: "Music Library",
    musicDesc: "Upload, susun, preview, dan kelola katalog musik.",
    open: "BUKA MENU",
    coming: "SEGERA HADIR",
    quick: "AKSES CEPAT",
    login: "PORTAL ADMIN",
    logout: "KELUAR",
    loggingOut: "SEDANG KELUAR...",
    logoutTitle: "KELUAR DARI ADMIN?",
    logoutMessage: "Apakah kamu yakin ingin keluar dari dashboard administrator?",
    cancel: "BATAL",
    confirm: "YA, KELUAR",
    denied: "Akses administrator ditolak.",
    error: "Tidak dapat memverifikasi akses administrator.",
    footer: "DAJJAL FAMILY · PUSAT KENDALI ADMIN",
  },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language] || copy.en;

  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      try {
        const { data, error: sessionError } =
          await supabaseAdminClient.auth.getSession();

        if (sessionError) throw sessionError;

        const session = data?.session;
        if (!session) {
          router.replace("/admin/login");
          return;
        }

        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          await supabaseAdminClient.auth.signOut();
          if (response.status === 401 || response.status === 403) {
            router.replace("/admin/login");
            return;
          }
          throw new Error(result.error || t.error);
        }

        if (active) setAdmin(result.admin);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        if (active) setError(err.message || t.error);
      } finally {
        if (active) setChecking(false);
      }
    }

    verifyAccess();
    return () => { active = false; };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError("");

    try {
      const { error: logoutError } =
        await supabaseAdminClient.auth.signOut();
      if (logoutError) throw logoutError;
      router.replace("/admin/login");
    } catch (err) {
      console.error("Admin logout error:", err);
      setError(err.message || t.error);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-[75vh] bg-[#080711] flex flex-col items-center justify-center gap-5 px-5 text-purple-200">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400 border-r-cyan-400 animate-spin" />
          <span className="text-2xl">♛</span>
        </div>
        <p className="ui-eyebrow animate-pulse">{t.checking}</p>
      </main>
    );
  }

  if (error && !admin) {
    return (
      <main className="min-h-[75vh] bg-[#080711] text-white flex flex-col items-center justify-center px-5 text-center">
        <div className="ui-gradient-frame ui-card rounded-2xl p-7 max-w-md w-full">
          <div className="text-4xl">🔒</div>
          <h1 className="ui-title mt-4">{t.denied}</h1>
          <p className="text-sm text-red-300 mt-3">{error}</p>
          <Link href="/admin/login" className="ui-interactive inline-flex mt-6 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 font-bold text-sm">
            {t.login}
          </Link>
        </div>
      </main>
    );
  }

  if (!admin) return null;

  const modules = [
    { href: "/admin/contact-center", icon: "✉️", number: "00", title: t.contactCenter, description: t.contactCenterDesc, available: true, accent: "from-violet-500/20 via-fuchsia-500/5" },
    { href: "/admin/music", icon: "♫", number: "06", title: t.music, description: t.musicDesc, available: true, accent: "from-purple-500/20 via-cyan-500/5" },
    {
      href: "/admin/players",
      icon: "👥",
      number: "01",
      title: t.players,
      description: t.playersDesc,
      available: true,
      accent: "from-blue-500/20 via-indigo-500/5",
    },
    {
      href: "/admin/wedding-gallery",
      icon: "💒",
      number: "02",
      title: t.gallery,
      description: t.galleryDesc,
      available: true,
      accent: "from-pink-500/20 via-rose-500/5",
    },
    {
      href: "/admin/wedding-event",
      icon: "🗓️",
      number: "03",
      title: language === "id" ? "Waktu Acara Undangan" : "Wedding Event Time",
      description: language === "id" ? "Atur tanggal dan waktu hitung mundur serta resepsi." : "Set the invitation date, countdown, and reception time.",
      available: true,
      accent: "from-amber-500/20 via-orange-500/5",
    },
    {
      href: "/admin/wedding-guestbook",
      icon: "💬",
      number: "04",
      title: language === "id" ? "Ucapan Guestbook" : "Guestbook Messages",
      description: language === "id" ? "Lihat dan hapus pesan pada undangan pernikahan." : "Review and delete wedding invitation guestbook messages.",
      available: true,
      accent: "from-emerald-500/20 via-teal-500/5",
    },
    {
      href: "/admin/theme",
      icon: "🎨",
      number: "05",
      title: language === "id" ? "Pengelola Tema" : "Theme Manager",
      description: language === "id" ? "Pratinjau mode tampilan dan katalog palet global." : "Preview appearance modes and the global palette catalog.",
      available: true,
      accent: "from-purple-500/20 via-indigo-500/5",
    },
    {
      href: "/admin/storage",
      icon: "☁️",
      number: "06",
      title: t.storage,
      description: t.storageDesc,
      available: true,
      accent: "from-cyan-500/20 via-blue-500/5",
    },
    {
      href: null,
      icon: "📊",
      number: "07",
      title: t.statistics,
      description: t.statisticsDesc,
      available: false,
      accent: "from-cyan-500/15 via-blue-500/5",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080711] text-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[min(90vw,50rem)] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ui-eyebrow">DAJJAL FAMILY <span className="text-cyan-300">/ ADMIN CONTROL CENTER</span></p>
            <h1 className="ui-title">
              {t.title} <span className="ui-gradient-text">{t.accent}</span>
            </h1>
            <p className="ui-section-subtitle mt-3">{t.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            disabled={loggingOut}
            className="ui-interactive inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200 hover:border-red-400/50 hover:bg-red-500/15 disabled:opacity-50"
          >
            <span>↗</span>{t.logout}
          </button>
        </header>

        <section className="ui-gradient-frame ui-card mt-8 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-500/15 text-2xl">♛</div>
            <div className="min-w-0 flex-1">
              <p className="ui-eyebrow mb-1">{t.admin}</p>
              <p className="break-all font-semibold text-white">{admin.email}</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-extrabold tracking-wider text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              {t.secure}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="ui-eyebrow mb-1">{t.quick}</p>
              <h2 className="ui-section-title">{t.management}</h2>
            </div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-gray-600">09 MODULES</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const content = (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.accent} to-transparent opacity-80`} />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-2xl">
                      {module.icon}
                    </div>
                    <span className="font-mono text-xs tracking-widest text-gray-600">{module.number}</span>
                  </div>
                  <div className="relative mt-7">
                    <h3 className="text-lg font-extrabold tracking-tight">{module.title}</h3>
                    <p className="mt-2 min-h-[3.2rem] text-sm leading-relaxed text-gray-400">{module.description}</p>
                  </div>
                  <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className={module.available ? "text-[10px] font-extrabold tracking-[0.16em] text-purple-300" : "text-[10px] font-extrabold tracking-[0.16em] text-gray-500"}>
                      {module.available ? t.open : t.coming}
                    </span>
                    <span className={module.available ? "text-lg text-cyan-300 transition-transform group-hover:translate-x-1" : "text-gray-600"} aria-hidden="true">
                      {module.available ? "→" : "· · ·"}
                    </span>
                  </div>
                </>
              );

              const className = "ui-interactive ui-card group relative flex min-h-[230px] flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-[#11101d] p-5 text-left shadow-lg shadow-black/10 hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-purple-950/30 focus-visible:outline-none";

              return module.available ? (
                <Link key={module.number} href={module.href} className={className}>
                  {content}
                </Link>
              ) : (
                <div key={module.number} aria-disabled="true" className={`${className} cursor-not-allowed opacity-65`}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-12 border-t border-white/5 pt-5 text-center text-[10px] font-semibold tracking-[0.18em] text-gray-600">
          {t.footer} · 2026
        </footer>
      </div>

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loggingOut) setShowLogoutModal(false);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="admin-logout-title" className="ui-popup ui-gradient-frame ui-card w-full max-w-sm rounded-3xl p-6 sm:p-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-2xl">↗</div>
            <h2 id="admin-logout-title" className="ui-section-title mt-5 text-center">{t.logoutTitle}</h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-gray-400">{t.logoutMessage}</p>
            {error && <p role="alert" className="mt-4 text-center text-xs text-red-300">{error}</p>}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setShowLogoutModal(false)} disabled={loggingOut} className="ui-interactive rounded-xl border border-purple-400/25 bg-purple-500/10 px-4 py-3 text-xs font-extrabold text-purple-200 hover:bg-purple-500/20 disabled:opacity-50">{t.cancel}</button>
              <button type="button" onClick={handleLogout} disabled={loggingOut} className="ui-interactive rounded-xl bg-red-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-red-500 disabled:opacity-50">{loggingOut ? t.loggingOut : t.confirm}</button>
            </div>
            {loggingOut && <p className="mt-5 animate-pulse text-center text-[10px] font-bold tracking-widest text-purple-300">{t.loggingOut}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
