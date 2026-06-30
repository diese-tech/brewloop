import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoLoyaltyAccounts } from "@/lib/demo-data";

export default function DashboardCustomersPage() {
  return (
    <div>
      <p className="eyebrow">Customer relationships · no app required</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-semibold tracking-tight">
          126 regulars & counting.
        </h1>
        <Button variant="outline" disabled>
          <Download /> Export CSV · soon
        </Button>
      </div>
      <Card className="mt-8">
        <CardContent className="pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Reward progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoLoyaltyAccounts.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <span className="flex items-center gap-3 font-heading text-xl">
                      <span className="moon-stamp moon-stamp--filled size-8" aria-hidden="true" />
                      {customer.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {customer.email || customer.phone}
                  </TableCell>
                  <TableCell className="font-mono">{customer.visits}</TableCell>
                  <TableCell>{index ? "Yesterday" : "Today"}</TableCell>
                  <TableCell>
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[var(--brass-bright)]"
                        style={{ width: `${customer.visits * 10}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
