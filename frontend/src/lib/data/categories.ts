import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "women",
    name: "Women",
    description: "Fluid silhouettes and soft textures for everyday wear.",
  },
  {
    slug: "men",
    name: "Men",
    description: "Relaxed tailoring in a quiet, considered palette.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "The small details that finish a look.",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
