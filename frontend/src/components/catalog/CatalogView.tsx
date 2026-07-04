"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { categories, getCategory } from "@/lib/data/categories";
import type { CategorySlug, SortOption } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/ui/SortSelect";
import { cn } from "@/lib/utils";
import styles from "./CatalogView.module.css";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

const toneClass: Record<CategorySlug, string> = {
  women: styles.women,
  men: styles.men,
  accessories: styles.accessories,
};

export function CatalogView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") as CategorySlug | null;
  const sortParam = (searchParams.get("sort") as SortOption | null) ?? "newest";
  const q = searchParams.get("q") ?? "";

  const activeCategory = categoryParam && getCategory(categoryParam) ? categoryParam : undefined;

  const { data: products, isLoading } = useProducts({
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
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1 className={styles.title}>{categoryInfo ? categoryInfo.name : "All pieces"}</h1>
        <p className={styles.desc}>
          {categoryInfo ? categoryInfo.description : "Everything from the current collection, in one place."}
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.row}>
          <button
            type="button"
            onClick={() => updateParams({ category: undefined })}
            className={cn(styles.pill, !activeCategory && styles.selected)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => updateParams({ category: c.slug })}
              className={cn(styles.pill, toneClass[c.slug], activeCategory === c.slug && styles.selected)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className={styles.sort}>
          {!isLoading && (
            <span className={styles.count}>
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
        <div className={styles.filters}>
          <span className={styles.label}>Filtering by:</span>

          {categoryInfo && (
            <button
              type="button"
              onClick={() => updateParams({ category: undefined })}
              className={cn(styles.chip, toneClass[categoryInfo.slug])}
            >
              {categoryInfo.name}
              <X size={12} aria-hidden />
            </button>
          )}

          {q && (
            <button type="button" onClick={() => updateParams({ q: undefined })} className={styles.chip}>
              &ldquo;{q}&rdquo;
              <X size={12} aria-hidden />
            </button>
          )}

          {categoryInfo && q && (
            <button
              type="button"
              onClick={() => updateParams({ category: undefined, q: undefined })}
              className={styles.clear}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.loadingCard}>
              <div className={styles.loadingImg} />
              <div className={styles.loadingLine} />
              <div className={cn(styles.loadingLine, styles.short)} />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products ?? []} />
      )}
    </div>
  );
}
