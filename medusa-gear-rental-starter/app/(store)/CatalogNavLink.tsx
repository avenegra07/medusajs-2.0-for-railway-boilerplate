 "use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

function scrollToCatalog(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  const target = document.getElementById("catalog");
  if (target) {
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function CatalogNavLink() {
  return (
    <Link href="/products#catalog" onClick={scrollToCatalog}>
      <Button variant="ghost" size="sm">
        Catalog
      </Button>
    </Link>
  );
}

