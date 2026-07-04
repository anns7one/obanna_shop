"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import styles from "./ProductActions.module.css";

export function ProductActions({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const mounted = useHasMounted();
  const addItem = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      category: product.category,
      size,
      color,
      quantity,
      stock: product.stock,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2500);
  }

  return (
    <div className={styles.container}>
      <div>
        <span className={styles.label}>
          Color — <span className={styles.value}>{color}</span>
        </span>
        <div className={styles.row}>
          {product.colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-pressed={color === c}
              className={cn(styles.pill, color === c && styles.selected)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className={styles.label}>Size</span>
        <div className={styles.row}>
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              className={cn(styles.pill, size === s && styles.selected)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className={styles.label}>Quantity</span>
        <QuantityStepper
          quantity={quantity}
          max={Math.max(product.stock, 1)}
          onChange={setQuantity}
          label={product.title}
        />
      </div>

      <div className={styles.actions}>
        <Button onClick={handleAddToCart} disabled={outOfStock} size="lg" fullWidth>
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={mounted && isWishlisted}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={styles.fav}
        >
          <Heart size={20} className={cn(mounted && isWishlisted && styles.active)} aria-hidden />
        </button>
      </div>

      <p role="status" aria-live="polite" className={cn(styles.status, !justAdded && styles.srOnly)}>
        {justAdded ? "Added to your cart." : ""}
      </p>
    </div>
  );
}
