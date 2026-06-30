import { notFound } from "next/navigation";

import { OrderBuilder } from "@/components/order-builder";
import { isDemoMode } from "@/lib/config";
import { getCafeBySlug } from "@/lib/data";

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

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <div className="mb-10">
        <p className="eyebrow">
          {t ? `Table ${t}` : "Pickup or table service"}
        </p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">
          Choose your potion.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Customize with a note, pay securely, and we’ll call your name.
        </p>
      </div>
      <OrderBuilder
        cafe={cafe}
        initialTable={t}
        tableSignature={sig}
        demoMode={isDemoMode()}
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
