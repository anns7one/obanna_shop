"use client";

import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { useMyOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/Button";
import { OrderCard } from "@/components/account/OrderCard";

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
  const { data: orders, isLoading, isError, error, refetch } = useMyOrders(user?.id);
  const justPlacedOrder = searchParams.get("success") === "1";

  return (
    <div className="orders">
      <h1 className="orders-title">Order history</h1>

      {justPlacedOrder && (
        <div className="orders-success" role="status" aria-live="polite">
          Thank you — your order has been placed.
        </div>
      )}

      {isError && (
        <div className="data-error" role="alert">
          <p>{error instanceof Error ? error.message : "Something went wrong loading your orders."}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="orders-list">
          <p className="sr-only" role="status">
            Loading your orders…
          </p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="orders-skeleton-card">
              <div className="orders-skeleton-line orders-skeleton-line-title" />
              <div className="orders-skeleton-line orders-skeleton-line-short" />
              <div className="orders-skeleton-block" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="orders-list">
          {orders?.length === 0 && (
            <div className="orders-empty">
              <p className="orders-empty-title">No orders yet</p>
              <Button href="/catalog">Start shopping</Button>
            </div>
          )}

          {orders?.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
