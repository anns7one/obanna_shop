import { getRelatedProducts, products } from "@/lib/data/products";
import type { CategorySlug, Product, SortOption } from "@/lib/types";
import { delay } from "@/lib/utils";

export interface ProductQuery {
  category?: CategorySlug;
  q?: string;
  sort?: SortOption;
}

/**
 * Stage-1 mock of `GET /products`. Reads from static seed data instead of
 * the network. Keep the signature stable so the real fetch() call can drop
 * in later without touching callers.
 */
export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  await delay(200);

  let result = [...products];

  if (query.category) {
    result = result.filter((p) => p.category === query.category);
  }

  if (query.q && query.q.trim().length > 0) {
    const term = query.q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term),
    );
  }

  switch (query.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
    default:
      result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      break;
  }

  return result;
}

/** Stage-1 mock of `GET /products/:slug`. */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  await delay(150);
  return products.find((p) => p.slug === slug) ?? null;
}

/** Stage-1 mock of a "related products" lookup. */
export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  await delay(150);
  return getRelatedProducts(product, limit);
}
