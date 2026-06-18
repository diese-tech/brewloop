import Link from "next/link";
import { ArrowRight, Coffee, QrCode, Repeat2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: QrCode,
    title: "Scan and order",
    copy: "A mobile-first café menu for pickup or table service.",
  },
  {
    icon: Users,
    title: "Know your regulars",
    copy: "Capture phone or email without forcing a full customer account.",
  },
  {
    icon: Repeat2,
    title: "Build the return visit",
    copy: "Simple loyalty progress that gives guests a reason to come back.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-center px-6 py-20">
        <div className="mb-8 flex items-center gap-3 text-sm font-medium">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Coffee className="size-5" />
          </span>
          BrewLoop
        </div>
        <div className="max-w-4xl">
          <p className="mb-4 font-mono text-sm uppercase tracking-[0.24em] text-muted-foreground">
            QR ordering + loyalty for local cafés
          </p>
          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
            Turn a counter visit into a customer relationship.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            BrewLoop gives independent cafés a branded menu, lightweight order
            queue, and loyalty loop without replacing the register.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/cafe/demo-coffee">
                Open the demo café <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/staff/orders">View staff board</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="border-y bg-card/70">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 md:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }) => (
            <Card key={title} className="bg-background/80 shadow-none">
              <CardHeader>
                <Icon className="size-5 text-primary" />
                <CardTitle className="mt-3">{title}</CardTitle>
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
