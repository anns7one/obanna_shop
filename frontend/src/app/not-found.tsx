import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found — OBA Atelier",
};

export default function NotFound() {
  return (
    <div className="page-empty fade-in">
      <h1 className="page-empty-title">Page not found</h1>
      <p className="page-empty-hint">
        The page you&apos;re looking for doesn&apos;t exist — it may have been moved or the link may be
        incorrect.
      </p>
      <div className="page-empty-actions">
        <Button href="/catalog" size="lg">
          Go to catalog
        </Button>
        <Button href="/" variant="secondary" size="lg">
          Go home
        </Button>
      </div>
    </div>
  );
}
