import { Leaf, Package, Ruler } from "lucide-react";
import type { ComponentType } from "react";
import { RevealSection } from "@/components/motion/RevealSection";

interface ApproachCard {
  Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  title: string;
  tags: string[];
  description: string;
}

const CARDS: ApproachCard[] = [
  {
    Icon: Leaf,
    title: "Natural Fabrics",
    tags: ["Organic Cotton", "Linen Blends", "Breathable", "Low-Impact Dyes"],
    description:
      "Every piece starts with fibres we'd want against our own skin — soft, breathable, and gentle with the planet.",
  },
  {
    Icon: Ruler,
    title: "Considered Fit",
    tags: ["True to Size", "Size Guide", "Easy Returns", "Made to Move"],
    description:
      "Cut for real bodies and everyday movement, with a size guide that actually helps you choose right the first time.",
  },
  {
    Icon: Package,
    title: "Small-Batch Care",
    tags: ["Limited Runs", "Ethical Makers", "Slow Fashion", "Considered Packaging"],
    description:
      "Produced in limited runs by makers we know by name, packaged with the same care we'd want to receive.",
  },
];

export function ApproachSection() {
  return (
    <RevealSection className="approach">
      <div className="approach-inner">
        <h2 className="approach-heading">
          Quietly
          <br />
          considered
        </h2>

        <div className="approach-grid">
          {CARDS.map(({ Icon, title, tags, description }) => (
            <div key={title} className="approach-card liquid-glass">
              <div className="approach-card-top">
                <span className="approach-card-icon liquid-glass">
                  <Icon size={22} aria-hidden />
                </span>
                <div className="approach-card-tags">
                  {tags.map((tag) => (
                    <span key={tag} className="approach-card-tag liquid-glass">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="approach-card-spacer" />

              <div>
                <h3 className="approach-card-title">{title}</h3>
                <p className="approach-card-desc">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
