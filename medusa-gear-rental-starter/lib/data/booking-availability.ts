"use server";

import { sdk } from "@/lib/medusa-sdk";
import type { GetBookingResourceAvailabilityResponse } from "@/lib/types/booking-availability";

type View = "month" | "week" | "day";

/**
 * Get availability for a booking resource. GET /store/booking-resources/{id}/availability
 * Uses query params: from, to, view (not startDate/endDate).
 * Safe to call from server or as a server action from client.
 */
export async function getBookingResourceAvailability(
  resourceId: string,
  from: Date,
  to: Date,
  view: View = "month"
): Promise<GetBookingResourceAvailabilityResponse | null> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    view,
  });
  try {
    const res = await sdk.client.fetch<GetBookingResourceAvailabilityResponse>(
      `/store/booking-resources/${encodeURIComponent(resourceId)}/availability?${params}`,
      { method: "GET" }
    );
    return res ?? null;
  } catch {
    return null;
  }
}
