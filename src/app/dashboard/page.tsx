import { ShoppingBag, UserRoundPlus, Users, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoLoyaltyAccounts, demoOrders } from "@/lib/demo-data";

const metrics = [
  {
    label: "Orders today",
    value: demoOrders.length + 16,
    icon: ShoppingBag,
  },
  { label: "New customers", value: 7, icon: UserRoundPlus },
  { label: "Known customers", value: 128, icon: Users },
  {
    label: "Loyalty members",
    value: demoLoyaltyAccounts.length + 84,
    icon: WalletCards,
  },
];

export default function DashboardPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Demo Coffee
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Today at a glance
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-card/90">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent className="font-mono text-4xl font-semibold">
              {value}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6 bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Customer capture is the signal</CardTitle>
        </CardHeader>
        <CardContent className="max-w-2xl text-sm leading-6 text-primary-foreground/80">
          This dashboard intentionally focuses on orders, customers, and loyalty
          instead of payments or register reconciliation. BrewLoop complements
          the café’s existing POS in v1.
        </CardContent>
      </Card>
    </div>
  );
}
