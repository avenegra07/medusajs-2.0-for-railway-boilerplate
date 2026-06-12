import { sdk } from "@/lib/medusa-sdk";
import type {
  BookingResourceListItem,
  GetBookingResourceResponse,
} from "@/lib/types/booking-resource";

/**
 * List all booking resources (catalog). GET /store/booking-resources
 */
export async function listBookingResources(): Promise<BookingResourceListItem[]> {
  const res = await sdk.client.fetch<BookingResourceListItem[]>(
    "/store/booking-resources?currency_code=usd",
    { method: "GET" }
  );
  return Array.isArray(res) ? res : [];
}

/**
 * Get a single booking resource with product by id. GET /store/booking-resources/{id}
 * NOTE: This endpoint still uses region-based pricing when regionId is provided.
 * @param id - booking resource id
 * @param regionId - optional region for pricing
 */
export async function getBookingResource(
  id: string,
  regionId?: string
): Promise<GetBookingResourceResponse | null> {
  const params = regionId ? `?region_id=${encodeURIComponent(regionId)}` : "";
  try {
    const res = await sdk.client.fetch<GetBookingResourceResponse>(
      `/store/booking-resources/${encodeURIComponent(id)}${params}`,
      { method: "GET" }
    );
    return res ?? null;
  } catch {
    return null;
  }
}

/**
 * Get a single booking resource by product handle. GET /store/booking-resources?handle={handle}&currency_code=usd
 * @param handle - product handle
 */
export async function getBookingResourceByHandle(
  handle: string,
): Promise<GetBookingResourceResponse | null> {
  const search = new URLSearchParams({
    handle,
    currency_code: "usd",
  });

  try {
    const res = await sdk.client.fetch<BookingResourceListItem[]>(
      `/store/booking-resources?${search.toString()}`,
      { method: "GET" },
    );

    const first = Array.isArray(res) ? res[0] : undefined;
    if (!first) {
      return null;
    }

    return {
      bookingResource: first.booking_resource,
      product: first.product,
    };
  } catch {
    return null;
  }
}
