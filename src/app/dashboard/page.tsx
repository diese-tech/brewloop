import {
  ArrowUpRight,
  CheckCircle2,
  ShoppingBag,
  UserRoundPlus,
  Users,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoLoyaltyAccounts, demoOrders } from "@/lib/demo-data";

const metrics = [
  { label: "Orders today", value: demoOrders.length + 45, icon: ShoppingBag },
  { label: "Sales today", value: "$482", icon: ArrowUpRight },
  { label: "New regulars", value: 7, icon: UserRoundPlus },
  {
    label: "Loyalty members",
    value: demoLoyaltyAccounts.length + 124,
    icon: WalletCards,
  },
];

const hours = [32, 48, 64, 42, 78, 92, 70, 51];

export default function DashboardPage() {
  return (
    <div>
      <p className="catalog-label">The Black Rabbit · owner portal</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight">
            Good evening, Dustin.
          </h1>
          <p className="mt-2 text-muted-foreground">
            The bar closes in three hours. Here’s how the day is moving.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">View live orders</Button>
          <Button>Edit menu</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="catalog-label">{label}</CardTitle>
              <Icon className="size-4 text-[var(--brass-bright)]" />
            </CardHeader>
            <CardContent className="font-heading text-5xl font-semibold">
              {value}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Today at a glance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-3 border-b border-border pb-6">
              {hours.map((height, index) => (
                <div
                  key={index}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-[var(--brass-bright)]"
                    style={{ height: `${height}%` }}
                  />
                  <span className="font-mono text-[0.58rem] text-muted-foreground">
                    {7 + index}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Pilot checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "QR portal branded",
              "Paid checkout preview",
              "Staff board tested",
              "First loyalty signups",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--success)]" />
                  {item}
                </span>
                <Badge variant="outline">Done</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-2xl">Recent loyalty signups</CardTitle>
          <Users className="size-5 text-[var(--brass-bright)]" />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {demoLoyaltyAccounts.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <span className="font-heading text-lg">{customer.name}</span>
              <span className="catalog-label">{customer.visits} moons</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
