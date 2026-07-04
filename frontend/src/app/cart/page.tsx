"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore, selectCartTotal } from "@/store/cartStore";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function CartPage() {
  const mounted = useHasMounted();
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (!mounted) {
    return <div className="cart-page" />;
  }

  if (items.length === 0) {
    return (
      <div className="page-empty">
        <h1 className="page-empty-title">Your cart is empty</h1>
        <p className="page-empty-hint">Pieces you add will show up here.</p>
        <Button href="/catalog" size="lg" className="page-empty-cta">
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">Your cart</h1>

      <div className="cart-page-layout">
        <ul className="cart-page-list">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="cart-page-item">
              <Link href={`/product/${item.slug}`} className="cart-page-thumb">
                <ProductImagePlaceholder
                  title={item.title}
                  category={item.category}
                  compact
                  className="cart-page-img"
                />
              </Link>

              <div className="cart-page-body">
                <div className="cart-page-top">
                  <div>
                    <Link href={`/product/${item.slug}`} className="cart-page-name">
                      {item.title}
                    </Link>
                    <p className="cart-page-meta">
                      {item.color} · Size {item.size}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    aria-label={`Remove ${item.title} from cart`}
                    className="cart-page-remove"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>

                <div className="cart-page-bottom">
                  <QuantityStepper
                    quantity={item.quantity}
                    max={item.stock}
                    onChange={(next) => updateQuantity(item.productId, item.size, item.color, next)}
                    label={item.title}
                  />
                  <span className="cart-page-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-page-summary">
          <h2 className="cart-page-heading">Order summary</h2>
          <dl className="cart-page-rows">
            <div className="cart-page-row">
              <dt>Subtotal</dt>
              <dd className="cart-page-value">{formatPrice(total)}</dd>
            </div>
            <div className="cart-page-row">
              <dt>Shipping</dt>
              <dd className="cart-page-muted">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="cart-page-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button href="/checkout" size="lg" fullWidth className="cart-page-submit">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
