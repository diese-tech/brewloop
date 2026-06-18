import { notFound } from "next/navigation";

import { RewardsPanel } from "@/components/rewards-panel";
import { getCafeBySlug } from "@/lib/demo-data";

export default async function RewardsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cafe = getCafeBySlug(slug);
  if (!cafe) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Demo Coffee rewards
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Ten visits. One thank-you on us.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Use either your phone or email to join and check progress.
        </p>
      </div>
      <RewardsPanel cafe={cafe} />
    </main>
  );
}
