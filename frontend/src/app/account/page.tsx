"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

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
    <div className="account-page">
      <h1 className="account-page-title">Hi, {user.firstName}</h1>
      <p className="account-page-email">{user.email}</p>

      <div className="account-page-grid">
        <Button href="/account/orders" variant="secondary" size="lg" className="account-page-link">
          Order history
        </Button>
        <Button href="/wishlist" variant="secondary" size="lg" className="account-page-link">
          Wishlist
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="account-page-logout"
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
