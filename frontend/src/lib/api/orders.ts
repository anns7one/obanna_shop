import { readCollection, writeCollection } from "@/lib/mockDb";
import type { CartItem, Order, ShippingDetails } from "@/lib/types";
import { delay } from "@/lib/utils";

/** Stage-1 mock of `POST /orders` and `GET /orders/my`. */

const ORDERS_KEY = "obanna_mock_orders";

export interface CreateOrderInput {
  userId: string;
  items: CartItem[];
  shipping: ShippingDetails;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay(500);

  const totalPrice = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const order: Order = {
    id: crypto.randomUUID(),
    userId: input.userId,
    items: input.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),
    totalPrice,
    status: "processing",
    shipping: input.shipping,
    createdAt: new Date().toISOString(),
  };

  const orders = readCollection<Order>(ORDERS_KEY);
  writeCollection(ORDERS_KEY, [order, ...orders]);
  return order;
}

export async function fetchMyOrders(userId: string): Promise<Order[]> {
  await delay(250);
  const orders = readCollection<Order>(ORDERS_KEY);
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
