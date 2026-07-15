"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useCartStore } from "@/store/cartStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  );
}

function CheckoutPageContent() {
  const mounted = useHasMounted();
  const items = useCartStore((s) => s.items);
  // Placing an order clears the cart, which would otherwise make this page
  // fall straight into the "empty cart" branch below before the success
  // message ever gets a chance to render.
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!mounted) {
    return <div className="checkout-page" />;
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="page-empty fade-in">
        <h1 className="page-empty-title">Nothing to check out yet</h1>
        <p className="page-empty-hint">Add a few pieces to your cart first.</p>
        <Button href="/catalog" size="lg" className="page-empty-cta">
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-page-title fade-in fade-in-1">Checkout</h1>
      <div className="checkout-page-form fade-in fade-in-2">
        <CheckoutForm onOrderPlaced={() => setOrderPlaced(true)} />
      </div>
    </div>
  );
}
