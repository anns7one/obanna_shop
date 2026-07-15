import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, changeOrderPaymentMethod, fetchMyOrders, fetchOrder } from "@/lib/api/orders";
import { fetchProducts } from "@/lib/api/products";
import { useCartStore } from "@/store/cartStore";
import type { Order } from "@/lib/types";

export function useMyOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => fetchMyOrders(userId as string),
    enabled: Boolean(userId),
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

export function useChangeOrderPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, paymentMethodId }: { orderId: string; paymentMethodId?: string }) =>
      changeOrderPaymentMethod(orderId, paymentMethodId),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/** Adds every item from a past order back into the cart, using each
 * product's *current* price/slug/stock — skips anything discontinued or
 * completely out of stock, and clamps quantity to whatever's left. */
export function useRepeatOrder() {
  const addItem = useCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: async (order: Order) => {
      const products = await fetchProducts();
      const byId = new Map(products.map((p) => [p.id, p]));

      let addedCount = 0;
      let skippedCount = 0;

      for (const line of order.items) {
        const product = byId.get(line.productId);
        if (!product || product.stock <= 0) {
          skippedCount += 1;
          continue;
        }
        addItem({
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          category: product.category,
          size: line.size,
          color: line.color,
          quantity: Math.min(line.quantity, product.stock),
          stock: product.stock,
        });
        addedCount += 1;
      }

      return { addedCount, skippedCount };
    },
  });
}
