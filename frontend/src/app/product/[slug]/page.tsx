import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/api/products";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { PriceTag } from "@/components/ui/PriceTag";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategory } from "@/lib/data/categories";
import styles from "./page.module.css";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  return { title: product ? `${product.title} — Obanna` : "Product not found — Obanna" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await fetchRelatedProducts(product);
  const category = getCategory(product.category);

  return (
    <div className={styles.container}>
      <nav className={styles.crumbs}>
        <Link href="/catalog" className={styles.link}>
          Shop
        </Link>
        {" / "}
        <Link href={`/catalog?category=${product.category}`} className={styles.link}>
          {category?.name}
        </Link>
        {" / "}
        <span className={styles.current}>{product.title}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.frame}>
          <ProductImagePlaceholder title={product.title} category={product.category} className={styles.image} />
        </div>

        <div className={styles.details}>
          <div>
            <h1 className={styles.name}>{product.title}</h1>
            <div className={styles.price}>
              <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
            </div>
          </div>

          <p className={styles.desc}>{product.description}</p>

          <ProductActions product={product} />

          <p className={styles.stock}>
            {product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"} · Free returns
            within 30 days.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.title}>You may also like</h2>
          <div className={styles.grid}>
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
