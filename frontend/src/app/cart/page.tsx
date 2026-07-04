"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore, selectCartTotal } from "@/store/cartStore";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useHasMounted } from "@/hooks/useHasMounted";
import styles from "./page.module.css";

export default function CartPage() {
  const mounted = useHasMounted();
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (!mounted) {
    return <div className={styles.container} />;
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <p className={styles.emptyHint}>Pieces you add will show up here.</p>
        <Button href="/catalog" size="lg" className={styles.emptyCta}>
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your cart</h1>

      <div className={styles.layout}>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className={styles.item}>
              <Link href={`/product/${item.slug}`} className={styles.thumb}>
                <ProductImagePlaceholder
                  title={item.title}
                  category={item.category}
                  compact
                  className={styles.img}
                />
              </Link>

              <div className={styles.body}>
                <div className={styles.top}>
                  <div>
                    <Link href={`/product/${item.slug}`} className={styles.name}>
                      {item.title}
                    </Link>
                    <p className={styles.meta}>
                      {item.color} · Size {item.size}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    aria-label={`Remove ${item.title} from cart`}
                    className={styles.remove}
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>

                <div className={styles.bottom}>
                  <QuantityStepper
                    quantity={item.quantity}
                    max={item.stock}
                    onChange={(next) => updateQuantity(item.productId, item.size, item.color, next)}
                    label={item.title}
                  />
                  <span className={styles.price}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.summary}>
          <h2 className={styles.heading}>Order summary</h2>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>Subtotal</dt>
              <dd className={styles.value}>{formatPrice(total)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Shipping</dt>
              <dd className={styles.muted}>Calculated at checkout</dd>
            </div>
          </dl>
          <div className={styles.total}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button href="/checkout" size="lg" fullWidth className={styles.submit}>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
