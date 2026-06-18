import { notFound } from "next/navigation";

import { OrderBuilder } from "@/components/order-builder";
import { getCafeBySlug } from "@/lib/demo-data";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t } = await searchParams;
  const cafe = getCafeBySlug(slug);
  if (!cafe) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {t ? `Table ${t}` : "Pickup or table service"}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Order from {cafe.name}
        </h1>
        <p className="mt-3 text-muted-foreground">
          No online payment. Pay at the café when your order is ready.
        </p>
      </div>
      <OrderBuilder cafe={cafe} initialTable={t} />
    </main>
  );
}
