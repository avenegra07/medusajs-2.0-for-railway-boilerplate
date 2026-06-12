"use client";

import type { ComponentProps } from "react";
import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AuthState = {
  success: boolean;
  error?: string | null;
};

type LoginFormProps = ComponentProps<"div"> & {
  action: (prevState: AuthState | null, formData: FormData) => Promise<AuthState>;
  redirectTo?: string;
};

export function LoginForm({
  className,
  action,
  redirectTo = "/account",
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<AuthState | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(redirectTo);
    }
  }, [state?.success, redirectTo, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit">Sign in</Button>
                {state?.error && (
                  <p className="mt-2 text-sm text-destructive">{state.error}</p>
                )}
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/account/register" className="underline">
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
