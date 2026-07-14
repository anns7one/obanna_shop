"use client";

import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/account/Avatar";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="account-page">
      <div className="account-page-header">
        <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
        <div>
          <h1 className="account-page-title">Personal data</h1>
          <p className="account-page-hint">Update the name on your account.</p>
        </div>
      </div>

      <ProfileForm />

      <div className="account-page-footer">
        <Button href="/wishlist" variant="ghost" size="sm">
          View wishlist
        </Button>
      </div>
    </div>
  );
}
