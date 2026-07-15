"use client";

import { useAuthStore } from "@/store/authStore";
import { useHasMounted } from "@/hooks/useHasMounted";

/** Stock/availability is only shown to signed-in shoppers — guests see just
 * the returns line. Defaults to the hidden (guest) state until auth state
 * is known, rather than briefly flashing stock info to a guest on load. */
export function ProductStockNotice({ stock }: { stock: number }) {
  const mounted = useHasMounted();
  const user = useAuthStore((s) => s.user);

  if (!mounted || !user) {
    return <p className="product-page-stock">Free returns within 30 days.</p>;
  }

  return (
    <p className="product-page-stock">
      {stock > 0 ? `${stock} in stock` : "Currently unavailable"} · Free returns within 30 days.
    </p>
  );
}
