"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "./LanguageProvider";
import { ConfirmDialog, SvgIcon } from "./ui";

const translations = {
  en: {
    checking:"Checking account...", title:"SIGN OUT", guestTitle:"WARNING: UNPROTECTED ACCOUNT",
    guestMessage:"You are using a Guest Account. If you sign out, you may permanently lose access to your nickname, avatar, points and all game progress.",
    guestAction:"We strongly recommend connecting Google first.", connect:"CONNECT GOOGLE ACCOUNT",
    cancel:"CANCEL", logoutAnyway:"LOGOUT ANYWAY", confirmGuest:"Are you absolutely sure? Your Guest Account may not be recoverable after signing out.",
    confirmNormal:"Are you sure you want to sign out?", signingOut:"SIGNING OUT...", failed:"Unable to sign out. Please try again.", confirm:"CONFIRM LOGOUT",
  },
  id: {
    checking:"Memeriksa akun...", title:"KELUAR AKUN", guestTitle:"PERINGATAN: AKUN BELUM DIAMANKAN",
    guestMessage:"Kamu sedang menggunakan Guest Account. Jika logout, kamu berisiko kehilangan akses ke nickname, avatar, poin, dan seluruh progres permainan.",
    guestAction:"Kami sangat menyarankan menghubungkan Google terlebih dahulu.", connect:"HUBUNGKAN AKUN GOOGLE",
    cancel:"BATAL", logoutAnyway:"TETAP LOGOUT", confirmGuest:"Apakah kamu benar-benar yakin? Akun Guest mungkin tidak bisa dipulihkan setelah logout.",
    confirmNormal:"Apakah kamu yakin ingin keluar dari akun?", signingOut:"SEDANG KELUAR...", failed:"Tidak dapat logout. Silakan coba lagi.", confirm:"KONFIRMASI LOGOUT",
  },
};

export default function AccountLogout() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [isGuest, setIsGuest] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startLogout() {
    if (checking || loading) return;
    setError("");
    setChecking(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) { router.replace("/login"); return; }
      const guest = Boolean(user.is_anonymous);
      setIsGuest(guest);
      setShowWarning(guest);
      setShowFinalConfirm(!guest);
    } catch (err) {
      console.error("Account check error:", err);
      setError(err.message || t.failed);
    } finally {
      setChecking(false);
    }
  }

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) throw signOutError;
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || t.failed);
      setLoading(false);
    }
  }

  function closeDialogs() {
    if (loading) return;
    setShowWarning(false);
    setShowFinalConfirm(false);
    setError("");
  }

  return (
    <div className="df-account-logout">
      {!showWarning && !showFinalConfirm && (
        <button type="button" onClick={startLogout} disabled={checking || loading} className="df-account-logout-button">
          <SvgIcon name="log-out" size={18} /><span>{checking ? t.checking : t.title}</span>
        </button>
      )}
      {error && !showWarning && !showFinalConfirm && <p className="df-account-logout-error" role="alert">{error}</p>}
      <ConfirmDialog
        open={showWarning && isGuest}
        onClose={() => { if (!loading) setShowWarning(false); }}
        onConfirm={() => { setShowWarning(false); setShowFinalConfirm(true); }}
        title={t.guestTitle}
        description={t.guestMessage}
        confirmLabel={t.logoutAnyway}
        cancelLabel={t.cancel}
        confirmVariant="danger"
        loading={loading}
      >
        <div className="df-account-logout-warning">
          <p>{t.guestAction}</p>
          <Link href="/profile#account-security" onClick={() => setShowWarning(false)}>{t.connect}</Link>
          {error && <p className="df-account-logout-error" role="alert">{error}</p>}
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        open={showFinalConfirm}
        onClose={closeDialogs}
        onConfirm={handleLogout}
        title={t.title}
        description={isGuest ? t.confirmGuest : t.confirmNormal}
        confirmLabel={loading ? t.signingOut : t.confirm}
        cancelLabel={t.cancel}
        confirmVariant="danger"
        loading={loading}
      >
        {error && <p className="df-account-logout-error" role="alert">{error}</p>}
      </ConfirmDialog>
    </div>
  );
}
