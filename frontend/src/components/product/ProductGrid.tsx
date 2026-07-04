import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="product-grid-empty">
        <p className="product-grid-empty-title">No pieces found</p>
        <p className="product-grid-empty-hint">Try a different search or category.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
