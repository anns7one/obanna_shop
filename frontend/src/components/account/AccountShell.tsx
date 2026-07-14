"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/account/Avatar";
import { AccountNav } from "@/components/account/AccountNav";

export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AccountShellContent>{children}</AccountShellContent>
    </AuthGuard>
  );
}

function AccountShellContent({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="account-shell">
      <aside className="account-sidebar">
        <div className="account-sidebar-profile">
          <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
          <div className="account-sidebar-identity">
            <p className="account-sidebar-name">
              {user.firstName} {user.lastName}
            </p>
            <p className="account-sidebar-email">{user.email}</p>
          </div>
        </div>
        <AccountNav />
      </aside>

      <div className="account-content">{children}</div>
    </div>
  );
}
