import type { Metadata } from "next";
import { OrderLedger } from "@/components/admin/OrderLedger";

export const metadata: Metadata = { title: "Užsakymų knyga" };

export default function OrdersPage() {
  return <OrderLedger />;
}
