"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}

function AccountContent() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hi, {user.firstName}</h1>
      <p className={styles.email}>{user.email}</p>

      <div className={styles.grid}>
        <Button href="/account/orders" variant="secondary" size="lg" className={styles.link}>
          Order history
        </Button>
        <Button href="/wishlist" variant="secondary" size="lg" className={styles.link}>
          Wishlist
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className={styles.logout}
        onClick={() => {
          logout();
          // Hard navigation: avoids racing AuthGuard's own redirect effect,
          // which fires the instant `user` goes null on this guarded page.
          window.location.assign("/");
        }}
      >
        Log out
      </Button>
    </div>
  );
}
