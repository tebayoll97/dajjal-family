"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";
import { VerificationState } from "../components/ui";

function isGoogleUser(user) {
  return user?.app_metadata?.provider === "google" ||
    (user?.app_metadata?.providers || []).includes("google") ||
    (user?.identities || []).some((identity) => identity.provider === "google");
}

function getSafeReturnPath(value, language) {
  const fallback = withLocalePrefix("/profile", language);
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.origin !== window.location.origin) return fallback;
    const path = parsed.pathname;
    if (path === "/login" || path === "/id/login" || path === "/en/login" ||
        path === "/register" || path === "/id/register" || path === "/en/register") return fallback;
    return `${path}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.45 9.5 24 9.5z" transform="translate(0 4)"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.95 46.98 31.75 46.98 24.55z"/>
      <path fill="#FBBC05" d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.48-6.19z" transform="translate(0 4)"/>
      <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.93-5.8l-7.73-6c-2.14 1.45-4.87 2.3-8.2 2.3-6.55 0-12.07-4.22-14.04-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -4)"/>
    </svg>
  );
}

function StatusIcon({ success = false }) {
  return success ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5m0 3h.01"/></svg>
  );
}

export default function LoginPage() {
  const { language } = useLanguage();
  const isID = language === "id";
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [returnTo, setReturnTo] = useState(withLocalePrefix("/profile", language));

  useEffect(() => {
    let active = true;
    let redirectTimer;

    async function finishLogin() {
      const params = new URLSearchParams(window.location.search);
      const safeReturn = getSafeReturnPath(params.get("next"), language);
      if (active) setReturnTo(safeReturn);

      const oauthError = params.get("error_description") || params.get("error");
      if (oauthError) {
        if (active) {
          setError(isID
            ? "Login Google tidak berhasil. Silakan coba kembali."
            : "Google sign-in was unsuccessful. Please try again.");
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session || session.user.is_anonymous) {
          if (active) setLoading(false);
          return;
        }

        if (isGoogleUser(session.user)) {
          const response = await fetch("/api/player/ensure", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to prepare player profile.");
        }

        if (active) {
          setSuccess(true);
          setLoading(false);
          redirectTimer = window.setTimeout(() => {
            window.location.replace(safeReturn);
          }, 900);
        }
      } catch (err) {
        console.error("Login completion error:", err);
        if (active) {
          setError(isID
            ? "Login berhasil dimulai, tetapi akun belum dapat disiapkan. Silakan coba lagi."
            : "Sign-in started, but your account could not be prepared. Please try again.");
          setLoading(false);
        }
      }
    }

    finishLogin();
    return () => {
      active = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [language, isID]);

  async function handleGoogleLogin() {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const callbackUrl = new URL(withLocalePrefix("/login", language), window.location.origin);
      callbackUrl.searchParams.set("next", returnTo);

      const options = {
        redirectTo: callbackUrl.toString(),
        queryParams: { prompt: "select_account" },
      };

      if (session?.user?.is_anonymous) {
        const { error: linkError } = await supabase.auth.linkIdentity({
          provider: "google",
          options,
        });
        if (linkError) throw linkError;
        return;
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options,
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      console.error("Google sign-in could not start:", err);
      setError(isID
        ? "Tidak dapat membuka login Google. Periksa koneksi lalu coba lagi."
        : "Could not open Google sign-in. Check your connection and try again.");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100svh-72px)] items-center justify-center bg-[var(--df-bg)] px-4 py-6">
        <VerificationState variant="user" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100svh-72px)] items-center justify-center overflow-hidden bg-[var(--df-bg)] px-3 py-5 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[min(75vw,34rem)] w-[min(75vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--df-primary)] opacity-[0.07] blur-3xl" />
      </div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        aria-describedby="login-description"
        className="relative z-10 w-full max-w-[25rem] rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-5 text-center shadow-[var(--df-shadow-lg)] sm:rounded-3xl sm:p-7"
      >
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl border border-[var(--df-border)] bg-[var(--df-primary-soft)] text-lg font-black text-[var(--df-primary)] sm:mb-4 sm:h-12 sm:w-12">
          DF
        </div>

        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--df-primary)]">
          DAJJAL FAMILY
        </p>
        <h1 id="login-title" className="text-xl font-bold tracking-tight text-[var(--df-text)] sm:text-2xl">
          {isID ? "Selamat datang" : "Welcome to the family"}
        </h1>
        <p id="login-description" className="mx-auto mt-2 max-w-[19rem] text-xs leading-relaxed text-[var(--df-text-secondary)] sm:text-sm">
          {isID
            ? "Masuk atau buat akun untuk melanjutkan ke fitur yang membutuhkan akun."
            : "Sign in or create an account to continue to this account-required feature."}
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={busy || success}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-4 py-3 text-sm font-bold text-[var(--df-text)] transition hover:border-[var(--df-primary)] hover:bg-[var(--df-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--df-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--df-surface)] disabled:cursor-wait disabled:opacity-60 sm:mt-6"
        >
          <GoogleIcon />
          <span>{busy ? (isID ? "Menghubungkan..." : "Connecting...") : "Continue with Google"}</span>
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-[var(--df-text-muted)]">
          {isID
            ? "Pengguna baru akan dibuatkan akun secara otomatis."
            : "A new account is created automatically for first-time users."}
        </p>

        {success && (
          <div role="status" className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[var(--df-success)]/30 bg-[var(--df-success)]/10 px-3 py-2.5 text-xs font-semibold text-[var(--df-success)]">
            <StatusIcon success />
            {isID ? "Login berhasil. Mengembalikanmu ke halaman sebelumnya..." : "Login successful. Returning you to your previous page..."}
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--df-danger)]/30 bg-[var(--df-danger)]/10 px-3 py-2.5 text-left text-xs leading-relaxed text-[var(--df-danger)]">
            <span className="mt-0.5 shrink-0"><StatusIcon /></span>
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 border-t border-[var(--df-border)] pt-3">
          <p className="text-[10px] leading-relaxed text-[var(--df-text-muted)]">
            {isID
              ? "Dengan melanjutkan, kamu menyetujui ketentuan dan kebijakan privasi DAJJAL FAMILY."
              : "By continuing, you agree to DAJJAL FAMILY's terms and privacy policy."}
          </p>
          <p className="mt-2 text-[10px] font-medium text-[var(--df-text-muted)]">
            One Family. Many Possibilities.
          </p>
        </div>
      </section>
    </main>
  );
}
