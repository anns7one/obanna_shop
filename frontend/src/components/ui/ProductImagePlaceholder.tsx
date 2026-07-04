import type { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/utils";

const tagClass: Record<CategorySlug, string> = {
  women: "placeholder-tag-women",
  men: "placeholder-tag-men",
  accessories: "placeholder-tag-accessories",
};

/**
 * Stage-1 stand-in for product photography. There is no media pipeline or
 * CDN yet, so real images will arrive with the backend — this keeps the
 * grid visually intentional in the meantime instead of showing broken <img>s.
 */
export function ProductImagePlaceholder({
  title,
  category,
  compact = false,
  className,
}: {
  title: string;
  category: CategorySlug;
  /** Use for small thumbnails (e.g. cart rows) where the category pill and full title don't fit. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("placeholder", `placeholder-${category}`, compact && "placeholder-compact", className)}>
      {!compact && <div className={cn("placeholder-tag", tagClass[category])}>{category}</div>}
      <span className="placeholder-title">{title}</span>
    </div>
  );
}
