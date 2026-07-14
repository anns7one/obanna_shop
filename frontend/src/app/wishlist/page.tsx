"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { getProductById } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const mounted = useHasMounted();
  const productIds = useWishlistStore((s) => s.productIds);

  if (!mounted) {
    return <div className="wishlist-page" />;
  }

  const products = productIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <div className="page-empty fade-in">
        <h1 className="page-empty-title">Your wishlist is empty</h1>
        <p className="page-empty-hint">Tap the heart on any piece to save it here.</p>
        <Button href="/catalog" size="lg" className="page-empty-cta">
          Browse the shop
        </Button>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-page-title fade-in fade-in-1">Your wishlist</h1>
      <p className="wishlist-page-subtitle fade-in fade-in-1">
        {products.length} saved piece{products.length === 1 ? "" : "s"}.
      </p>
      <div className="wishlist-page-grid fade-in fade-in-2">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
