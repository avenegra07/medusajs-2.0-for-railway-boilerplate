import { ReactNode } from "react";

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {children}
      </div>
    </div>
  );
}

