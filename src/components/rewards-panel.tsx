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
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Cafe } from "@/lib/types";

export function RewardsPanel({
  cafe,
  demoMode,
}: {
  cafe: Cafe;
  demoMode: boolean;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [visits, setVisits] = useState<number | null>(null);

  async function findOrJoin() {
    if (!contact.trim()) return;
    setError("");
    if (!demoMode) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase is not configured.");
        return;
      }
      if (!otpSent) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: contact.trim(),
        });
        if (otpError) setError(otpError.message);
        else setOtpSent(true);
        return;
      }
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: contact.trim(),
        token: code.trim(),
        type: "sms",
      });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      const response = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cafeId: cafe.id, name }),
      });
      const account = await response.json();
      if (!response.ok) {
        setError(account.error ?? "Unable to load rewards.");
        return;
      }
      setName(account.name ?? name);
      setVisits(account.visits);
      return;
    }
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
              placeholder={demoMode ? "(352) 555-0148" : "+1 352 555 0148"}
            />
          </div>
          {!demoMode && otpSent && (
            <div className="space-y-2">
              <Label htmlFor="reward-code">Verification code</Label>
              <Input
                id="reward-code"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
          )}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="h-11 w-full"
            disabled={!contact.trim() || (!demoMode && otpSent && !code.trim())}
            onClick={() => void findOrJoin()}
          >
            {!demoMode && otpSent ? "Verify & check rewards" : "Join / check rewards"}
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
