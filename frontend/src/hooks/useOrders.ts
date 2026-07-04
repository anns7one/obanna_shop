import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "@/lib/api/orders";

export function useMyOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => fetchMyOrders(userId as string),
    enabled: Boolean(userId),
  });
}
