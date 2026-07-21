import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo variant="full" className="footer-logo-mark" />
          <p className="footer-tagline">
            A quiet, considered showroom of everyday clothing and accessories.
          </p>
        </div>

        <div>
          <h3 className="footer-title">Shop</h3>
          <ul className="footer-list">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog?category=${c.slug}`} className="footer-link">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="footer-title">Account</h3>
          <ul className="footer-list">
            <li>
              <Link href="/account/orders" className="footer-link">
                Order history
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="footer-link">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/login" className="footer-link">
                Log in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">Support</h3>
          <ul className="footer-list">
            <li>
              <span className="footer-text">hello@obaatelier.com</span>
            </li>
            <li>
              <span className="footer-text">Shipping &amp; returns</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} OBA Atelier. All rights reserved.</div>
    </footer>
  );
}
