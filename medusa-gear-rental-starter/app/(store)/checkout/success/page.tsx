import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="w-full py-12">
      <div className="mx-auto max-w-md text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Booking confirmed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Thank you. Your gear rental booking has been completed.
            </p>
            <Button asChild className="w-full">
              <Link href="/products">Browse more gear</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
