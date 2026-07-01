"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AcceptingOrdersToggle({
  initialValue,
  canEdit,
}: {
  initialValue: boolean;
  canEdit: boolean;
}) {
  const [acceptingOrders, setAcceptingOrders] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setError("");
    setBusy(true);
    const next = !acceptingOrders;
    try {
      const response = await fetch("/api/cafe/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptingOrders: next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to update.");
      setAcceptingOrders(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">
          {acceptingOrders ? "Accepting online orders" : "Online ordering paused"}
        </p>
        <p className="text-sm text-muted-foreground">
          Customers see a closed-menu state on the order page while paused.
        </p>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
      {canEdit ? (
        <Button
          variant={acceptingOrders ? "outline" : "default"}
          disabled={busy}
          onClick={() => void toggle()}
        >
          {busy ? "Saving…" : acceptingOrders ? "Pause ordering" : "Resume ordering"}
        </Button>
      ) : (
        <Badge variant="outline">Owner-only</Badge>
      )}
    </div>
  );
}
