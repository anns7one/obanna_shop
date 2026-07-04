"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { categories, getCategory } from "@/lib/data/categories";
import type { CategorySlug, SortOption } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/ui/SortSelect";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

const toneClass: Record<CategorySlug, string> = {
  women: "catalog-pill-women",
  men: "catalog-pill-men",
  accessories: "catalog-pill-accessories",
};

const chipToneClass: Record<CategorySlug, string> = {
  women: "catalog-chip-women",
  men: "catalog-chip-men",
  accessories: "catalog-chip-accessories",
};

export function CatalogView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") as CategorySlug | null;
  const sortParam = (searchParams.get("sort") as SortOption | null) ?? "newest";
  const q = searchParams.get("q") ?? "";

  const activeCategory = categoryParam && getCategory(categoryParam) ? categoryParam : undefined;

  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts({
    category: activeCategory,
    sort: sortParam,
    q,
  });

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/catalog${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const categoryInfo = activeCategory ? getCategory(activeCategory) : undefined;
  const hasActiveFilters = Boolean(activeCategory || q);

  return (
    <div className="catalog">
      <div className="catalog-heading">
        <h1 className="catalog-title">{categoryInfo ? categoryInfo.name : "All pieces"}</h1>
        <p className="catalog-desc">
          {categoryInfo ? categoryInfo.description : "Everything from the current collection, in one place."}
        </p>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-row">
          <button
            type="button"
            onClick={() => updateParams({ category: undefined })}
            aria-pressed={!activeCategory}
            className={cn("catalog-pill", !activeCategory && "catalog-pill-selected")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => updateParams({ category: c.slug })}
              aria-pressed={activeCategory === c.slug}
              className={cn("catalog-pill", toneClass[c.slug], activeCategory === c.slug && "catalog-pill-selected")}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="catalog-sort">
          {!isLoading && (
            <span className="catalog-count">
              {products?.length ?? 0} piece{products?.length === 1 ? "" : "s"}
            </span>
          )}

          <SortSelect
            value={sortParam}
            options={Object.entries(sortLabels).map(([value, label]) => ({
              value: value as SortOption,
              label,
            }))}
            onChange={(next) => updateParams({ sort: next })}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="catalog-filters">
          <span className="catalog-label">Filtering by:</span>

          {categoryInfo && (
            <button
              type="button"
              onClick={() => updateParams({ category: undefined })}
              className={cn("catalog-chip", chipToneClass[categoryInfo.slug])}
            >
              {categoryInfo.name}
              <X size={12} aria-hidden />
            </button>
          )}

          {q && (
            <button type="button" onClick={() => updateParams({ q: undefined })} className="catalog-chip">
              &ldquo;{q}&rdquo;
              <X size={12} aria-hidden />
            </button>
          )}

          {categoryInfo && q && (
            <button
              type="button"
              onClick={() => updateParams({ category: undefined, q: undefined })}
              className="catalog-clear"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {isError && (
        <div className="data-error" role="alert">
          <p>{error instanceof Error ? error.message : "We couldn't load these pieces."}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="catalog-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="catalog-loading-card">
              <div className="catalog-loading-img" />
              <div className="catalog-loading-line" />
              <div className={cn("catalog-loading-line", "catalog-loading-line-short")} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && <ProductGrid products={products ?? []} />}
    </div>
  );
}
