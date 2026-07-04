import { cn, formatPrice } from "@/lib/utils";
import styles from "./PriceTag.module.css";

export function PriceTag({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={styles.container}>
      <span className={cn(styles.value, styles[size])}>{formatPrice(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className={styles.compare}>{formatPrice(compareAtPrice)}</span>
      )}
    </div>
  );
}
