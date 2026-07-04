import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import styles from "./CategoryTile.module.css";

const gradientClass: Record<Category["slug"], string> = {
  women: styles.women,
  men: styles.men,
  accessories: styles.accessories,
};

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/catalog?category=${category.slug}`} className={cn(styles.tile, gradientClass[category.slug])}>
      <div className={styles.overlay} />
      <span className={styles.name}>{category.name}</span>
      <span className={styles.desc}>{category.description}</span>
      <span className={styles.cta}>Shop {category.name}</span>
    </Link>
  );
}
