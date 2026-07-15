import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/api/products";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { PriceTag } from "@/components/ui/PriceTag";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductStockNotice } from "@/components/product/ProductStockNotice";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategory } from "@/lib/data/categories";
import { RevealSection } from "@/components/motion/RevealSection";

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
    <div className="product-page">
      <nav className="product-page-crumbs">
        <Link href="/catalog" className="product-page-crumbs-link">
          Shop
        </Link>
        {" / "}
        <Link href={`/catalog?category=${product.category}`} className="product-page-crumbs-link">
          {category?.name}
        </Link>
        {" / "}
        <span className="product-page-current">{product.title}</span>
      </nav>

      <div className="product-page-layout fade-in fade-in-1">
        <div className="product-page-frame">
          <ProductImagePlaceholder title={product.title} category={product.category} className="product-page-image" />
        </div>

        <div className="product-page-details">
          <div>
            <h1 className="product-page-name">{product.title}</h1>
            <div className="product-page-price">
              <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
            </div>
          </div>

          <p className="product-page-desc">{product.description}</p>

          <ProductActions product={product} />

          <ProductStockNotice stock={product.stock} />
        </div>
      </div>

      {related.length > 0 && (
        <RevealSection className="product-page-related">
          <h2 className="product-page-related-title">You may also like</h2>
          <div className="product-page-related-grid">
            <ProductGrid products={related} />
          </div>
        </RevealSection>
      )}
    </div>
  );
}
