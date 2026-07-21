import type { Metadata } from "next";
import { SaleView } from "@/components/sale/SaleView";

export const metadata: Metadata = {
  title: "Sale — OBA Atelier",
};

export default function SalePage() {
  return <SaleView />;
}
