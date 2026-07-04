import { cn, formatPrice } from "@/lib/utils";

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
    <div className="price-tag">
      <span className={cn("price-tag-value", `price-tag-${size}`)}>{formatPrice(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="price-tag-compare">{formatPrice(compareAtPrice)}</span>
      )}
    </div>
  );
}
