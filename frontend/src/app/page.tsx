import { fetchProducts } from "@/lib/api/products";
import { categories } from "@/lib/data/categories";
import { CategoryTile } from "@/components/home/CategoryTile";
import { ProductGrid } from "@/components/product/ProductGrid";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default async function HomePage() {
  const newArrivals = (await fetchProducts({ sort: "newest" })).slice(0, 4);

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <span className={styles.badge}>New season</span>
          <h1 className={styles.title}>Soft-spoken essentials for everyday wear</h1>
          <p className={styles.subtitle}>
            A quiet, considered showroom of women&apos;s, men&apos;s and accessory pieces — made to feel
            like the calmest part of your day.
          </p>
          <Button href="/catalog" size="lg">
            Shop the collection
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Shop by category</h2>
        <div className={styles.grid}>
          {categories.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.head}>
          <h2 className={styles.heading}>New arrivals</h2>
          <Button href="/catalog?sort=newest" variant="ghost" size="sm">
            View all
          </Button>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      <section className={styles.section}>
        <div className={styles.newsletter}>
          <h2 className={styles.heading}>Stay in the loop</h2>
          <p className={styles.copy}>Occasional notes on new arrivals and restocks — nothing more.</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
