"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCancelOrder, useMyOrders, useRepeatOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/Button";
import { OrderCard } from "@/components/account/OrderCard";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "active" | "history" | "cancelled";

const TAB_LABEL: Record<Tab, string> = {
  active: "Active",
  history: "History",
  cancelled: "Cancelled",
};

/** History = completed orders (shipped or delivered) — a shipped order is
 * no longer "active" even before the customer has actually received it. */
function tabFor(order: Order): Tab {
  if (order.status === "cancelled") return "cancelled";
  if (order.status === "shipped" || order.status === "delivered") return "history";
  return "active";
}

function isTab(value: string | null): value is Tab {
  return value === "active" || value === "history" || value === "cancelled";
}

export function OrdersView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: orders, isLoading, isError, error, refetch } = useMyOrders(user?.id);
  const cancelOrder = useCancelOrder();
  const repeatOrder = useRepeatOrder();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [repeatingId, setRepeatingId] = useState<string | null>(null);
  const [repeatNotice, setRepeatNotice] = useState<string | null>(null);
  const justPlacedOrder = searchParams.get("success") === "1";

  const tabParam = searchParams.get("tab");
  const tab: Tab = isTab(tabParam) ? tabParam : "active";

  function setTab(next: Tab) {
    router.push(`/account/orders?tab=${next}`);
  }

  const grouped = useMemo(() => {
    const groups: Record<Tab, Order[]> = { active: [], history: [], cancelled: [] };
    for (const order of orders ?? []) groups[tabFor(order)].push(order);
    return groups;
  }, [orders]);

  function handleCancel(orderId: string) {
    setCancellingId(orderId);
    cancelOrder.mutate(orderId, { onSettled: () => setCancellingId(null) });
  }

  function handleRepeat(order: Order) {
    setRepeatingId(order.id);
    setRepeatNotice(null);
    repeatOrder.mutate(order, {
      onSuccess: ({ addedCount, skippedCount }) => {
        setRepeatingId(null);
        if (addedCount === 0) {
          setRepeatNotice("None of the items in this order are available anymore.");
          return;
        }
        if (skippedCount > 0) {
          setRepeatNotice(`${skippedCount} item${skippedCount === 1 ? " is" : "s are"} no longer available and was left out.`);
        }
        router.push("/cart");
      },
      onError: () => setRepeatingId(null),
    });
  }

  return (
    <div className="orders">
      <h1 className="orders-title">Orders</h1>

      {justPlacedOrder && (
        <div className="orders-success" role="status" aria-live="polite">
          Thank you — your order has been placed.
        </div>
      )}

      {repeatNotice && (
        <div className="orders-notice" role="status" aria-live="polite">
          {repeatNotice}
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
              <div className={cn("orders-skeleton-line", "orders-skeleton-line-short")} />
              <div className="orders-skeleton-block" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="orders-tabs no-print" role="tablist">
            {(Object.keys(TAB_LABEL) as Tab[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={cn("orders-tab", tab === key && "orders-tab-active")}
                onClick={() => setTab(key)}
              >
                {TAB_LABEL[key]}
                <span className="orders-tab-count">{grouped[key].length}</span>
              </button>
            ))}
          </div>

          <div className="orders-list">
            {grouped[tab].length === 0 && (
              <div className="orders-empty">
                <p className="orders-empty-title">
                  {tab === "active" && "No active orders"}
                  {tab === "history" && "No order history yet"}
                  {tab === "cancelled" && "No cancelled orders"}
                </p>
                <div className="orders-empty-actions">
                  {tab === "active" && (
                    <Button variant="secondary" onClick={() => setTab("history")}>
                      View order history
                    </Button>
                  )}
                  {tab === "history" && (
                    <>
                      <Button variant="secondary" onClick={() => setTab("active")}>
                        View current orders
                      </Button>
                      <Button variant="secondary" onClick={() => setTab("cancelled")}>
                        View cancelled history
                      </Button>
                    </>
                  )}
                  {tab === "cancelled" && (
                    <Button variant="secondary" onClick={() => setTab("active")}>
                      View current orders
                    </Button>
                  )}
                  <Button href="/catalog">Go to catalog</Button>
                </div>
              </div>
            )}

            {grouped[tab].map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={tab === "active" ? handleCancel : undefined}
                cancelling={cancellingId === order.id}
                onRepeat={handleRepeat}
                repeating={repeatingId === order.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
