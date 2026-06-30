import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Gift, MapPin, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCafeBySlug } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Black Rabbit Bookbar",
};

export default async function CafePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cafe = await getCafeBySlug(slug);
  if (!cafe) notFound();

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgb(201_160_110_/_18%),transparent_18rem),radial-gradient(circle_at_14%_0%,rgb(122_27_43_/_45%),transparent_30rem)]" />
        <div className="relative mx-auto grid min-h-[34rem] max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_25rem]">
          <div>
            <Badge className="mb-6 bg-background/35" variant="outline">
              {cafe.hours}
            </Badge>
            <p className="eyebrow mb-4">The Black Rabbit Bookbar</p>
            <h1 className="max-w-3xl text-6xl font-semibold leading-[0.88] tracking-tight sm:text-8xl">
              Enter the rabbit hole.
            </h1>
            <p className="mt-6 max-w-2xl font-heading text-2xl italic leading-8 text-muted-foreground">
              {cafe.tagline}
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {cafe.address}
            </p>
          </div>
          <Card className="card card--parchment">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Coven card · loyalty
                </span>
                <span className="font-mono text-[0.6rem] text-[var(--ink-muted)]">
                  7 of 10
                </span>
              </div>
              <CardTitle className="mt-2 text-3xl text-[var(--ink)]">
                3 moons from a free pour.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2" aria-label="7 of 10 visits">
                {Array.from({ length: 10 }).map((_, index) =>
                  index < 7 ? (
                    <span key={index} className="moon-stamp moon-stamp--filled" />
                  ) : (
                    <span key={index} className="moon-stamp moon-stamp--empty" />
                  ),
                )}
              </div>
              <Button asChild size="lg" className="w-full justify-between">
                <Link href={`/cafe/${slug}/rewards`}>
                  <span className="flex items-center gap-2">
                    <Gift /> Join / check rewards
                  </span>
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full justify-between border-[var(--ink-muted)] bg-transparent text-[var(--ink)] hover:bg-black/5 hover:text-[var(--ink)]"
              >
                <Link href={`/cafe/${slug}/order`}>
                  <span className="flex items-center gap-2">
                    <ShoppingBag /> Order now
                  </span>
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">From the spellbook</p>
            <h2 className="mt-2 text-4xl font-semibold">Signature potions</h2>
          </div>
          <span className="eyebrow">{cafe.items.length} featured</span>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cafe.items.slice(0, 6).map((item) => (
            <Card key={item.id} className="card card--parchment min-h-48">
              <CardHeader>
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Tincture
                </span>
                <CardTitle className="text-2xl text-[var(--ink)]">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between">
                <p className="font-mono text-[0.6rem] uppercase leading-5 text-[var(--ink-muted)]">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center justify-between font-mono text-[var(--ink)]">
                  <span>${(item.priceCents / 100).toFixed(2)}</span>
                  <Button asChild size="icon">
                    <Link href={`/cafe/${slug}/order`} aria-label={`Order ${item.name}`}>
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" size="lg" className="h-14 justify-between">
            <span className="flex items-center gap-3">
              <BookOpen /> {cafe.externalLabel}
            </span>
            <ArrowRight />
          </Button>
          <Button variant="outline" size="lg" className="h-14 justify-between">
            <span>Follow The Black Rabbit</span>
            <ArrowRight />
          </Button>
        </div>
        <p className="site-credit mt-14 border-t border-border pt-7 text-center">
          Powered by BrewLoop by ThreeTails
        </p>
      </section>
    </main>
  );
}
