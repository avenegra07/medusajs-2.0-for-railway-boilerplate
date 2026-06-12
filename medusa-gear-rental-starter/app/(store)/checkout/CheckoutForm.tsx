"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateBookingCart,
  completeBookingCart,
} from "@/lib/data/booking-cart";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  address_1: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  postal_code: z.string().min(1, "Required"),
  country_code: z.string().min(1, "Required"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function validateFormData(data: unknown): { success: true; data: FormData } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const errors: Record<string, string> = {};
  result.error.issues.forEach((e) => {
    const path = e.path.join(".");
    if (!errors[path]) errors[path] = e.message;
  });
  return { success: false, errors };
}

export function CheckoutForm({
  cartId,
  initialEmail,
  initialAddress,
}: {
  cartId: string;
  initialEmail?: string;
  initialAddress?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
    phone?: string | null;
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      email: initialEmail ?? "",
      first_name: initialAddress?.first_name ?? "",
      last_name: initialAddress?.last_name ?? "",
      address_1: initialAddress?.address_1 ?? "",
      city: initialAddress?.city ?? "",
      postal_code: initialAddress?.postal_code ?? "",
      country_code: initialAddress?.country_code ?? "us",
      phone: initialAddress?.phone ?? "",
    },
  });

  const onSubmit = async (raw: FormData) => {
    const validated = validateFormData(raw);
    if (!validated.success) {
      Object.entries(validated.errors).forEach(([key, message]) => {
        form.setError(key as keyof FormData, { message });
      });
      return;
    }
    const data = validated.data;
    setStatus("loading");
    setErrorMessage(null);
    try {
      await updateBookingCart(cartId, {
        customer_email: data.email,
        customer_address: {
          first_name: data.first_name,
          last_name: data.last_name,
          address_1: data.address_1,
          city: data.city,
          postal_code: data.postal_code,
          country_code: data.country_code,
          phone: data.phone ?? undefined,
        },
      });
      const result = await completeBookingCart(cartId);
      if (result.success) {
        setStatus("success");
        router.push("/checkout/success");
        router.refresh();
      } else {
        setStatus("error");
        setErrorMessage(result.error ?? "Failed to complete order");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm text-green-600">Completing your order…</p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" {...form.register("first_name")} />
          {form.formState.errors.first_name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.first_name.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" {...form.register("last_name")} />
          {form.formState.errors.last_name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.last_name.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address_1">Address</Label>
        <Input id="address_1" {...form.register("address_1")} />
        {form.formState.errors.address_1 && (
          <p className="text-xs text-destructive">
            {form.formState.errors.address_1.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...form.register("city")} />
          {form.formState.errors.city && (
            <p className="text-xs text-destructive">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="postal_code">Postal code</Label>
          <Input id="postal_code" {...form.register("postal_code")} />
          {form.formState.errors.postal_code && (
            <p className="text-xs text-destructive">
              {form.formState.errors.postal_code.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="country_code">Country code</Label>
        <Input
          id="country_code"
          placeholder="e.g. us"
          {...form.register("country_code")}
        />
        {form.formState.errors.country_code && (
          <p className="text-xs text-destructive">
            {form.formState.errors.country_code.message}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" {...form.register("phone")} />
      </div>

      {status === "error" && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Complete booking
      </Button>
    </form>
  );
}
