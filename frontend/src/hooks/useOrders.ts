import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, fetchMyOrders } from "@/lib/api/orders";

export function useMyOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => fetchMyOrders(userId as string),
    enabled: Boolean(userId),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}
