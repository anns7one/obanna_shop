"use client";

import { useMemo, useState } from "react";
import { categories } from "@/lib/data/categories";
import type { CategorySlug, Product } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/ui/SortSelect";
import { Button } from "@/components/ui/Button";
import { BlurText } from "@/components/motion/BlurText";
import { formatPrice, cn } from "@/lib/utils";

type SaleSort = "discount" | "price-asc" | "price-desc";

const sortLabels: Record<SaleSort, string> = {
  discount: "Biggest discount",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

function discountPercent(product: Product) {
  return Math.round((1 - product.price / product.compareAtPrice!) * 100);
}

export function SaleView() {
  const { data: allProducts, isLoading, isError, error, refetch } = useProducts({});

  const saleProducts = useMemo(
    () => (allProducts ?? []).filter((p) => p.compareAtPrice && p.compareAtPrice > p.price),
    [allProducts],
  );

  const maxDiscount = saleProducts.length > 0 ? Math.max(...saleProducts.map(discountPercent)) : 0;
  const highestPrice = saleProducts.length > 0 ? Math.max(...saleProducts.map((p) => p.price)) : 0;

  const availableSizes = useMemo(
    () => Array.from(new Set(saleProducts.flatMap((p) => p.sizes))).sort(),
    [saleProducts],
  );
  const availableColors = useMemo(
    () => Array.from(new Set(saleProducts.flatMap((p) => p.colors))).sort(),
    [saleProducts],
  );

  const [selectedCategories, setSelectedCategories] = useState<Set<CategorySlug>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<SaleSort>("discount");

  const priceCeiling = maxPrice ?? highestPrice;

  function toggle<T>(set: Set<T>, value: T, setter: (next: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  const filtered = saleProducts.filter((p) => {
    if (selectedCategories.size > 0 && !selectedCategories.has(p.category)) return false;
    if (selectedSizes.size > 0 && !p.sizes.some((s) => selectedSizes.has(s))) return false;
    if (selectedColors.size > 0 && !p.colors.some((c) => selectedColors.has(c))) return false;
    if (p.price > priceCeiling) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return discountPercent(b) - discountPercent(a);
  });

  const hasActiveFilters =
    selectedCategories.size > 0 || selectedSizes.size > 0 || selectedColors.size > 0 || maxPrice !== null;

  function clearFilters() {
    setSelectedCategories(new Set());
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
    setMaxPrice(null);
  }

  return (
    <div className="sale-page">
      <div className="sale-hero">
        <h1 className="sale-hero-title">
          <BlurText text="Designer Sale" />
        </h1>
        <div className="sale-hero-banner">
          <p className="sale-hero-sub">
            {saleProducts.length > 0 ? `Up to ${maxDiscount}% off` : "Nothing marked down right now"}
          </p>
          <p className="sale-hero-note">All sale pieces are final sale — no returns or exchanges.</p>
        </div>
      </div>

      {isError && (
        <div className="data-error" role="alert">
          <p>{error instanceof Error ? error.message : "We couldn't load the sale."}</p>
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

      {!isLoading && !isError && (
        <div className="sale-layout">
          <aside className="sale-sidebar">
            <div className="sale-filter-group">
              <h3 className="sale-filter-title">Category</h3>
              {categories.map((c) => (
                <label key={c.slug} className="sale-filter-option">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(c.slug)}
                    onChange={() => toggle(selectedCategories, c.slug, setSelectedCategories)}
                  />
                  {c.name}
                </label>
              ))}
            </div>

            {availableSizes.length > 0 && (
              <div className="sale-filter-group">
                <h3 className="sale-filter-title">Size</h3>
                {availableSizes.map((size) => (
                  <label key={size} className="sale-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedSizes.has(size)}
                      onChange={() => toggle(selectedSizes, size, setSelectedSizes)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            )}

            {availableColors.length > 0 && (
              <div className="sale-filter-group">
                <h3 className="sale-filter-title">Color</h3>
                {availableColors.map((color) => (
                  <label key={color} className="sale-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedColors.has(color)}
                      onChange={() => toggle(selectedColors, color, setSelectedColors)}
                    />
                    {color}
                  </label>
                ))}
              </div>
            )}

            {highestPrice > 0 && (
              <div className="sale-filter-group">
                <h3 className="sale-filter-title">Price</h3>
                <input
                  type="range"
                  min={0}
                  max={highestPrice}
                  step={1}
                  value={priceCeiling}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="sale-price-range"
                  aria-label="Maximum price"
                />
                <p className="sale-price-value">Under {formatPrice(priceCeiling)}</p>
              </div>
            )}

            {hasActiveFilters && (
              <button type="button" className="catalog-clear" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </aside>

          <div className="sale-main">
            <div className="sale-toolbar">
              <span className="catalog-count">
                {sorted.length} piece{sorted.length === 1 ? "" : "s"} on sale
              </span>
              <SortSelect
                value={sort}
                options={Object.entries(sortLabels).map(([value, label]) => ({
                  value: value as SaleSort,
                  label,
                }))}
                onChange={setSort}
              />
            </div>

            <ProductGrid products={sorted} showDiscount />
          </div>
        </div>
      )}
    </div>
  );
}
