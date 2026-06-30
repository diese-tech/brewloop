import { notFound } from "next/navigation";

import { RewardsPanel } from "@/components/rewards-panel";
import { isDemoMode } from "@/lib/config";
import { getCafeBySlug } from "@/lib/data";

export default async function RewardsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cafe = await getCafeBySlug(slug);
  if (!cafe) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Coven card · loyalty</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">
          Collect 10 moons.
        </h1>
        <p className="mt-3 text-muted-foreground">
          The next drink is on the house. No app and no password.
        </p>
      </div>
      <RewardsPanel cafe={cafe} demoMode={isDemoMode()} />
    </main>
  );
}
