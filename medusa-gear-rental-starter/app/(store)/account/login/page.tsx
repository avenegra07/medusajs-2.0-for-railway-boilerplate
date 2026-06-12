import { login } from "@/lib/data/customer";
import { LoginForm } from "@/components/ui/login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const redirectTo = searchParams?.redirect || "/account";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoginForm
        className="w-full max-w-sm"
        action={login}
        redirectTo={redirectTo}
      />
    </div>
  );
}

