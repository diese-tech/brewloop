import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Gift, MapPin, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCafeBySlug } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Demo Coffee",
};

export default async function CafePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cafe = getCafeBySlug(slug);
  if (!cafe) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-20">
      <Badge className="mb-5" variant="secondary">
        Open today · 7am–4pm
      </Badge>
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_26rem]">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
            {cafe.name}
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-muted-foreground">
            {cafe.tagline}
          </p>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" /> 101 Main Street · Your neighborhood
          </p>
        </div>
        <Card className="bg-card/90 shadow-lg">
          <CardHeader>
            <CardTitle>What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild size="lg" className="w-full justify-between">
              <Link href={`/cafe/${slug}/order`}>
                <span className="flex items-center gap-2">
                  <ShoppingBag /> Browse menu
                </span>
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full justify-between"
            >
              <Link href={`/cafe/${slug}/rewards`}>
                <span className="flex items-center gap-2">
                  <Gift /> View rewards
                </span>
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <section className="mt-16 border-t pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Built for the everyday stop
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Order ahead", "Send your order to the bar before you arrive."],
            ["Stay flexible", "Choose pickup or let us know your table number."],
            ["Come back sooner", "Track simple visit rewards by phone or email."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl border bg-card/60 p-5">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
