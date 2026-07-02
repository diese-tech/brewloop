"use client";

import { useEffect, useState } from "react";
import { Download, MoonStar } from "lucide-react";

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
import { loyaltyProgress } from "@/lib/commerce";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import type { LoyaltyAccount } from "@/lib/types";

export function CustomersPanel({
  demoMode,
  initialAccounts,
}: {
  demoMode: boolean;
  initialAccounts: LoyaltyAccount[];
}) {
  const [accounts, setAccounts] = useState(initialAccounts);

  useEffect(() => {
    if (!demoMode) return;
    const sync = () => setAccounts(demoStore.getLoyalty());
    sync();
    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [demoMode]);

  const headline =
    accounts.length === 0
      ? "No regulars yet."
      : accounts.length === 1
        ? "1 regular & counting."
        : `${accounts.length} regulars & counting.`;

  return (
    <div>
      <p className="eyebrow">Customer relationships · no app required</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-semibold tracking-tight">{headline}</h1>
        <Button variant="outline" disabled>
          <Download /> Export CSV · soon
        </Button>
      </div>
      {accounts.length === 0 ? (
        <Card className="mt-8 border-dashed bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <MoonStar
              className="size-8 text-[var(--brass-bright)]"
              aria-hidden="true"
            />
            <p className="font-heading text-2xl">The guest book is empty.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Customers land here as soon as they join rewards from the QR
              menu or the rewards page. Share the rewards QR at the counter to
              start collecting regulars.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-8">
          <CardContent className="pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Reward progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((customer) => {
                  const progress = loyaltyProgress(customer.visits);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <span className="flex items-center gap-3 font-heading text-xl">
                          <span
                            className={`moon-stamp size-8 ${
                              customer.visits > 0
                                ? "moon-stamp--filled"
                                : "moon-stamp--empty"
                            }`}
                            aria-hidden="true"
                          />
                          {customer.name}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {customer.email || customer.phone || "—"}
                      </TableCell>
                      <TableCell className="font-mono">
                        {customer.visits}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-[var(--brass-bright)]"
                              style={{
                                width: `${
                                  (progress.current / progress.threshold) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {progress.current}/{progress.threshold}
                            {progress.rewardsEarned > 0 &&
                              ` · ${progress.rewardsEarned} reward${
                                progress.rewardsEarned === 1 ? "" : "s"
                              } ready`}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
