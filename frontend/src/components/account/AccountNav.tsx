"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LogOut, MapPin, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { logoutUser } from "@/lib/api/auth";

const links = [
  { href: "/account", label: "Personal data", Icon: User },
  { href: "/account/orders", label: "Orders", Icon: Package },
  { href: "/account/address", label: "Address", Icon: MapPin },
  { href: "/account/payment", label: "Payment", Icon: CreditCard },
];

export function AccountNav() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <nav className="account-nav">
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn("account-nav-link", pathname === href && "account-nav-link-active")}
        >
          <Icon size={17} aria-hidden />
          {label}
        </Link>
      ))}

      <button
        type="button"
        className="account-nav-link account-nav-logout"
        onClick={() => {
          // Revoke the server-side refresh session first (best-effort),
          // then clear local state and hard-navigate: avoids racing
          // AuthGuard's own redirect effect, which fires the instant
          // `user` goes null on this guarded page.
          logoutUser().finally(() => {
            logout();
            window.location.assign("/");
          });
        }}
      >
        <LogOut size={17} aria-hidden />
        Log out
      </button>
    </nav>
  );
}
