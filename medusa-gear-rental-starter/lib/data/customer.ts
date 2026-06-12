"use server";

import { sdk } from "@/lib/medusa-sdk";
import type { HttpTypes } from "@medusajs/types";
import {
  getAuthHeaders,
  getCartId,
  setAuthToken,
  removeAuthToken,
} from "@/lib/data/cookies";

type AuthState = {
  success: boolean;
  error?: string | null;
};

async function transferCart() {
  const cartId = await getCartId();

  if (!cartId) {
    return;
  }

  const headers = await getAuthHeaders();

  await sdk.store.cart.transferCart(cartId, {}, headers);
}

export const retrieveCustomer = async (): Promise<
  HttpTypes.StoreCustomer | null
> => {
  const authHeaders = await getAuthHeaders();

  if (!("authorization" in authHeaders)) {
    return null;
  }

  try {
    const customer = await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>("/store/customers/me", {
        method: "GET",
        headers: authHeaders,
      })
      .then(({ customer }) => customer);

    return customer ?? null;
  } catch {
    return null;
  }
};

export async function signup(formData: FormData) {
  const password = formData.get("password") as string;
  const email = formData.get("email") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    });

    await setAuthToken(token as string);

    await sdk.store.customer.create(
      {
        email,
        first_name,
        last_name,
      },
      {},
      await getAuthHeaders(),
    );

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    });

    await setAuthToken(loginToken as string);

    await transferCart();

    return null;
  } catch (error: any) {
    return error.toString();
  }
}

export async function login(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const token = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    });

    await setAuthToken(token as string);

    await transferCart();

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.toString(),
    };
  }
}

export async function signout() {
  try {
    await sdk.auth.logout();
  } catch {
    // ignore
  }

  await removeAuthToken();
}

