import Link from "next/link";
import { getBookingCart } from "@/lib/data/booking-cart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CartItemActions } from "./CartItemActions";
import { format } from "date-fns";
import { ShoppingBag } from "lucide-react";

export default async function CartPage() {
  const data = await getBookingCart();

  if (!data?.cart) {
    return (
      <div className="w-full py-12">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add gear from the catalog to get started.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Browse catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { cart, booking_line_items: items } = data;
  const hasItems = items && items.length > 0;

  type BookingLineItem = {
    id: string;
    cart_line_item_id?: string | null;
    start_time: string | Date;
    end_time: string | Date;
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

  type CartWithItems = typeof cart & {
    items?: CartLineItem[];
  };

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

  if (!hasItems) {
    return (
      <div className="w-full py-12">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add gear from the catalog to get started.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Browse catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <h1 className="text-2xl font-semibold mb-6">Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
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
              <Card key={lineItem?.id ?? bookings[0]?.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {amount != null && (
                      <p className="text-sm font-medium">
                        {currency} {amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <p>
                        {format(new Date(booking.start_time), "MMM d, yyyy")} –{" "}
                        {format(new Date(booking.end_time), "MMM d, yyyy")}
                      </p>
                      <CartItemActions
                        cartId={cart.id}
                        itemId={booking.id}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""} in your cart.
              </p>
              {typeof (cart as any).total === "number" && (
                <p className="mt-2 text-sm">
                  Total:{" "}
                  <span className="font-semibold">
                    {currency} {((cart as any).total ).toFixed(2)}
                  </span>
                </p>
              )}
              {cart.email && (
                <p className="mt-2 text-sm">
                  Email: <span className="font-medium">{cart.email}</span>
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
