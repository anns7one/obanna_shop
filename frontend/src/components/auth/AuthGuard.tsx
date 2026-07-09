"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useHasMounted } from "@/hooks/useHasMounted";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const mounted = useHasMounted();
  const user = useAuthStore((s) => s.user);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const router = useRouter();
  const pathname = usePathname();

  // Wait for the silent-refresh bootstrap to resolve before deciding
  // there's no session — otherwise a valid session gets redirected away
  // on every page reload, since the in-memory access token starts null.
  const ready = mounted && bootstrapped;

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, pathname, router]);

  if (!ready || !user) {
    return <div className="auth-loading">Loading…</div>;
  }

  return <>{children}</>;
}
