import type { Metadata } from "next";
import { ProductMatrix } from "@/components/admin/ProductMatrix";

export const metadata: Metadata = { title: "Produktų matrica" };

export default function ProductsPage() {
  return <ProductMatrix />;
}
