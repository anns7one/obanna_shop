"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useCartStore } from "@/store/cartStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

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

  if (!mounted) {
    return <div className={styles.container} />;
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Nothing to check out yet</h1>
        <p className={styles.emptyHint}>Add a few pieces to your cart first.</p>
        <Button href="/catalog" size="lg" className={styles.emptyCta}>
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout</h1>
      <div className={styles.form}>
        <CheckoutForm />
      </div>
    </div>
  );
}
