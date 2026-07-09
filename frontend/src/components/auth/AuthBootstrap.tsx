"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "@/lib/api/client";
import { useAuthStore } from "@/store/authStore";

/**
 * Renders nothing. On mount, if a user is already persisted from a previous
 * session, attempts one silent /auth/refresh (using the httpOnly cookie) to
 * restore an in-memory access token after a page reload — the token itself
 * is never persisted, so this is the only way a session survives a reload.
 * If the refresh session is gone (expired/revoked), clears the stale local
 * user instead of leaving the app in a logged-in-looking-but-broken state.
 */
export function AuthBootstrap() {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const user = useAuthStore.getState().user;
      if (user) {
        const ok = await refreshAccessToken();
        if (!ok) {
          useAuthStore.getState().logout();
        }
      }
      if (!cancelled) {
        useAuthStore.getState().setBootstrapped(true);
      }
    }

    if (useAuthStore.persist.hasHydrated()) {
      run();
      return () => {
        cancelled = true;
      };
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      run();
    });
    return () => {
      unsubscribe();
      cancelled = true;
    };
  }, []);

  return null;
}
