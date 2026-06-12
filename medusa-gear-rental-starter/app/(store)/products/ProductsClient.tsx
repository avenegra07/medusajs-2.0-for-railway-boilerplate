 "use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BookingResourceListItem } from "@/lib/types/booking-resource";

// --- Framer Motion Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function scrollToCatalog(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  const target = document.getElementById("catalog");
  if (target) {
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function ProductCard({ item }: { item: BookingResourceListItem }) {
  const resource = item.booking_resource;
  const product = item.product;
  const title = product?.title ?? resource?.title ?? resource?.product_title ?? "Gear";
  const subtitle = product?.subtitle ?? resource?.subtitle;
  const thumbnail = product?.thumbnail;
  const id = resource?.id;
  const handle = product?.handle;
  if (!id || !handle) return null;

  const priceInfo = (resource as any)?.booking_resource_pricing_configs?.[0]?.product_variant?.calculated_price;
  const price = priceInfo?.calculated_amount;
  const currency = priceInfo?.currency_code?.toUpperCase() ?? "USD";

  return (
    <motion.div variants={itemVariants}>
      {/* Added 'group' class to trigger child animations on hover */}
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-background/50 backdrop-blur-sm border-muted">
        <Link href={`/products/${handle}`}>
          <CardHeader className="p-0 relative">
            <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground bg-secondary/50">
                  <CalendarDays className="h-10 w-10 opacity-20" />
                </div>
              )}
              {/* Optional: Add a subtle overlay gradient on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                 <Button variant="secondary" className="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    View Details
                 </Button>
              </div>
            </div>
            {/* Added a floating badge */}
            <Badge className="absolute top-3 right-3 bg-background/80 text-foreground backdrop-blur-md border-none">
              Available
            </Badge>
          </CardHeader>
          <CardContent className="p-5">
            <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {subtitle}
              </p>
            )}
            {price != null && (
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{currency} {price}</span>
                <span className="text-sm text-muted-foreground font-medium">
                  / {resource.pricing_unit ?? "day"}
                </span>
              </div>
            )}
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}

export default function ProductsClient({
  items,
  error,
}: {
  items: BookingResourceListItem[];
  error?: string | null;
}) {
  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <CalendarDays className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-destructive">{error}</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Ensure the Medusa backend with the Booking System plugin is running (e.g. http://localhost:9000).
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-muted/50 to-background text-center flex flex-col items-center justify-center min-h-[40vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <Badge variant="outline" className="mb-4">Medusa Booking System</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Equip your next <span className="text-primary">adventure.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium gear rentals for creators, explorers, and professionals. Select your dates, book your equipment, and get out there.
          </p>
          <Link href="#catalog" onClick={scrollToCatalog}>
            <Button size="lg" className="rounded-full px-8">
              Browse Catalog <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Catalog Section */}
      <div
        id="catalog"
        className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-12"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">Available Gear</h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl border-muted">
            <h3 className="text-xl font-medium">No gear available yet</h3>
            <p className="text-muted-foreground mt-2">Seed your Medusa database to see products here.</p>
          </div>
        ) : (
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => (
              <ProductCard key={item.booking_resource?.id ?? Math.random()} item={item} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

