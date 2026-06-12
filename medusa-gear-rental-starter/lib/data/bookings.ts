"use server";

import { sdk } from "@/lib/medusa-sdk";
import { getAuthHeaders } from "@/lib/data/cookies";

export type BookingResourceSummary = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
};

export type BookingResourceAllocationSummary = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  booking_resource?: BookingResourceSummary | null;
};

export type BookingLineItemSummary = {
  id: string;
  start_time: string;
  end_time: string;
  booking_resource_allocation?: BookingResourceAllocationSummary | null;
  price?: {
    currency_code?: string | null;
    unit?: "second" | "minute" | "hour" | "day" | "custom" | null;
    unit_value?: number | null;
    units_booked?: number | null;
    unit_price?: number | null;
    total?: number | null;
  } | null;
};

export type BookingWithOrder = {
  id: string;
  booking_number?: string | null;
  order_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
  order?: {
    id: string;
    display_id?: string | number;
    currency_code?: string;
    total?: number;
  } | null;
  booking_line_items?: BookingLineItemSummary[];
};

export type ListBookingsResponse = {
  bookings: BookingWithOrder[];
  count: number;
  offset: number;
  limit: number;
};

export async function listCustomerBookings(): Promise<ListBookingsResponse> {
  const headers = await getAuthHeaders();

  if (!("authorization" in headers)) {
    return {
      bookings: [],
      count: 0,
      offset: 0,
      limit: 0,
    };
  }

  try {
    const res = await sdk.client.fetch<ListBookingsResponse>("/store/bookings", {
      method: "GET",
      headers,
    });

    return res ?? { bookings: [], count: 0, offset: 0, limit: 0 };
  } catch {
    return { bookings: [], count: 0, offset: 0, limit: 0 };
  }
}

