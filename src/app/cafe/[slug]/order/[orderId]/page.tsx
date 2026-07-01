import { notFound } from "next/navigation";

import { OrderStatusView } from "@/components/order-status";
import { isDemoMode } from "@/lib/config";
import { getCafeBySlug } from "@/lib/data";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = await params;
  const cafe = await getCafeBySlug(slug);
  if (!cafe) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
      <OrderStatusView
        slug={slug}
        orderId={orderId}
        demoMode={isDemoMode()}
        cafeName={cafe.name}
      />
    </main>
  );
}
