"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { PriceTag } from "@/components/ui/PriceTag";
import { Badge } from "@/components/ui/Badge";
import { useWishlistStore } from "@/store/wishlistStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";

export function ProductCard({ product, showDiscount = false }: { product: Product; showDiscount?: boolean }) {
  const mounted = useHasMounted();
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discountPercent = onSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link href={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-frame">
          <ProductImagePlaceholder title={product.title} category={product.category} className="product-card-image" />
          <div className="product-card-badges">
            {product.isNew && <Badge tone="sky">New</Badge>}
            {onSale && <Badge tone="blush">{showDiscount ? `Save ${discountPercent}%` : "Sale"}</Badge>}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={mounted && isWishlisted}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="product-card-fav"
      >
        <Heart size={16} className={cn(mounted && isWishlisted && "product-card-fav-active")} aria-hidden />
      </button>

      <Link href={`/product/${product.slug}`} className="product-card-info">
        <span className="product-card-title">{product.title}</span>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
      </Link>
    </div>
  );
}
