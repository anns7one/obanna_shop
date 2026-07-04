"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import styles from "./AuthGuard.module.css";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const mounted = useHasMounted();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (mounted && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, user, pathname, router]);

  if (!mounted || !user) {
    return <div className={styles.loading}>Loading…</div>;
  }

  return <>{children}</>;
}
