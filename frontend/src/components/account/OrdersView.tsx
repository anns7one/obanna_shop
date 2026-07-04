"use client";

import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { useMyOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import styles from "./OrdersView.module.css";

const statusTone: Record<OrderStatus, "blush" | "sky" | "butter" | "ink"> = {
  processing: "butter",
  confirmed: "sky",
  shipped: "sky",
  delivered: "blush",
};

export function OrdersView() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { data: orders, isLoading } = useMyOrders(user?.id);
  const justPlacedOrder = searchParams.get("success") === "1";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Order history</h1>

      {justPlacedOrder && <div className={styles.success}>Thank you — your order has been placed.</div>}

      <div className={styles.list}>
        {isLoading && <p className={styles.loading}>Loading your orders…</p>}

        {!isLoading && orders?.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No orders yet</p>
            <Button href="/catalog">Start shopping</Button>
          </div>
        )}

        {orders?.map((order) => (
          <div key={order.id} className={styles.order}>
            <div className={styles.head}>
              <div>
                <p className={styles.id}>Order #{order.id.slice(0, 8)}</p>
                <p className={styles.date}>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Badge tone={statusTone[order.status]}>{order.status}</Badge>
            </div>

            <ul className={styles.items}>
              {order.items.map((item, idx) => (
                <li key={idx} className={styles.item}>
                  <span>
                    {item.title} ({item.color}, {item.size}) × {item.quantity}
                  </span>
                  <span className={styles.price}>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className={styles.total}>
              <span>Total</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
