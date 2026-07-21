import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";

export const metadata: Metadata = {
  title: "Shop all — OBA Atelier",
};

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogView />
    </Suspense>
  );
}
