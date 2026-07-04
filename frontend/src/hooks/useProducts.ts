import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type ProductQuery } from "@/lib/api/products";

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: () => fetchProducts(query),
  });
}
