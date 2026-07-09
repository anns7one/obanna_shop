import { apiFetch, ApiError } from "@/lib/api/client";
import type { CategorySlug, Product, SortOption } from "@/lib/types";

export interface ProductQuery {
  category?: CategorySlug;
  q?: string;
  sort?: SortOption;
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q && query.q.trim()) params.set("q", query.q.trim());
  if (query.sort) params.set("sort", query.sort);

  const qs = params.toString();
  return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ""}`, { skipAuth: true });
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${encodeURIComponent(slug)}`, { skipAuth: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return apiFetch<Product[]>(
    `/products/${encodeURIComponent(product.slug)}/related?limit=${limit}`,
    { skipAuth: true },
  );
}
