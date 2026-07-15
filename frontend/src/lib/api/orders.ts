import { apiFetch } from "@/lib/api/client";
import type { CartItem, Order, ShippingDetails } from "@/lib/types";

export interface CreateOrderInput {
  items: CartItem[];
  shipping: ShippingDetails;
  contactFullName: string;
  contactPhone: string;
  contactEmail?: string;
  orderComment?: string;
  /** Omitted (undefined) means "Cash on delivery" — no saved card chosen. */
  paymentMethodId?: string;
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
      contactFullName: input.contactFullName,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail || undefined,
      orderComment: input.orderComment || undefined,
      paymentMethodId: input.paymentMethodId,
    }),
  });
}

/** `userId` stays in the signature for the caller's queryKey/enabled gate —
 * the backend derives the actual caller from the access token, not this. */
export async function fetchMyOrders(userId: string | undefined): Promise<Order[]> {
  void userId;
  return apiFetch<Order[]>("/orders/my");
}

export async function cancelOrder(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/cancel`, { method: "PATCH" });
}

export async function fetchOrder(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`);
}

/** Omitting paymentMethodId switches the order to "Cash on delivery". */
export async function changeOrderPaymentMethod(orderId: string, paymentMethodId?: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/payment-method`, {
    method: "PATCH",
    body: JSON.stringify({ paymentMethodId }),
  });
}
