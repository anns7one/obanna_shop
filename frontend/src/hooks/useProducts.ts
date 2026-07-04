import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug, fetchProducts, fetchRelatedProducts, type ProductQuery } from "@/lib/api/products";
import type { Product } from "@/lib/types";

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: () => fetchProducts(query),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
}

export function useRelatedProducts(product: Product | null | undefined) {
  return useQuery({
    queryKey: ["related-products", product?.id],
    queryFn: () => fetchRelatedProducts(product as Product),
    enabled: Boolean(product),
  });
}
