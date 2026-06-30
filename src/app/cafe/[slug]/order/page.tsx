import { CircleAlert, Clock } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { OrderBuilder } from "@/components/order-builder";
import { isDemoMode } from "@/lib/config";
import { getCafeBySlug } from "@/lib/data";
import { verifyTableSignature } from "@/lib/qr";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string; sig?: string }>;
}) {
  const { slug } = await params;
  const { t, sig } = await searchParams;
  const cafe = await getCafeBySlug(slug);
  if (!cafe) notFound();

  const demoMode = isDemoMode();

  // Demo mode trusts the `t` query param so the flow is testable without a
  // signing secret. In production, a table is only honored once its
  // signature verifies — this keeps a tampered, missing, or expired table
  // link from silently failing at the very end of checkout.
  let validTable: string | undefined;
  let tableError: string | null = null;
  if (t) {
    if (demoMode) {
      validTable = t;
    } else if (
      sig &&
      verifyTableSignature(slug, t, sig, process.env.QR_SIGNING_SECRET ?? "")
    ) {
      validTable = t;
    } else {
      tableError =
        "This table link isn’t valid or has expired. Ask a staff member for a fresh QR code, or order for pickup below.";
    }
  }

  if (!cafe.acceptingOrders) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[var(--brass)] bg-[var(--surface-alt)]">
          <Clock className="size-7 text-[var(--brass-bright)]" />
        </div>
        <p className="eyebrow mt-6">{cafe.name}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Online ordering is closed right now.
        </h1>
        <p className="mt-3 text-muted-foreground">
          {cafe.hours
            ? `Check back during our hours: ${cafe.hours}.`
            : "Check back soon, or stop by the counter to order in person."}
        </p>
        <Button asChild size="lg" className="mt-7">
          <a href={`/cafe/${slug}`}>Back to {cafe.name}</a>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <div className="mb-10">
        <p className="eyebrow">
          {validTable ? `Table ${validTable}` : "Pickup or table service"}
        </p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">
          Choose your potion.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Customize with a note, pay securely, and we’ll call your name.
        </p>
        {tableError && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {tableError}
          </p>
        )}
      </div>
      <OrderBuilder
        cafe={cafe}
        initialTable={validTable}
        tableSignature={validTable ? sig : undefined}
        demoMode={demoMode}
        square={{
          applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "",
          locationId:
            cafe.squareLocationId ??
            process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ??
            "",
          environment: process.env.SQUARE_ENVIRONMENT === "production"
            ? "production"
            : "sandbox",
        }}
      />
    </main>
  );
}
