import "server-only";
import { cookies as nextCookies } from "next/headers";

const CART_ID_COOKIE = "_medusa_cart_id";
const AUTH_COOKIE = "_medusa_jwt";

export async function getCartId(): Promise<string | undefined> {
  const c = await nextCookies();
  return c.get(CART_ID_COOKIE)?.value;
}

export async function setCartId(cartId: string): Promise<void> {
  const c = await nextCookies();
  c.set(CART_ID_COOKIE, cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function removeCartId(): Promise<void> {
  const c = await nextCookies();
  c.set(CART_ID_COOKIE, "", { maxAge: -1 });
}

export async function getAuthHeaders(): Promise<{ authorization: string } | {}> {
  try {
    const c = await nextCookies();
    const token = c.get(AUTH_COOKIE)?.value;
    if (!token) {
      return {};
    }
    return { authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export async function setAuthToken(token: string): Promise<void> {
  const c = await nextCookies();
  c.set(AUTH_COOKIE, token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function removeAuthToken(): Promise<void> {
  const c = await nextCookies();
  c.set(AUTH_COOKIE, "", {
    maxAge: -1,
  });
}
