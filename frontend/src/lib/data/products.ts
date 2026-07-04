import type { Product } from "@/lib/types";

const SIZES_APPAREL = ["XS", "S", "M", "L", "XL"];
const SIZES_ONE = ["One Size"];

export const products: Product[] = [
  // ---------- Women ----------
  {
    id: "w-01",
    slug: "cloud-linen-wrap-dress",
    title: "Cloud Linen Wrap Dress",
    description:
      "A weightless linen-blend wrap dress cut for movement, finished with a self-tie waist and soft rounded neckline.",
    price: 128,
    compareAtPrice: 158,
    category: "women",
    colors: ["Blush", "Butter", "Ivory"],
    sizes: SIZES_APPAREL,
    stock: 14,
    isNew: true,
    createdAt: "2026-06-20",
  },
  {
    id: "w-02",
    slug: "petal-satin-slip",
    title: "Petal Satin Slip Dress",
    description:
      "Bias-cut satin slip with adjustable straps — dresses up or down without trying too hard.",
    price: 96,
    category: "women",
    colors: ["Blush", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 20,
    isNew: false,
    createdAt: "2026-04-02",
  },
  {
    id: "w-03",
    slug: "soft-knit-cardigan",
    title: "Soft Knit Cardigan",
    description:
      "An oversized cardigan in brushed cotton-knit, with mother-of-pearl buttons and dropped shoulders.",
    price: 112,
    category: "women",
    colors: ["Butter", "Ivory", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 18,
    isNew: false,
    createdAt: "2026-03-11",
  },
  {
    id: "w-04",
    slug: "quiet-hour-blouse",
    title: "Quiet Hour Blouse",
    description:
      "A relaxed poplin blouse with a soft tie neck and gently gathered sleeves.",
    price: 84,
    category: "women",
    colors: ["Ivory", "Blush"],
    sizes: SIZES_APPAREL,
    stock: 25,
    isNew: true,
    createdAt: "2026-06-01",
  },
  {
    id: "w-05",
    slug: "morning-pleat-skirt",
    title: "Morning Pleat Midi Skirt",
    description:
      "A fluid pleated midi skirt that moves with every step, finished with a hidden elastic waist.",
    price: 88,
    category: "women",
    colors: ["Sky", "Blush"],
    sizes: SIZES_APPAREL,
    stock: 16,
    isNew: false,
    createdAt: "2026-02-14",
  },
  {
    id: "w-06",
    slug: "featherweight-trench",
    title: "Featherweight Trench",
    description:
      "A lightweight trench in a soft cotton blend, cut long and belted at the waist.",
    price: 198,
    compareAtPrice: 240,
    category: "women",
    colors: ["Ivory", "Butter"],
    sizes: SIZES_APPAREL,
    stock: 9,
    isNew: false,
    createdAt: "2026-01-22",
  },
  {
    id: "w-07",
    slug: "soft-tailored-trousers",
    title: "Soft Tailored Trousers",
    description:
      "Wide-leg trousers in a brushed twill with a high, comfortable waistband.",
    price: 102,
    category: "women",
    colors: ["Ivory", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 22,
    isNew: false,
    createdAt: "2026-03-28",
  },
  {
    id: "w-08",
    slug: "sunday-rib-set",
    title: "Sunday Rib Knit Set",
    description:
      "A matching ribbed top and shorts set in soft stretch cotton — made for slow mornings.",
    price: 76,
    category: "women",
    colors: ["Blush", "Butter"],
    sizes: SIZES_APPAREL,
    stock: 30,
    isNew: true,
    createdAt: "2026-06-15",
  },

  // ---------- Men ----------
  {
    id: "m-01",
    slug: "washed-cotton-overshirt",
    title: "Washed Cotton Overshirt",
    description:
      "A garment-dyed overshirt in heavyweight cotton, built to layer through every season.",
    price: 118,
    category: "men",
    colors: ["Ivory", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 17,
    isNew: true,
    createdAt: "2026-05-18",
  },
  {
    id: "m-02",
    slug: "relaxed-linen-shirt",
    title: "Relaxed Linen Shirt",
    description:
      "An easy-fit linen shirt with a soft collar, made to be worn open over a tee.",
    price: 92,
    category: "men",
    colors: ["Ivory", "Butter"],
    sizes: SIZES_APPAREL,
    stock: 21,
    isNew: false,
    createdAt: "2026-03-05",
  },
  {
    id: "m-03",
    slug: "quiet-crewneck-sweater",
    title: "Quiet Crewneck Sweater",
    description:
      "A midweight crewneck in a cotton-wool blend, soft against the skin with a ribbed hem.",
    price: 104,
    category: "men",
    colors: ["Sky", "Ivory"],
    sizes: SIZES_APPAREL,
    stock: 19,
    isNew: false,
    createdAt: "2026-02-08",
  },
  {
    id: "m-04",
    slug: "everyday-tapered-trousers",
    title: "Everyday Tapered Trousers",
    description:
      "A tapered trouser in brushed twill with a soft elastic waistband for all-day comfort.",
    price: 98,
    category: "men",
    colors: ["Ivory", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 24,
    isNew: false,
    createdAt: "2026-04-19",
  },
  {
    id: "m-05",
    slug: "soft-cotton-tee-pack",
    title: "Soft Cotton Tee — Pack of 2",
    description:
      "Two heavyweight cotton tees with a slightly boxy fit and clean, tagless finish.",
    price: 58,
    category: "men",
    colors: ["Ivory", "Butter"],
    sizes: SIZES_APPAREL,
    stock: 40,
    isNew: true,
    createdAt: "2026-06-10",
  },
  {
    id: "m-06",
    slug: "harbor-wool-coat",
    title: "Harbor Wool Coat",
    description:
      "A soft wool-blend coat with a clean silhouette and horn-effect buttons.",
    price: 228,
    compareAtPrice: 270,
    category: "men",
    colors: ["Ivory", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 8,
    isNew: false,
    createdAt: "2026-01-12",
  },
  {
    id: "m-07",
    slug: "weekend-drawstring-shorts",
    title: "Weekend Drawstring Shorts",
    description:
      "Lightweight twill shorts with a drawstring waist and deep side pockets.",
    price: 62,
    category: "men",
    colors: ["Butter", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 28,
    isNew: false,
    createdAt: "2026-05-02",
  },
  {
    id: "m-08",
    slug: "soft-shell-jacket",
    title: "Soft Shell Jacket",
    description:
      "A lightly padded shell jacket with a soft brushed lining and stand collar.",
    price: 168,
    category: "men",
    colors: ["Ivory", "Sky"],
    sizes: SIZES_APPAREL,
    stock: 12,
    isNew: true,
    createdAt: "2026-06-25",
  },

  // ---------- Accessories ----------
  {
    id: "a-01",
    slug: "woven-straw-tote",
    title: "Woven Straw Tote",
    description:
      "A hand-woven straw tote lined in soft cotton, with leather-effect handles.",
    price: 68,
    category: "accessories",
    colors: ["Butter", "Ivory"],
    sizes: SIZES_ONE,
    stock: 26,
    isNew: false,
    createdAt: "2026-03-30",
  },
  {
    id: "a-02",
    slug: "silk-hair-scarf",
    title: "Silk Hair Scarf",
    description:
      "A small silk-blend scarf for hair, bag straps, or a soft neck tie.",
    price: 28,
    category: "accessories",
    colors: ["Blush", "Sky", "Butter"],
    sizes: SIZES_ONE,
    stock: 50,
    isNew: true,
    createdAt: "2026-06-05",
  },
  {
    id: "a-03",
    slug: "pearl-drop-earrings",
    title: "Pearl Drop Earrings",
    description:
      "Freshwater pearl drops on a delicate gold-plated hook.",
    price: 42,
    category: "accessories",
    colors: ["Ivory"],
    sizes: SIZES_ONE,
    stock: 35,
    isNew: false,
    createdAt: "2026-02-20",
  },
  {
    id: "a-04",
    slug: "soft-leather-belt",
    title: "Soft Leather Belt",
    description:
      "A slim leather belt with a brushed matte buckle, cut to sit softly at the waist.",
    price: 54,
    category: "accessories",
    colors: ["Ivory", "Blush"],
    sizes: ["S/M", "M/L"],
    stock: 22,
    isNew: false,
    createdAt: "2026-01-28",
  },
  {
    id: "a-05",
    slug: "cloud-canvas-crossbody",
    title: "Cloud Canvas Crossbody",
    description:
      "A soft-structured crossbody bag in brushed canvas with an adjustable strap.",
    price: 74,
    category: "accessories",
    colors: ["Sky", "Blush", "Butter"],
    sizes: SIZES_ONE,
    stock: 19,
    isNew: true,
    createdAt: "2026-05-30",
  },
  {
    id: "a-06",
    slug: "quilted-hair-clips-set",
    title: "Quilted Hair Clips — Set of 3",
    description:
      "Three padded hair clips in mixed pastel tones, gentle enough for fine hair.",
    price: 22,
    category: "accessories",
    colors: ["Blush", "Butter", "Sky"],
    sizes: SIZES_ONE,
    stock: 60,
    isNew: false,
    createdAt: "2026-04-11",
  },
  {
    id: "a-07",
    slug: "soft-wool-scarf",
    title: "Soft Wool Scarf",
    description:
      "An oversized scarf in brushed wool-blend, soft enough for everyday wrapping.",
    price: 58,
    category: "accessories",
    colors: ["Ivory", "Sky"],
    sizes: SIZES_ONE,
    stock: 24,
    isNew: false,
    createdAt: "2026-02-02",
  },
  {
    id: "a-08",
    slug: "porcelain-signet-ring",
    title: "Porcelain Signet Ring",
    description:
      "A hand-painted porcelain-effect signet ring on a fine gold-plated band.",
    price: 36,
    category: "accessories",
    colors: ["Blush", "Ivory"],
    sizes: ["6", "7", "8"],
    stock: 30,
    isNew: true,
    createdAt: "2026-06-28",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
