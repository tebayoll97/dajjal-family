"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";
import { withLocalePrefix } from "@/lib/localePath";

function isGoogleUser(user) {
  return user?.app_metadata?.provider === "google" ||
    (user?.app_metadata?.providers || []).includes("google") ||
    (user?.identities || []).some((identity) => identity.provider === "google");
}

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isID = language === "id";
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const profilePath = withLocalePrefix("/profile", language);

  useEffect(() => {
    let active = true;

    async function finishLogin() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          if (active) setLoading(false);
          return;
        }

        if (session.user.is_anonymous) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        // Google sign-ins need the player bootstrap; existing password accounts
        // already have their linked player record and must not be re-created.
        if (isGoogleUser(session.user)) {
          const response = await fetch("/api/player/ensure", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: "no-store",
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to prepare player profile.");
        }

        if (active) router.replace(profilePath);
      } catch (err) {
        console.error("Login completion error:", err);
        if (active) {
          setError(err.message || (isID ? "Login gagal." : "Login failed."));
          setLoading(false);
        }
      }
    }

    finishLogin();
    return () => { active = false; };
  }, [router, profilePath, isID]);

  async function handleGoogleLogin() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const options = {
        redirectTo: window.location.origin + withLocalePrefix("/login", language),
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
      setError(err.message || "Google login failed.");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center px-5 py-12">
        <p className="text-sm text-[var(--df-text-secondary)]" role="status">
          {isID ? "Memeriksa akun..." : "Checking account..."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center px-5 py-12">
      <section className="w-full max-w-md text-center" aria-labelledby="login-title">
        <h1 id="login-title" className="text-3xl font-semibold tracking-tight text-[var(--df-text)] sm:text-4xl">
          {isID ? "Masuk atau Daftar" : "Log in or Sign up"}
        </h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={busy}
          className="mt-10 flex min-h-16 w-full items-center justify-center gap-3 rounded-full border border-[var(--df-border-strong)] bg-[var(--df-surface)] px-6 py-4 text-base font-semibold text-[var(--df-text)] shadow-sm transition hover:border-[var(--df-primary)] hover:bg-[var(--df-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--df-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--df-bg)] disabled:cursor-wait disabled:opacity-60"
        >
          <svg viewBox="0 0 48 48" className="h-6 w-6 shrink-0" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.45 9.5 24 9.5z" transform="translate(0 4)"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.95 46.98 31.75 46.98 24.55z"/>
            <path fill="#FBBC05" d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.48-6.19z" transform="translate(0 4)"/>
            <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.93-5.8l-7.73-6c-2.14 1.45-4.87 2.3-8.2 2.3-6.55 0-12.07-4.22-14.04-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -4)"/>
          </svg>
          <span>{busy ? (isID ? "Menghubungkan..." : "Connecting...") : "Continue with Google"}</span>
        </button>

        <p className="mt-6 text-sm text-[var(--df-text-secondary)]">
          {isID ? "Satu akun untuk semua fitur" : "One account for all features"}
        </p>

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-[var(--df-danger)]/30 bg-[var(--df-danger)]/10 px-4 py-3 text-sm text-[var(--df-danger)]">
            {error}
          </p>
        )}
      </section>
    </main>
  );

}
