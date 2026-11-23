"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { verifyAdminSession } from "@/lib/adminClientSession";
import { VerificationState } from "@/app/components/ui";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const router = useRouter();
  const [auth, setAuth] = useState({ status: "checking", session: null, admin: null, error: "" });
  const verifyAttempt = useRef(0);

  const verify = useCallback(async (session) => {
    const attempt = ++verifyAttempt.current;
    if (!session?.access_token || !session?.user?.id) {
      setAuth({ status: "signed-out", session: null, admin: null, error: "" });
      router.replace("/admin/login");
      return;
    }
    setAuth((current) => current.status === "verified" && current.session?.user?.id === session.user.id
      ? { ...current, session }
      : { status: "checking", session, admin: null, error: "" });
    try {
      const response = await verifyAdminSession(session);
      const result = await response.json().catch(() => ({}));
      if (attempt !== verifyAttempt.current) return;
      if (!response.ok || !result?.admin) {
        if (response.status === 401 || response.status === 403) {
          await supabaseAdminClient.auth.signOut();
          setAuth({ status: "signed-out", session: null, admin: null, error: "" });
          router.replace("/admin/login");
          return;
        }
        throw new Error(result?.error || "Administrator access could not be verified.");
      }
      if (attempt === verifyAttempt.current) setAuth({ status: "verified", session, admin: result.admin, error: "" });
    } catch (error) {
      if (attempt === verifyAttempt.current) setAuth({ status: "error", session: null, admin: null, error: error?.message || "Administrator verification failed." });
    }
  }, [router]);

  const retry = useCallback(async () => {
    setAuth((current) => ({ ...current, status: "checking", error: "" }));
    const { data, error } = await supabaseAdminClient.auth.getSession();
    if (error) {
      setAuth({ status: "error", session: null, admin: null, error: error.message });
      return;
    }
    await verify(data?.session);
  }, [verify]);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabaseAdminClient.auth.onAuthStateChange((event, session) => {
      Promise.resolve().then(async () => {
        if (!active) return;
        if (event === "SIGNED_OUT") {
          verifyAttempt.current += 1;
          setAuth({ status: "signed-out", session: null, admin: null, error: "" });
          router.replace("/admin/login");
          return;
        }
        if (event === "TOKEN_REFRESHED" && session?.access_token) {
          await verify(session);
          return;
        }
        if (event === "SIGNED_IN" || event === "USER_UPDATED") await verify(session);
      });
    });
    supabaseAdminClient.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuth({ status: "error", session: null, admin: null, error: error.message });
      else verify(data?.session);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router, verify]);

  const value = useMemo(() => ({ ...auth, retry }), [auth, retry]);
  if (auth.status === "checking") return <div className="df-admin-auth-gate"><VerificationState variant="admin" /></div>;
  if (auth.status === "error") return <div className="df-admin-auth-gate"><VerificationState variant="admin" status="error" description={auth.error} onRetry={retry} /></div>;
  if (auth.status !== "verified") return null;
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
}
