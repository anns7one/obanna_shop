import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const statusTone: Record<OrderStatus, "blush" | "sky" | "butter" | "ink"> = {
  processing: "butter",
  confirmed: "sky",
  shipped: "sky",
  delivered: "blush",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="orders-order">
      <header className="orders-head">
        <div>
          <p className="orders-id">Order #{order.id.slice(0, 8)}</p>
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

      <footer className="orders-total">
        <span>Total</span>
        <span>{formatPrice(order.totalPrice)}</span>
      </footer>
    </article>
  );
}
