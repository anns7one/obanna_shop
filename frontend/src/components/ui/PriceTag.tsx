"use client";

import { Info } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useHasMounted } from "@/hooks/useHasMounted";

export function PriceTag({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
}) {
  const mounted = useHasMounted();
  const user = useAuthStore((s) => s.user);
  const isGuest = mounted && !user;

  return (
    <div className="price-tag">
      <span className={cn("price-tag-value", `price-tag-${size}`)}>{formatPrice(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="price-tag-compare">{formatPrice(compareAtPrice)}</span>
      )}
      {isGuest && (
        <span className="price-tag-guest-hint" title="Sign in to see your price">
          <Info size={13} aria-hidden />
          <span className="sr-only">Sign in to see your price</span>
        </span>
      )}
    </div>
  );
}
