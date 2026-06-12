"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getBookingResourceAvailability } from "@/lib/data/booking-availability";
import {
  addBookingCartItem,
  getOrCreateCartId,
  type PricingUnit,
} from "@/lib/data/booking-cart";
import type { BookingAvailabilityDTO } from "@/lib/types/booking-availability";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DateRange = { from?: Date; to?: Date } | undefined;

type ProductBookingProps = {
  resourceId: string;
  unitPrice?: number | null;
  currency?: string;
  pricingUnit?: PricingUnit;
  title?: string;
};

export function ProductBooking({
  resourceId,
  unitPrice,
  currency,
  pricingUnit,
  title,
}: ProductBookingProps) {
  const router = useRouter();
  const [month, setMonth] = useState<Date>(new Date());
  const [range, setRange] = useState<DateRange>(undefined);
  const [availability, setAvailability] = useState<BookingAvailabilityDTO[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [addStatus, setAddStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const rentalDays =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  const totalPrice =
    unitPrice != null && rentalDays > 0 ? unitPrice * rentalDays : null;

  const fetchAvailability = useCallback(async (m: Date) => {
    setLoadingAvailability(true);
    const from = startOfMonth(m);
    const to = endOfMonth(m);
    try {
      const data = await getBookingResourceAvailability(
        resourceId,
        from,
        to,
        "month"
      );
      setAvailability(data?.availability ?? []);
    } finally {
      setLoadingAvailability(false);
    }
  }, [resourceId]);

  const onMonthChange = useCallback(
    (m: Date) => {
      setMonth(m);
      fetchAvailability(m);
    },
    [fetchAvailability]
  );

  useEffect(() => {
    fetchAvailability(month);
  }, [month, fetchAvailability]);

  const availabilityByDate = new Map(
    availability.map((a) => [a.date.slice(0, 10), a])
  );

  const isDayDisabled = useCallback(
    (day: Date) => {
      const key = format(day, "yyyy-MM-dd");
      const dayData = availabilityByDate.get(key);
      return dayData ? !dayData.is_available : false;
    },
    [availabilityByDate]
  );

  const isDayAvailable = useCallback(
    (day: Date) => {
      const key = format(day, "yyyy-MM-dd");
      const dayData = availabilityByDate.get(key);
      return !!dayData?.is_available;
    },
    [availabilityByDate]
  );

  const handleAddToCart = async () => {
    if (!range?.from || !range.to) return;
    setAddStatus("loading");
    try {
      const cartId = await getOrCreateCartId();
      if (!cartId) {
        setAddStatus("error");
        toast.error("Could not get cart. Please try again.", { position: "top-center"});
        return;
      }
      const result = await addBookingCartItem(cartId, {
        booking_resource_id: resourceId,
        start_date: range.from.toISOString(),
        end_date: range.to.toISOString(),
        pricing_unit: pricingUnit ?? "day",
      });
      if (result.success) {
        setAddStatus("success");
        setRange(undefined);
        toast.success(
          title ? `"${title}" added to cart.` : "Added to cart.",
          { position: "top-center" }
        );
        router.refresh();
      } else {
        setAddStatus("error");
        const message = result.error ?? "Failed to add to cart";
        toast.error(message, { position: "top-center"});
      }
    } catch {
      setAddStatus("error");
      const message = "Failed to add to cart";
      toast.error(message, { position: "top-center"});
    }
  };

  const canAdd = range?.from && range?.to && range.from.getTime() !== range.to.getTime();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Select rental dates</p>
        {unitPrice != null && (
          <p className="mb-2 text-sm">
            <span className="font-medium">
              {currency ?? "USD"} {unitPrice}
            </span>{" "}
            <span className="text-muted-foreground">
              / {pricingUnit ?? "day"}
            </span>
          </p>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !range && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, "MMM d, yyyy")} – {format(range.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(range.from, "MMM d, yyyy")
                )
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range?.from ? (range as { from: Date; to?: Date }) : undefined}
              onSelect={(v) => setRange(v ?? undefined)}
              month={month}
              onMonthChange={onMonthChange}
              disabled={isDayDisabled}
              modifiers={{
                available: isDayAvailable,
              }}
              defaultMonth={month}
              numberOfMonths={1}
            />
            <div className="p-2 border-t text-xs text-muted-foreground flex gap-2 items-center">
              {loadingAvailability && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>Green = available</span>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {totalPrice != null && rentalDays > 0 && (
        <p className="text-sm">
          Total for {rentalDays} {rentalDays === 1 ? "day" : "days"}:{" "}
          <span className="font-semibold">
            {currency ?? "USD"} {totalPrice}
          </span>
        </p>
      )}

      {canAdd && (
        <Button
          onClick={handleAddToCart}
          disabled={addStatus === "loading"}
          className="w-full"
        >
          {addStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add to cart
        </Button>
      )}
    </div>
  );
}

