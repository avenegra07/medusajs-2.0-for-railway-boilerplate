"use server";

import { sdk } from "@/lib/medusa-sdk";
import { getCartId, setCartId, removeCartId, getAuthHeaders } from "@/lib/data/cookies";

export type BookingCartItem = {
  id: string;
  cart_id: string;
  cart_line_item_id: string;
  booking_resource_allocation: string;
  start_time: string;
  end_time: string;
  status: string;
};

export type BookingCart = {
  id: string;
  email?: string;
  currency_code?: string;
  region_id?: string;
  customer_id?: string;
  billing_address?: Record<string, unknown>;
  shipping_address?: Record<string, unknown>;
};

export type GetBookingCartResponse = {
  cart: BookingCart;
  booking_line_items: BookingCartItem[];
};

export type PricingUnit = "second" | "minute" | "hour" | "day" | "custom";

export type CreateCartResponse = {
  cart: BookingCart;
};

/**
 * Create a new booking cart. POST /store/booking-carts
 * Body: { region_id?: string; currency_code?: string }
 */
async function createBookingCart(regionId?: string, currencyCode?: string): Promise<BookingCart | null> {
  const headers = await getAuthHeaders();
  try {
    const res = await sdk.client.fetch<CreateCartResponse>(
      "/store/booking-carts",
      {
        method: "POST",
        body: {
          region_id: regionId,
          currency_code: currencyCode ?? "usd",
        },
        headers: { "Content-Type": "application/json", ...headers },
      }
    );
    if (res?.cart) {
      await setCartId(res.cart.id);
      return res.cart;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get or create cart. Returns cart id or null.
 */
export async function getOrCreateCartId(regionId?: string): Promise<string | null> {
  let id = await getCartId();
  if (id) return id;
  const cart = await createBookingCart(regionId);
  return cart?.id ?? null;
}

/**
 * Get booking cart with line items. GET /store/booking-carts/{id}
 */
export async function getBookingCart(
  cartId?: string
): Promise<GetBookingCartResponse | null> {
  const id = cartId ?? (await getCartId());
  if (!id) return null;
  try {
    const res = await sdk.client.fetch<GetBookingCartResponse>(
      `/store/booking-carts/${id}`,
      { method: "GET" }
    );
    return res ?? null;
  } catch {
    return null;
  }
}

/**
 * Update cart (email, address). POST /store/booking-carts/{id}
 */
export async function updateBookingCart(
  cartId: string,
  data: { customer_email?: string; customer_address?: Record<string, unknown> }
): Promise<BookingCart | null> {
  try {
    const res = await sdk.client.fetch<{ cart: BookingCart }>(
      `/store/booking-carts/${cartId}`,
      {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }
    );
    return res?.cart ?? null;
  } catch {
    return null;
  }
}

/**
 * Add booking item to cart. POST /store/booking-carts/{id}/items
 * Body: { booking_resource_id, start_date, end_date } (ISO date-time strings)
 */
export async function addBookingCartItem(
  cartId: string,
  payload: {
    booking_resource_id: string;
    start_date: string;
    end_date: string;
    pricing_unit: PricingUnit;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await sdk.client.fetch(`/store/booking-carts/${cartId}/items`, {
      method: "POST",
      body: {
        booking_resource_id: payload.booking_resource_id,
        start_date: payload.start_date,
        end_date: payload.end_date,
        pricing_unit: payload.pricing_unit,
      },
      headers: { "Content-Type": "application/json" },
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add to cart";
    return { success: false, error: message };
  }
}

/**
 * Remove item from cart. DELETE /store/booking-carts/{id}/items/{itemId}
 */
export async function removeBookingCartItem(
  cartId: string,
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sdk.client.fetch(
      `/store/booking-carts/${cartId}/items/${encodeURIComponent(itemId)}`,
      { method: "DELETE" }
    );
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to remove item";
    return { success: false, error: message };
  }
}

/**
 * Complete booking cart (checkout). POST /store/booking-carts/{id}/complete
 */
export async function completeBookingCart(
  cartId: string
): Promise<{ success: boolean; error?: string; result?: unknown }> {
  try {
    const result = await sdk.client.fetch<unknown>(
      `/store/booking-carts/${cartId}/complete`,
      { method: "POST" }
    );
    await removeCartId();
    return { success: true, result };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to complete checkout";
    return { success: false, error: message };
  }
}
