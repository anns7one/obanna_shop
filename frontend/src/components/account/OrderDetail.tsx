"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCancelOrder, useChangeOrderPaymentMethod, useOrder, useRepeatOrder } from "@/hooks/useOrders";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const statusTone: Record<OrderStatus, "blush" | "sky" | "butter" | "ink"> = {
  processing: "butter",
  confirmed: "sky",
  shipped: "sky",
  delivered: "blush",
  cancelled: "ink",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const brandLabel: Record<string, string> = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", other: "Card" };

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const repeatOrder = useRepeatOrder();
  const changePaymentMethod = useChangeOrderPaymentMethod();
  const { data: paymentMethods } = usePaymentMethods();
  const [repeatNotice, setRepeatNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!order || searchParams.get("print") !== "1") return;
    const timeout = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timeout);
  }, [order, searchParams]);

  if (isLoading) {
    return <p className="account-loading">Loading…</p>;
  }

  if (isError || !order) {
    return (
      <div className="data-error" role="alert">
        <p>We couldn&apos;t find that order.</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const canCancel = order.status === "processing" || order.status === "confirmed";
  const canChangePayment = canCancel;

  const handleRepeat = () => {
    setRepeatNotice(null);
    repeatOrder.mutate(order, {
      onSuccess: ({ addedCount, skippedCount }) => {
        if (addedCount === 0) {
          setRepeatNotice("None of the items in this order are available anymore.");
          return;
        }
        if (skippedCount > 0) {
          setRepeatNotice(`${skippedCount} item${skippedCount === 1 ? " is" : "s are"} no longer available and was left out.`);
        }
        router.push("/cart");
      },
    });
  };

  return (
    <div className="order-detail">
      <div className="order-detail-head">
        <div>
          <p className="order-detail-contact">{order.contactFullName}</p>
          <Badge tone={statusTone[order.status]}>{order.status}</Badge>
        </div>
        <p className="order-detail-sum">{formatPrice(order.totalPrice)}</p>
      </div>

      <div className="order-detail-actions no-print">
        {canCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={cancelOrder.isPending}
            onClick={() => cancelOrder.mutate(order.id)}
          >
            {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" disabled={repeatOrder.isPending} onClick={handleRepeat}>
          {repeatOrder.isPending ? "Adding to cart…" : "Repeat order"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
          Print order
        </Button>
      </div>

      {repeatNotice && (
        <div className="orders-notice no-print" role="status" aria-live="polite">
          {repeatNotice}
        </div>
      )}

      <details className="order-detail-section">
        <summary>Details</summary>
        <dl className="order-detail-fields">
          <div>
            <dt>Login</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{order.contactEmail || "—"}</dd>
          </div>
          <div>
            <dt>Payer type</dt>
            <dd>Individual</dd>
          </div>
          <div>
            <dt>Full name</dt>
            <dd>{order.shipping.fullName}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{order.contactPhone}</dd>
          </div>
          <div>
            <dt>Postal code</dt>
            <dd>{order.shipping.postalCode}</dd>
          </div>
          {order.orderComment && (
            <div>
              <dt>Comment</dt>
              <dd>{order.orderComment}</dd>
            </div>
          )}
        </dl>
      </details>

      <section className="order-detail-section">
        <h2>Payment parameters</h2>
        <dl className="order-detail-fields">
          <div>
            <dt>Order number</dt>
            <dd>#{order.orderNumber}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{dateFormatter.format(new Date(order.createdAt))}</dd>
          </div>
          <div>
            <dt>Sum</dt>
            <dd>{formatPrice(order.totalPrice)}</dd>
          </div>
          <div>
            <dt>Payment method</dt>
            <dd>{order.paymentMethodLabel}</dd>
          </div>
        </dl>

        {canChangePayment && (
          <details className="order-detail-subsection no-print">
            <summary>Change payment method</summary>
            <div className="order-detail-payment-options">
              {paymentMethods?.map((m) => (
                <label key={m.id} className="checkout-picker-option">
                  <input
                    type="radio"
                    name="order-payment"
                    disabled={changePaymentMethod.isPending}
                    onChange={() => changePaymentMethod.mutate({ orderId: order.id, paymentMethodId: m.id })}
                  />
                  <span className="checkout-picker-body">
                    <span className="checkout-picker-label">
                      {brandLabel[m.brand]} •••• {m.last4}
                    </span>
                  </span>
                </label>
              ))}
              <label className="checkout-picker-option">
                <input
                  type="radio"
                  name="order-payment"
                  disabled={changePaymentMethod.isPending}
                  onChange={() => changePaymentMethod.mutate({ orderId: order.id, paymentMethodId: undefined })}
                />
                <span className="checkout-picker-body">
                  <span className="checkout-picker-label">Cash on delivery</span>
                </span>
              </label>
            </div>
          </details>
        )}
      </section>

      <section className="order-detail-section">
        <h2>Shipping parameters</h2>
        <dl className="order-detail-fields">
          <div>
            <dt>Order number</dt>
            <dd>#{order.orderNumber}</dd>
          </div>
          <div>
            <dt>Sum</dt>
            <dd>{formatPrice(order.totalPrice)}</dd>
          </div>
          <div>
            <dt>Delivery cost</dt>
            <dd>{order.deliveryCost > 0 ? formatPrice(order.deliveryCost) : "Free"}</dd>
          </div>
          <div>
            <dt>Delivery method</dt>
            <dd>{order.deliveryMethodLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="order-detail-section">
        <h2>Order contents</h2>
        <ul className="orders-items">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="orders-item">
              <span>
                {item.title} ({item.color}, {item.size}) × {item.quantity}
              </span>
              <span className="orders-price">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      <Button href="/account/orders" variant="secondary" className="no-print">
        Back to order list
      </Button>
    </div>
  );
}
