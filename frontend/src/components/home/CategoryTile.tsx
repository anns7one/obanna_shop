import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const gradientClass: Record<Category["slug"], string> = {
  women: "category-tile-women",
  men: "category-tile-men",
  accessories: "category-tile-accessories",
};

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/catalog?category=${category.slug}`} className={cn("category-tile", gradientClass[category.slug])}>
      <div className="category-tile-overlay" />
      <span className="category-tile-name">{category.name}</span>
      <span className="category-tile-desc">{category.description}</span>
      <span className="category-tile-cta">Shop {category.name}</span>
    </Link>
  );
}
