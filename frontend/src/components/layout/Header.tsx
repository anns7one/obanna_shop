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
import styles from "./Header.module.css";

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
      <header className={styles.header}>
        <div className={styles.bar}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} aria-hidden />
          </button>

          <Link href="/" className={styles.logo}>
            Obanna
          </Link>

          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.icon}
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search size={20} aria-hidden />
            </button>

            <Link
              href={user ? "/account" : "/login"}
              className={styles.account}
              aria-label={user ? "Account" : "Log in"}
            >
              <User size={20} aria-hidden />
            </Link>

            <Link href="/wishlist" className={cn(styles.icon, styles.badge)} aria-label="Wishlist">
              <Heart size={20} aria-hidden />
              {mounted && wishlistCount > 0 && <span className={styles.count}>{wishlistCount}</span>}
            </Link>

            <Link href="/cart" className={cn(styles.icon, styles.badge)} aria-label="Cart">
              <ShoppingBag size={20} aria-hidden />
              {mounted && cartCount > 0 && <span className={styles.count}>{cartCount}</span>}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className={styles.search}>
            <form onSubmit={handleSearchSubmit} className={styles.form}>
              <label htmlFor="site-search" className={styles.srOnly}>
                Search products
              </label>
              <input
                id="site-search"
                type="search"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dresses, knitwear, accessories…"
                className={styles.input}
              />
              <button type="submit" className={styles.submit}>
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      <div className={cn(styles.drawer, menuOpen ? styles.open : styles.closed)}>
        <div
          className={cn(styles.overlay, menuOpen && styles.open)}
          onClick={() => setMenuOpen(false)}
        />
        <div className={cn(styles.panel, menuOpen && styles.open)}>
          <div className={styles.head}>
            <span className={styles.title}>Menu</span>
            <button
              type="button"
              className={styles.icon}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <nav className={styles.list}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={styles.item}
              >
                {link.label}
              </Link>
            ))}
            <div className={styles.divider} />
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setMenuOpen(false)}
              className={styles.item}
            >
              {user ? "My account" : "Log in"}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
