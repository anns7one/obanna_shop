import { apiFetch } from "@/lib/api/client";
import type { CartItem, Order, ShippingDetails } from "@/lib/types";

export interface CreateOrderInput {
  items: CartItem[];
  shipping: ShippingDetails;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({
      // price/title are intentionally dropped — the backend re-derives them
      // from the real product record rather than trusting the client.
      items: input.items.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      shipping: input.shipping,
    }),
  });
}

/** `userId` stays in the signature for the caller's queryKey/enabled gate —
 * the backend derives the actual caller from the access token, not this. */
export async function fetchMyOrders(userId: string | undefined): Promise<Order[]> {
  void userId;
  return apiFetch<Order[]>("/orders/my");
}
