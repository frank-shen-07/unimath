"use client";

import { useEffect, useState } from "react";
import type { AppSession } from "@/lib/auth/session";

export function useAppSession() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/app-session", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!cancelled) {
          setSession((payload.session as AppSession | null) ?? null);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return { session, loading };
}
