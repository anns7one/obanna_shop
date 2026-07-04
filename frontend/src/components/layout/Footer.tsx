import Link from "next/link";
import { categories } from "@/lib/data/categories";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <span className={styles.logo}>Obanna</span>
          <p className={styles.tagline}>
            A quiet, considered showroom of everyday clothing and accessories.
          </p>
        </div>

        <div>
          <h3 className={styles.title}>Shop</h3>
          <ul className={styles.list}>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog?category=${c.slug}`} className={styles.link}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>Account</h3>
          <ul className={styles.list}>
            <li>
              <Link href="/account/orders" className={styles.link}>
                Order history
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className={styles.link}>
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/login" className={styles.link}>
                Log in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>Support</h3>
          <ul className={styles.list}>
            <li>
              <span className={styles.text}>hello@obanna.shop</span>
            </li>
            <li>
              <span className={styles.text}>Shipping &amp; returns</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>© {new Date().getFullYear()} Obanna. All rights reserved.</div>
    </footer>
  );
}
