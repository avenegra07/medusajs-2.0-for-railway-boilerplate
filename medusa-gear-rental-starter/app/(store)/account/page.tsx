import { format } from "date-fns";
import { listCustomerBookings } from "@/lib/data/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AccountBookingsPage() {
  const { bookings } = await listCustomerBookings();

  if (!bookings.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any bookings yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => {
          const currency =
            (booking.order?.currency_code ||
              booking.booking_line_items?.[0]?.price?.currency_code ||
              "usd"
            ).toUpperCase();
          const total =
            typeof booking.order?.total === "number"
              ? booking.order.total
              : booking.booking_line_items?.reduce((acc, item) => {
                  const lineTotal =
                    typeof item.price?.total === "number"
                      ? item.price.total
                      : 0;
                  return acc + lineTotal;
                }, 0) ?? null;

          const start = format(new Date(booking.start_time), "MMM d, yyyy");
          const end = format(new Date(booking.end_time), "MMM d, yyyy");

          return (
            <div
              key={booking.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Booking #
                    {(booking as any).booking_number ??
                      booking.id.slice(0, 8)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {start} – {end}
                </p>
                {booking.order?.display_id && (
                  <p className="text-xs text-muted-foreground">
                    Order #{booking.order.display_id}
                  </p>
                )}
                {booking.booking_line_items &&
                  booking.booking_line_items.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {booking.booking_line_items.map((item) => {
                        const allocation = item.booking_resource_allocation;
                        const resource = allocation?.booking_resource;

                        const resourceStart =
                          allocation?.start_time ?? item.start_time;
                        const resourceEnd =
                          allocation?.end_time ?? item.end_time;

                        const pricePerItem =
                          typeof item.price?.total === "number"
                            ? item.price.total
                            : null;

                        const resourceStartFormatted = resourceStart
                          ? format(
                              new Date(resourceStart),
                              "MMM d, yyyy",
                            )
                          : null;
                        const resourceEndFormatted = resourceEnd
                          ? format(new Date(resourceEnd), "MMM d, yyyy")
                          : null;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium">
                                {resource?.title || "Booked resource"}
                              </p>
                              {(resourceStartFormatted ||
                                resourceEndFormatted) && (
                                <p className="text-[11px] text-muted-foreground">
                                  {resourceStartFormatted} –{" "}
                                  {resourceEndFormatted}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              {pricePerItem != null && (
                                <p className="font-semibold">
                                  {currency} {pricePerItem.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
              <div className="text-sm text-muted-foreground sm:text-right">
                {total != null && (
                  <p className="font-semibold">
                    {currency} {total.toFixed(2)}
                  </p>
                )}
                <p className="text-xs">
                  {booking.booking_line_items?.length || 0} item
                  {booking.booking_line_items &&
                  booking.booking_line_items.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

