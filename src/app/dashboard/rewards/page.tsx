import { Gift, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardRewardsPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Loyalty settings
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Rewards</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="bg-card/90">
          <CardHeader>
            <Gift className="size-5 text-primary" />
            <CardTitle>Visit punch card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">10 visits</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Current demo threshold
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/90">
          <CardHeader>
            <Users className="size-5 text-primary" />
            <CardTitle>Program status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>Active</Badge>
            <p className="mt-4 text-sm text-muted-foreground">
              Customers may join with phone, email, or both.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 border-dashed bg-transparent shadow-none">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Configurable points, redemption, and manual adjustments are planned
          after the first pilot validates the simple visit model.
        </CardContent>
      </Card>
    </div>
  );
}
