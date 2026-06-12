import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  getBookingCart,
  type BookingCart,
  type BookingCartItem,
} from "@/lib/data/booking-cart";
import { CheckoutForm } from "./CheckoutForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { retrieveCustomer } from "@/lib/data/customer";

type BookingLineItem = BookingCartItem & {
  cart_line_item_id?: string | null;
};

type CartLineItem = {
  id: string;
  title?: string;
  description?: string;
  quantity?: number;
  subtotal?: number;
  total?: number;
  unit_price?: number;
};

type CartWithItems = BookingCart & {
  items?: CartLineItem[];
};

export default async function CheckoutPage() {
  const data = await getBookingCart();
  const customer = await retrieveCustomer();

  if (!data?.cart) {
    redirect("/cart");
  }

  const { cart, booking_line_items: items } = data;
  const hasItems = items && items.length > 0;

  if (!hasItems) {
    redirect("/cart");
  }

  const cartWithItems = cart as CartWithItems;
  const currency = cart.currency_code?.toUpperCase() ?? "USD";

  const cartItemsById =
    cartWithItems.items?.reduce<Record<string, CartLineItem>>((acc, li) => {
      acc[li.id] = li;
      return acc;
    }, {}) ?? {};

  const groupedByCartLineItem = (items as BookingLineItem[]).reduce<
    {
      cartLineItem: CartLineItem | undefined;
      bookings: BookingLineItem[];
    }[]
  >((acc, booking) => {
    const key = booking.cart_line_item_id || booking.id;
    let group = acc.find(
      (g) => (g.bookings[0]?.cart_line_item_id || g.bookings[0]?.id) === key
    );

    if (!group) {
      group = {
        cartLineItem: cartItemsById[key],
        bookings: [],
      };
      acc.push(group);
    }

    group.bookings.push(booking);

    return acc;
  }, []);

  const itemCount = items.length;
  const totalAmount =
    typeof (cartWithItems as any).total === "number"
      ? (cartWithItems as any).total
      : null;

  const shippingAddress = (() => {
    if (!customer) {
      return undefined;
    }

    const anyCustomer = customer as any;
    const addresses: any[] =
      anyCustomer.shipping_addresses ??
      anyCustomer.addresses ??
      [];

    if (!addresses.length) {
      return undefined;
    }

    const defaultShipping =
      addresses.find((a) => a.is_default_shipping) ?? addresses[0];

    return {
      first_name: defaultShipping.first_name,
      last_name: defaultShipping.last_name,
      address_1: defaultShipping.address_1,
      city: defaultShipping.city,
      postal_code: defaultShipping.postal_code,
      country_code: defaultShipping.country_code,
      phone: defaultShipping.phone,
    };
  })();

  return (
    <div className="w-full py-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact & delivery details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your details to complete the booking.
              </p>
            </CardHeader>
            <CardContent>
              <CheckoutForm
                cartId={cart.id}
                initialEmail={customer?.email ?? cart.email}
                initialAddress={shippingAddress}
              />
            </CardContent>
          </Card>

          <div className="mt-2 text-center">
            <Button variant="link" asChild>
              <Link href="/cart">Back to cart</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your items</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review what you&apos;re about to book.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedByCartLineItem.map((group) => {
                const { cartLineItem: lineItem, bookings } = group;

                const title =
                  lineItem?.title || lineItem?.description || "Rental";

                const rawAmount =
                  typeof lineItem?.total === "number"
                    ? lineItem.total
                    : typeof lineItem?.subtotal === "number"
                    ? lineItem.subtotal
                    : typeof lineItem?.unit_price === "number"
                    ? lineItem.unit_price
                    : null;

                const amount =
                  rawAmount != null ? (rawAmount as number) : null;

                return (
                  <div key={lineItem?.id ?? bookings[0]?.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{title}</p>
                      {amount != null && (
                        <p className="text-sm font-semibold">
                          {currency} {amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      {bookings.map((booking) => (
                        <p
                          key={booking.id}
                          className="text-xs text-muted-foreground"
                        >
                          {format(new Date(booking.start_time), "MMM d, yyyy")}{" "}
                          –{" "}
                          {format(new Date(booking.end_time), "MMM d, yyyy")}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {itemCount} item{itemCount !== 1 ? "s" : ""} in your booking.
              </p>
              {totalAmount != null && (
                <p className="text-sm">
                  Total:{" "}
                  <span className="font-semibold">
                    {currency} {totalAmount.toFixed(2)}
                  </span>
                </p>
              )}
              {cart.email && (
                <p className="text-sm">
                  Email: <span className="font-medium">{cart.email}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
