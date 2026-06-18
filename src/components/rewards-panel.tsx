"use client";

import { useState } from "react";
import { Check, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loyaltyProgress } from "@/lib/commerce";
import { demoStore } from "@/lib/demo-store";
import type { Cafe } from "@/lib/types";

export function RewardsPanel({ cafe }: { cafe: Cafe }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [visits, setVisits] = useState<number | null>(null);

  function findOrJoin() {
    if (!email.trim() && !phone.trim()) return;
    const accounts = demoStore.getLoyalty();
    const existing = accounts.find(
      (account) =>
        (email && account.email.toLowerCase() === email.toLowerCase()) ||
        (phone && account.phone === phone),
    );
    if (existing) {
      setName(existing.name);
      setVisits(existing.visits);
      return;
    }
    const account = {
      id: crypto.randomUUID(),
      cafeId: cafe.id,
      name: name.trim() || "Coffee regular",
      email: email.trim(),
      phone: phone.trim(),
      visits: 1,
      points: 10,
    };
    demoStore.setLoyalty([account, ...accounts]);
    setVisits(1);
  }

  const progress = visits === null ? null : loyaltyProgress(visits);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Find or join your rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reward-name">Name</Label>
            <Input
              id="reward-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-email">Email</Label>
            <Input
              id="reward-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-phone">Phone</Label>
            <Input
              id="reward-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={!email.trim() && !phone.trim()}
            onClick={findOrJoin}
          >
            Check progress
          </Button>
        </CardContent>
      </Card>
      <Card className="overflow-hidden bg-primary text-primary-foreground">
        <CardHeader>
          <Gift className="size-7" />
          <CardTitle className="text-2xl">
            {progress ? `Welcome, ${name || "regular"}` : "Your next cup counts"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress ? (
            <>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: progress.threshold }).map((_, index) => (
                  <span
                    key={index}
                    className={`flex aspect-square items-center justify-center rounded-full border ${
                      index < progress.current
                        ? "bg-primary-foreground text-primary"
                        : "border-primary-foreground/45"
                    }`}
                  >
                    {index < progress.current && <Check className="size-4" />}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm text-primary-foreground/80">
                {progress.threshold - progress.current} visits until your next
                reward. Rewards earned so far: {progress.rewardsEarned}.
              </p>
            </>
          ) : (
            <p className="max-w-sm text-primary-foreground/80">
              Join with a phone number or email. No app download and no separate
              customer account required.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
