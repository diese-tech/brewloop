import Link from "next/link";
import { ArrowRight, QrCode, Repeat2, Users } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: QrCode,
    title: "Scan and order",
    copy: "A branded, mobile-first menu with table or pickup checkout.",
  },
  {
    icon: Users,
    title: "Know your regulars",
    copy: "Phone or email loyalty capture without forcing a customer account.",
  },
  {
    icon: Repeat2,
    title: "Build the return visit",
    copy: "Moon-stamp rewards give every guest a reason to come back.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-center px-6 py-20">
        <div className="mb-10">
          <BrandMark />
        </div>
        <div className="max-w-4xl">
          <p className="eyebrow mb-4">
            Black Rabbit pilot · Powered by BrewLoop
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            A candlelit café experience, software second.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Preview the full Black Rabbit pilot: QR ordering, paid checkout,
            loyalty, staff operations, and owner tools in one branded system.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/cafe/black-rabbit">
                Enter the rabbit hole <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/staff/orders">View staff board</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-card/70">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }) => (
            <Card key={title} className="bg-background/70 shadow-none">
              <CardHeader>
                <Icon className="size-5 text-[var(--brass-bright)]" />
                <CardTitle className="mt-3 text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {copy}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
