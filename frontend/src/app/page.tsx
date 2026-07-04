import { fetchProducts } from "@/lib/api/products";
import { categories } from "@/lib/data/categories";
import { CategoryTile } from "@/components/home/CategoryTile";
import { ProductGrid } from "@/components/product/ProductGrid";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  const newArrivals = (await fetchProducts({ sort: "newest" })).slice(0, 4);

  return (
    <div>
      <section className="home-hero">
        <div className="home-inner">
          <span className="home-badge">New season</span>
          <h1 className="home-title">Soft-spoken essentials for everyday wear</h1>
          <p className="home-subtitle">
            A quiet, considered showroom of women&apos;s, men&apos;s and accessory pieces — made to feel
            like the calmest part of your day.
          </p>
          <Button href="/catalog" size="lg">
            Shop the collection
          </Button>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-heading">Shop by category</h2>
        <div className="home-grid">
          {categories.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-head">
          <h2 className="home-heading">New arrivals</h2>
          <Button href="/catalog?sort=newest" variant="ghost" size="sm">
            View all
          </Button>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      <section className="home-section">
        <div className="home-newsletter">
          <h2 className="home-heading">Stay in the loop</h2>
          <p className="home-copy">Occasional notes on new arrivals and restocks — nothing more.</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
