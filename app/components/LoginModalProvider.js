"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { withLocalePrefix } from "@/lib/localePath";
import { useLanguage } from "./LanguageProvider";

const LoginModalContext = createContext(null);

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

export function LoginModalProvider({ children }) {
  const { language } = useLanguage();
  const isID = language === "id";
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const closeLoginModal = useCallback(() => {
    if (busy) return;
    setRequest(null);
    setError("");
  }, [busy]);

  const openLoginModal = useCallback((options = {}) => {
    const next = typeof options.next === "string" && options.next.startsWith("/") && !options.next.startsWith("//")
      ? options.next
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;
    setRequest({
      next,
      reason: options.reason || "general",
      title: options.title || "",
      description: options.description || "",
    });
    setError("");
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!request) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) closeLoginModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [request, busy, closeLoginModal]);

  async function handleGoogleLogin() {
    if (!request || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const callbackUrl = new URL(withLocalePrefix("/login", language), window.location.origin);
      callbackUrl.searchParams.set("next", request.next);
      const options = {
        redirectTo: callbackUrl.toString(),
        queryParams: { prompt: "select_account" },
      };

      if (session?.user?.is_anonymous) {
        const { error: linkError } = await supabase.auth.linkIdentity({ provider: "google", options });
        if (linkError) throw linkError;
        return;
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options });
      if (oauthError) throw oauthError;
    } catch (authError) {
      console.error("Global Google sign-in failed:", authError);
      setError(isID
        ? "Tidak dapat membuka login Google. Periksa koneksi lalu coba lagi."
        : "Could not open Google sign-in. Check your connection and try again.");
      setBusy(false);
    }
  }

  const value = useMemo(() => ({ openLoginModal, closeLoginModal }), [openLoginModal, closeLoginModal]);
  const title = request?.title || (request?.reason === "game"
    ? (isID ? "Login untuk menyimpan progres" : "Sign in to save your progress")
    : (isID ? "Selamat datang" : "Welcome to the family"));
  const description = request?.description || (request?.reason === "game"
    ? (isID ? "Masuk dengan Google agar progres, koin, dan pencapaian game tersimpan di akunmu." : "Sign in with Google to save your game progress, coins, and achievements.")
    : (isID ? "Masuk atau buat akun untuk melanjutkan ke fitur DAJJAL FAMILY." : "Sign in or create an account to continue to this DAJJAL FAMILY feature."));

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      {request && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[color:color-mix(in_srgb,var(--df-bg)_82%,transparent)] px-3 py-4 backdrop-blur-md sm:px-6"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeLoginModal(); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="df-login-modal-title"
            aria-describedby="df-login-modal-description"
            className="relative my-auto w-full max-w-[25rem] rounded-2xl border border-[var(--df-border)] bg-[var(--df-surface)] p-5 text-center shadow-[var(--df-shadow-lg)] sm:rounded-3xl sm:p-7"
          >
            <button
              type="button"
              onClick={closeLoginModal}
              disabled={busy}
              aria-label={isID ? "Tutup login" : "Close login"}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[var(--df-border)] text-lg text-[var(--df-text-secondary)] transition hover:bg-[var(--df-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--df-focus)] disabled:opacity-40"
            >×</button>

            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl border border-[var(--df-border)] bg-[var(--df-primary-soft)] text-lg font-black text-[var(--df-primary)] sm:mb-4 sm:h-12 sm:w-12">DF</div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--df-primary)]">DAJJAL FAMILY</p>
            <h2 id="df-login-modal-title" className="text-xl font-bold tracking-tight text-[var(--df-text)] sm:text-2xl">{title}</h2>
            <p id="df-login-modal-description" className="mx-auto mt-2 max-w-[19rem] text-xs leading-relaxed text-[var(--df-text-secondary)] sm:text-sm">{description}</p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={busy}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--df-border-strong)] bg-[var(--df-surface-raised)] px-4 py-3 text-sm font-bold text-[var(--df-text)] transition hover:border-[var(--df-primary)] hover:bg-[var(--df-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--df-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--df-surface)] disabled:cursor-wait disabled:opacity-60 sm:mt-6"
            >
              <GoogleIcon />
              <span>{busy ? (isID ? "Menghubungkan..." : "Connecting...") : "Continue with Google"}</span>
            </button>

            <p className="mt-3 text-[11px] leading-relaxed text-[var(--df-text-muted)]">
              {isID ? "Pengguna baru akan dibuatkan akun secara otomatis." : "A new account is created automatically for first-time users."}
            </p>

            {error && (
              <div role="alert" className="mt-4 rounded-lg border border-[var(--df-danger)]/30 bg-[var(--df-danger)]/10 px-3 py-2.5 text-left text-xs leading-relaxed text-[var(--df-danger)]">
                {error}
              </div>
            )}

            <div className="mt-4 border-t border-[var(--df-border)] pt-3">
              <p className="text-[10px] leading-relaxed text-[var(--df-text-muted)]">
                {isID ? "Dengan melanjutkan, kamu menyetujui ketentuan dan kebijakan privasi DAJJAL FAMILY." : "By continuing, you agree to DAJJAL FAMILY's terms and privacy policy."}
              </p>
              <p className="mt-2 text-[10px] font-medium text-[var(--df-text-muted)]">One Family. Many Possibilities.</p>
            </div>
          </section>
        </div>
      )}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (!context) throw new Error("useLoginModal must be used within LoginModalProvider");
  return context;
}
