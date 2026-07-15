import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

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

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: string) => void;
  cancelling?: boolean;
  onRepeat?: (order: Order) => void;
  repeating?: boolean;
}

export function OrderCard({ order, onCancel, cancelling = false, onRepeat, repeating = false }: OrderCardProps) {
  const canCancel = Boolean(onCancel) && (order.status === "processing" || order.status === "confirmed");

  return (
    <article className="orders-order">
      <header className="orders-head">
        <div>
          <p className="orders-id">Order #{order.orderNumber}</p>
          <p className="orders-date">{dateFormatter.format(new Date(order.createdAt))}</p>
        </div>
        <Badge tone={statusTone[order.status]}>{order.status}</Badge>
      </header>

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

      <dl className="orders-meta-rows">
        <div className="orders-meta-row">
          <dt>Payment</dt>
          <dd>{order.paymentMethodLabel}</dd>
        </div>
        <div className="orders-meta-row">
          <dt>Delivery</dt>
          <dd>
            {order.deliveryMethodLabel} · {order.deliveryCost > 0 ? formatPrice(order.deliveryCost) : "Free"}
          </dd>
        </div>
      </dl>

      <footer className="orders-total">
        <span>Total</span>
        <span>{formatPrice(order.totalPrice)}</span>
      </footer>

      <div className="orders-actions no-print">
        {canCancel && (
          <Button type="button" variant="ghost" size="sm" disabled={cancelling} onClick={() => onCancel?.(order.id)}>
            {cancelling ? "Cancelling…" : "Cancel order"}
          </Button>
        )}
        {onRepeat && (
          <Button type="button" variant="ghost" size="sm" disabled={repeating} onClick={() => onRepeat(order)}>
            {repeating ? "Adding to cart…" : "Repeat order"}
          </Button>
        )}
        <Button variant="ghost" size="sm" href={`/account/orders/${order.id}`}>
          Order details
        </Button>
        <Button variant="ghost" size="sm" href={`/account/orders/${order.id}?print=1`}>
          Print order
        </Button>
      </div>
    </article>
  );
}
