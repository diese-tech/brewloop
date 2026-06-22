"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, MoonStar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loyaltyProgress } from "@/lib/commerce";
import { demoStore } from "@/lib/demo-store";
import type { Cafe } from "@/lib/types";

export function RewardsPanel({ cafe }: { cafe: Cafe }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [visits, setVisits] = useState<number | null>(null);

  function findOrJoin() {
    if (!contact.trim()) return;
    const accounts = demoStore.getLoyalty();
    const normalized = contact.trim().toLowerCase();
    const existing = accounts.find(
      (account) =>
        account.email.toLowerCase() === normalized || account.phone === contact.trim(),
    );
    if (existing) {
      setName(existing.name);
      setVisits(existing.visits);
      return;
    }
    const isEmail = contact.includes("@");
    const account = {
      id: crypto.randomUUID(),
      cafeId: cafe.id,
      name: name.trim() || "Bookbar regular",
      email: isEmail ? contact.trim() : "",
      phone: isEmail ? "" : contact.trim(),
      visits: 1,
      points: 10,
    };
    demoStore.setLoyalty([account, ...accounts]);
    setVisits(1);
  }

  const progress = visits === null ? null : loyaltyProgress(visits);
  const current = progress?.current ?? 7;

  return (
    <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
      <Card className="parchment-card">
        <CardHeader>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Your moon card
          </span>
          <CardTitle className="mt-2 text-4xl text-[var(--ink)]">
            {progress
              ? `Welcome, ${name || "regular"}.`
              : `${10 - current} moons from a free pour.`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) =>
              index < current ? (
                <span key={index} className="moon-stamp" />
              ) : (
                <span key={index} className="moon-stamp-empty" />
              ),
            )}
          </div>
          <p className="mt-7 text-sm leading-6 text-[var(--ink-muted)]">
            Collect 10 moons and the next drink is on the house. One moon is
            added with every qualifying visit.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <MoonStar className="size-6 text-[var(--brass-bright)]" />
          <CardTitle className="mt-2 text-3xl">Join / check rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reward-contact">Phone or email</Label>
            <Input
              id="reward-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="(352) 555-0148"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-name">Name (optional)</Label>
            <Input
              id="reward-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="What should we call you?"
            />
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="size-3.5" /> No app. No password. Just moons.
          </p>
          <Button
            className="h-11 w-full"
            disabled={!contact.trim()}
            onClick={findOrJoin}
          >
            Join / check rewards
          </Button>
          <Button asChild variant="link" className="w-full text-muted-foreground">
            <Link href={`/cafe/${cafe.slug}/order`}>
              Skip — just let me order →
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
