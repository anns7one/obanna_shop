"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/lib/data/categories";
import { useCartStore, selectCartCount } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/catalog", label: "All" },
  ...categories.map((c) => ({ href: `/catalog?category=${c.slug}`, label: c.name })),
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const mounted = useHasMounted();

  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const user = useAuthStore((s) => s.user);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/catalog?q=${encodeURIComponent(searchTerm.trim())}`);
  }

  return (
    <>
      <header className="header liquid-glass">
        <div className="header-bar">
          <button
            type="button"
            className={cn("header-icon", "header-menu-btn")}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} aria-hidden />
          </button>

          <Link href="/" className="header-logo">
            Obanna
          </Link>

          <nav className="header-nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="header-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search size={20} aria-hidden />
            </button>

            <Link
              href={user ? "/account" : "/login"}
              className={cn("header-icon", "header-account")}
              aria-label={user ? "Account" : "Log in"}
            >
              <User size={20} aria-hidden />
            </Link>

            <Link
              href="/wishlist"
              className={cn("header-icon", "header-badge")}
              aria-label={mounted && wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved` : "Wishlist"}
            >
              <Heart size={20} aria-hidden />
              {mounted && wishlistCount > 0 && <span className="header-count">{wishlistCount}</span>}
            </Link>

            <Link
              href="/cart"
              className={cn("header-icon", "header-badge")}
              aria-label={mounted && cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}` : "Cart"}
            >
              <ShoppingBag size={20} aria-hidden />
              {mounted && cartCount > 0 && <span className="header-count">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="header-search">
            <form onSubmit={handleSearchSubmit} className="header-form">
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                id="site-search"
                type="search"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dresses, knitwear, accessories…"
                className="header-input"
              />
              <button type="submit" className="header-submit">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      <div className={cn("header-drawer", menuOpen ? "header-drawer-open" : "header-drawer-closed")}>
        <div
          className={cn("header-overlay", menuOpen && "header-overlay-open")}
          onClick={() => setMenuOpen(false)}
        />
        <div className={cn("header-panel", menuOpen && "header-panel-open")}>
          <div className="header-head">
            <span className="header-title">Menu</span>
            <button
              type="button"
              className="header-icon"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <nav className="header-list">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="header-item"
              >
                {link.label}
              </Link>
            ))}
            <div className="header-divider" />
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="header-item"
            >
              {user ? "My account" : "Log in"}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
