"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { getProductById } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function WishlistPage() {
  const mounted = useHasMounted();
  const productIds = useWishlistStore((s) => s.productIds);

  if (!mounted) {
    return <div className={styles.container} />;
  }

  const products = productIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Your wishlist is empty</h1>
        <p className={styles.emptyHint}>Tap the heart on any piece to save it here.</p>
        <Button href="/catalog" size="lg" className={styles.emptyCta}>
          Browse the shop
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your wishlist</h1>
      <p className={styles.subtitle}>
        {products.length} saved piece{products.length === 1 ? "" : "s"}.
      </p>
      <div className={styles.grid}>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
