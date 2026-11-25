"use client";

import { useLanguage } from "../LanguageProvider";

const messages = {
  id: {
    admin: { title: "Memeriksa identitas administrator", description: "Memastikan sesi dan hak akses admin sebelum dashboard dibuka.", label: "PEMERIKSAAN KEAMANAN ADMIN", detail: "Sesi administrator aman" },
    user: { title: "Memeriksa sesi akun", description: "Memastikan sesi akun kamu masih valid dan siap digunakan.", label: "PEMERIKSAAN AKUN", detail: "Koneksi autentikasi aman" },
    verified: "Sesi berhasil diverifikasi",
    failed: "Pemeriksaan tidak berhasil",
    expired: "Sesi telah berakhir",
    retry: "Coba lagi",
  },
  en: {
    admin: { title: "Verifying administrator identity", description: "Checking the admin session and access permissions before opening the dashboard.", label: "ADMIN SECURITY CHECK", detail: "Administrator session security" },
    user: { title: "Checking your account session", description: "Making sure your account session is valid and ready to use.", label: "ACCOUNT VERIFICATION", detail: "Authentication connection secure" },
    verified: "Session verified successfully",
    failed: "Verification could not be completed",
    expired: "Your session has expired",
    retry: "Try again",
  },
};

export function VerificationState({ variant = "user", status = "checking", compact = false, title, description, onRetry, className = "" }) {
  const { language } = useLanguage();
  const copy = messages[language === "id" ? "id" : "en"];
  const kind = variant === "admin" ? "admin" : "user";
  const content = copy[kind];
  const statusTitle = status === "verified" ? copy.verified : status === "expired" ? copy.expired : status === "error" || status === "denied" ? copy.failed : content.title;
  const icon = status === "verified" ? "✓" : status === "error" || status === "denied" || status === "expired" ? "!" : kind === "admin" ? "◆" : "●";

  if (compact) {
    return (
      <span
        className={["df-verification", `df-verification--${kind}`, "df-verification--compact", `df-verification--${status}`, className].filter(Boolean).join(" ")}
        role={status === "error" || status === "denied" || status === "expired" ? "alert" : "status"}
        aria-live="polite"
        aria-atomic="true"
        aria-busy={status === "checking" || undefined}
      >
        <span className="df-verification__mark" aria-hidden="true">{status === "checking" ? <img className="df-verification__logo" src="/loading.png" alt="" /> : <span>{icon}</span>}{status === "checking" && <i />}</span>
        <span className="df-verification__title">{title || statusTitle}</span>
      </span>
    );
  }

  return (
    <section className={["df-verification", `df-verification--${kind}`, `df-verification--${status}`, className].filter(Boolean).join(" ")} role={status === "error" || status === "denied" || status === "expired" ? "alert" : "status"} aria-live="polite" aria-atomic="true" aria-busy={status === "checking" || undefined}>
      <div className="df-verification__mark" aria-hidden="true">{status === "checking" ? <img className="df-verification__logo" src="/loading.png" alt="" /> : <span>{icon}</span>}{status === "checking" && <i />}</div>
      <div className="df-verification__copy">
        <p className="df-verification__eyebrow">{content.label}</p>
        <h2 className="df-verification__title">{title || statusTitle}</h2>
        <p className="df-verification__description">{description || (status === "checking" ? content.description : status === "verified" ? copy.verified : content.description)}</p>
        {status === "checking" && <div className="df-verification__progress" aria-label={content.label}><span /></div>}
        {status === "checking" && <p className="df-verification__detail">{content.detail}</p>}
        {(status === "error" || status === "denied" || status === "expired") && onRetry && <button type="button" className="df-verification__retry" onClick={onRetry}>{copy.retry}</button>}
      </div>
    </section>
  );
}
