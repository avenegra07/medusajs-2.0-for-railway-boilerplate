import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { getBookingCart } from "@/lib/data/booking-cart";
import { retrieveCustomer } from "@/lib/data/customer";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CatalogNavLink } from "./CatalogNavLink";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await getBookingCart();
  const itemCount = cart?.booking_line_items?.length ?? 0;
  const customer = await retrieveCustomer();

  const initials =
    (customer?.first_name?.[0] ?? "") + (customer?.last_name?.[0] ?? "");

  const customerLabel =
    customer?.first_name || customer?.email || "Logged in";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="font-semibold text-lg">
            Gear Rental
          </Link>
          <nav className="flex items-center gap-4">
            <CatalogNavLink />

            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                  >
                    <span className="hidden sm:inline">{customerLabel}</span>
                    <Avatar size="sm">
                      <AvatarFallback>
                        {initials || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">My bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form
                      action="/account/signout"
                      method="post"
                      className="w-full"
                    >
                      <button type="submit" className="w-full text-left">
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden text-xs text-muted-foreground sm:block">
                  Guest
                </div>
                <Link href="/account/login">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
