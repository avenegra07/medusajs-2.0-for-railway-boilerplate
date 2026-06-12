import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingResourceByHandle } from "@/lib/data/booking-resources";
import { ProductBooking } from "./ProductBooking";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { PricingUnit } from "@/lib/data/booking-cart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const data = await getBookingResourceByHandle(handle);
  if (!data) notFound();

  const resource =
    data.bookingResource ??
    (data as { booking_resource?: typeof data.bookingResource })
      .booking_resource;
  const product = data.product;
  const title =
    product?.title ?? resource?.title ?? resource?.product_title ?? "Gear";
  const subtitle = product?.subtitle ?? resource?.subtitle;
  const description = product?.description ?? resource?.description;
  const thumbnail = product?.thumbnail;

  const priceInfo = (
    resource as {
      booking_resource_pricing_configs?: Array<{
        product_variant?: {
          calculated_price?: {
            calculated_amount?: number;
            currency_code?: string;
          };
        };
      }>;
    }
  )?.booking_resource_pricing_configs?.[0]?.product_variant?.calculated_price;

  const unitPrice = priceInfo?.calculated_amount;
  const currency = priceInfo?.currency_code?.toUpperCase() ?? "USD";
  const pricingUnit = resource.pricing_unit ?? "day";

  return (
    <div className="w-full py-8">
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
            {description && (
              <p className="mt-4 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Book this gear</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductBooking
                resourceId={resource.id}
                unitPrice={unitPrice}
                currency={currency}
                pricingUnit={pricingUnit as unknown as PricingUnit}
                title={title}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

