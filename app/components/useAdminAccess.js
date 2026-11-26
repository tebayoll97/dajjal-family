"use client";
import { useEffect, useState } from "react";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { verifyAdminSession } from "@/lib/adminClientSession";

export default function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function check(session) {
      if (!session?.access_token || !session?.user?.id) {
        if (active) setIsAdmin(false);
        return;
      }

      try {
        const response = await verifyAdminSession(session);
        const result = await response.json();
        if (active) setIsAdmin(response.ok && result.success === true);
      } catch (error) {
        console.error("Admin check failed:", error);
        if (active) setIsAdmin(false);
      }
    }

    supabaseAdminClient.auth.getSession().then(({ data: { session } }) => check(session));
    const { data: { subscription } } = supabaseAdminClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (active) setIsAdmin(false);
        return;
      }
      if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) check(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return isAdmin;
}
