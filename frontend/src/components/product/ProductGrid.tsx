import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import styles from "./ProductGrid.module.css";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.title}>No pieces found</p>
        <p className={styles.hint}>Try a different search or category.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
