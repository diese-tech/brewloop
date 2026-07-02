"use client";

import { useEffect, useState } from "react";
import { Gift, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyRedemption,
  canRedeemReward,
  loyaltyProgress,
  REWARD_VISIT_THRESHOLD,
} from "@/lib/commerce";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";

type RewardMetrics = {
  members: number;
  ready: number;
  redeemed: number;
};

type MemberResult = {
  accountId: string | null;
  name: string;
  email: string;
  phone: string;
  visits: number;
  points: number;
};

function readyRewards(visits: number) {
  return loyaltyProgress(visits).rewardsEarned;
}

export function RewardsManager({
  demoMode,
  initialMetrics,
}: {
  demoMode: boolean;
  initialMetrics: RewardMetrics;
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [query, setQuery] = useState("");
  const [member, setMember] = useState<MemberResult | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!demoMode) return;
    const sync = () => {
      const accounts = demoStore.getLoyalty();
      setMetrics({
        members: accounts.length,
        ready: accounts.reduce(
          (total, account) => total + readyRewards(account.visits),
          0,
        ),
        redeemed: demoStore.getRedeemedCount(),
      });
    };
    sync();
    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [demoMode]);

  async function lookUpMember() {
    const normalized = query.trim();
    if (!normalized) return;
    setError("");
    setNotice("");
    setMember(null);
    if (demoMode) {
      const accounts = demoStore.getLoyalty();
      const match = accounts.find(
        (account) =>
          account.email.toLowerCase() === normalized.toLowerCase() ||
          account.phone === normalized,
      );
      if (!match) {
        setError("No member found.");
        return;
      }
      setMember({
        accountId: match.id,
        name: match.name,
        email: match.email,
        phone: match.phone,
        visits: match.visits,
        points: match.points,
      });
      return;
    }
    setLookingUp(true);
    try {
      const response = await fetch(
        `/api/loyalty/members?q=${encodeURIComponent(normalized)}`,
      );
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "Unable to look up member.");
        return;
      }
      setMember(body.member);
    } catch {
      setError("Unable to look up member.");
    } finally {
      setLookingUp(false);
    }
  }

  async function redeemReward() {
    if (!member?.accountId || !canRedeemReward(member.visits)) return;
    setError("");
    if (demoMode) {
      const accounts = demoStore.getLoyalty();
      const match = accounts.find((account) => account.id === member.accountId);
      if (!match || !canRedeemReward(match.visits)) {
        setError("This card just changed — look the member up again.");
        return;
      }
      const next = applyRedemption(match);
      demoStore.setLoyalty(
        accounts.map((account) =>
          account.id === match.id ? { ...account, ...next } : account,
        ),
      );
      demoStore.setRedeemedCount(demoStore.getRedeemedCount() + 1);
      setMember({ ...member, ...next });
      setNotice(`Reward redeemed — ${member.name}'s next drink is on the house.`);
      return;
    }
    setRedeeming(true);
    try {
      const response = await fetch("/api/loyalty/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: member.accountId }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "Unable to redeem reward.");
        return;
      }
      setMember({ ...member, ...body.account });
      setMetrics((current) => ({
        ...current,
        ready: Math.max(0, current.ready - 1),
        redeemed: current.redeemed + 1,
      }));
      setNotice(`Reward redeemed — ${member.name}'s next drink is on the house.`);
    } catch {
      setError("Unable to redeem reward.");
    } finally {
      setRedeeming(false);
    }
  }

  const progress = member ? loyaltyProgress(member.visits) : null;
  const eligible = member !== null && canRedeemReward(member.visits);
  // A member holding one or more full cards sees a complete card to spend,
  // not just the remainder toward the next one.
  const filledStamps = progress
    ? eligible
      ? progress.threshold
      : progress.current
    : 0;
  const metricCards: Array<[string, number]> = [
    ["Members", metrics.members],
    ["Rewards earned", metrics.ready + metrics.redeemed],
    ["Redeemed", metrics.redeemed],
    ["Ready to redeem", metrics.ready],
  ];

  return (
    <div>
      <p className="eyebrow">Loyalty program · active</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight">Rewards</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="eyebrow">{label}</CardTitle>
            </CardHeader>
            <CardContent className="font-heading text-5xl font-semibold">
              {value}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <Gift className="size-5 text-[var(--brass-bright)]" />
            <CardTitle className="mt-2 text-3xl">Visit moon card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-xl text-muted-foreground">
              One moon per visit. A full card earns one drink on the house.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {Array.from({ length: REWARD_VISIT_THRESHOLD }).map((_, index) => (
                <span key={index} className="moon-stamp moon-stamp--filled" />
              ))}
              <Badge className="ml-2 self-center">→ 1 free drink</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Redeem a reward</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="reward-lookup" className="sr-only">
                Phone or email
              </Label>
              <Input
                id="reward-lookup"
                placeholder="Phone or email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void lookUpMember();
                }}
              />
              <Button
                className="w-full"
                disabled={!query.trim() || lookingUp}
                onClick={() => void lookUpMember()}
              >
                <Search /> {lookingUp ? "Looking up…" : "Look up member"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {notice && (
                <p className="text-sm text-[var(--brass-bright)]">{notice}</p>
              )}
            </CardContent>
          </Card>

          {member && progress && (
            <Card className="card card--parchment">
              <CardHeader>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Member card
                </span>
                <CardTitle className="mt-1 text-3xl text-[var(--ink)]">
                  {member.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-mono text-xs text-[var(--ink-muted)]">
                  {member.email || member.phone || "No contact on file"} ·{" "}
                  {member.visits} visit{member.visits === 1 ? "" : "s"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: progress.threshold }).map((_, index) => (
                    <span
                      key={index}
                      className={`moon-stamp size-7 ${
                        index < filledStamps
                          ? "moon-stamp--filled"
                          : "moon-stamp--empty"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[var(--ink-muted)]">
                  {eligible
                    ? "Full card — the next drink is on the house."
                    : `${
                        progress.threshold - progress.current
                      } more moons to the next reward.`}
                </p>
                <Button
                  className="w-full"
                  disabled={!eligible || redeeming || !member.accountId}
                  onClick={() => void redeemReward()}
                >
                  <Gift /> {redeeming ? "Redeeming…" : "Redeem reward"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="pt-5 text-sm text-muted-foreground">
              <p className="eyebrow mb-3">Coming in v1.5</p>
              Points-per-order · configurable thresholds · manual visit
              adjustment
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
