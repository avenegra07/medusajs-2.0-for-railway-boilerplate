import { NextResponse } from "next/server";
import { signout } from "@/lib/data/customer";

export async function POST() {
  await signout();

  return NextResponse.redirect(new URL("/products", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}

