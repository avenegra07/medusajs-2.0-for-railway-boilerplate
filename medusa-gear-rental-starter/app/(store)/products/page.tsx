import { listBookingResources } from "@/lib/data/booking-resources";
import type { BookingResourceListItem } from "@/lib/types/booking-resource";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  let items: BookingResourceListItem[] = [];
  let error: string | null = null;

  try {
    items = await listBookingResources();
  } catch {
    error = "Unable to load catalog. Please check that the Medusa backend is running.";
  }

  return <ProductsClient items={items} error={error} />;
}
