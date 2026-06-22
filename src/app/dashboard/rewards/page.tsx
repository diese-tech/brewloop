import { Gift, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const metrics = [
  ["Members", "126"],
  ["Rewards earned", "34"],
  ["Redeemed", "27"],
  ["Outstanding", "7"],
];

export default function DashboardRewardsPage() {
  return (
    <div>
      <p className="catalog-label">Loyalty program · active</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight">Rewards</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="catalog-label">{label}</CardTitle>
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
              {Array.from({ length: 10 }).map((_, index) => (
                <span key={index} className="moon-stamp" />
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
              <Input placeholder="Phone or email" />
              <Button className="w-full">
                <Search /> Look up member
              </Button>
            </CardContent>
          </Card>
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="pt-5 text-sm text-muted-foreground">
              <p className="catalog-label mb-3">Coming in v1.5</p>
              Points-per-order · configurable thresholds · manual visit
              adjustment
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
