import { fetchProducts } from "@/lib/api/products";
import { categories } from "@/lib/data/categories";
import { CategoryTile } from "@/components/home/CategoryTile";
import { ProductGrid } from "@/components/product/ProductGrid";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { HeroBackground } from "@/components/home/HeroBackground";
import { ApproachSection } from "@/components/home/ApproachSection";
import { BlurText } from "@/components/motion/BlurText";
import { RevealSection } from "@/components/motion/RevealSection";
import { ArrowLink } from "@/components/ui/ArrowLink";

export default async function HomePage() {
  const newArrivals = (await fetchProducts({ sort: "newest" })).slice(0, 4);

  return (
    <div>
      <section className="home-hero">
        <HeroBackground />
        <div className="home-inner">
          <span className="home-badge liquid-glass home-fade-in home-fade-in-1">New season</span>
          <h1 className="home-title">
            <BlurText text="Soft-spoken essentials for everyday wear" />
          </h1>
          <p className="home-subtitle home-fade-in home-fade-in-3">
            A quiet, considered showroom of women&apos;s, men&apos;s and accessory pieces — made to feel
            like the calmest part of your day.
          </p>
          <span className="home-fade-in home-fade-in-4">
            <ArrowLink href="/catalog">Shop the collection</ArrowLink>
          </span>
        </div>
      </section>

      <ApproachSection />

      <RevealSection className="home-section">
        <h2 className="home-heading">Shop by category</h2>
        <div className="home-grid">
          {categories.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </RevealSection>

      <RevealSection className="home-section">
        <div className="home-head">
          <h2 className="home-heading">New arrivals</h2>
          <ArrowLink href="/catalog?sort=newest">View all</ArrowLink>
        </div>
        <ProductGrid products={newArrivals} />
      </RevealSection>

      <RevealSection className="home-section">
        <div className="home-newsletter">
          <h2 className="home-heading">Stay in the loop</h2>
          <p className="home-copy">Occasional notes on new arrivals and restocks — nothing more.</p>
          <NewsletterForm />
        </div>
      </RevealSection>
    </div>
  );
}
