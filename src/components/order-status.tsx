"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/commerce";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import type { CafeOrder, OrderStatus as OrderStatusValue } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatusValue, string> = {
  new: "Order received",
  making: "Being made",
  ready: "Ready for you",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_LABEL: Record<
  NonNullable<CafeOrder["paymentStatus"]>,
  { label: string; variant: "default" | "outline" | "destructive" | "secondary" }
> = {
  paid: { label: "Paid", variant: "default" },
  pending: { label: "Payment pending", variant: "outline" },
  failed: { label: "Payment failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "secondary" },
  unpaid: { label: "Unpaid", variant: "destructive" },
};

const POLL_INTERVAL_MS = 10_000;

export function OrderStatusView({
  slug,
  orderId,
  demoMode,
  cafeName,
}: {
  slug: string;
  orderId: string;
  demoMode: boolean;
  cafeName: string;
}) {
  const [order, setOrder] = useState<CafeOrder | null>(null);
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState("");

  const loadDemoOrder = useCallback(() => {
    const found = demoStore.getOrders().find((candidate) => candidate.id === orderId);
    setOrder(found ?? null);
  }, [orderId]);

  const loadProductionOrder = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/orders/${orderId}?cafeSlug=${encodeURIComponent(slug)}`,
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to load this order.");
        setOrder(null);
        return;
      }
      setError("");
      setOrder(result);
    } catch {
      setError("Unable to reach BrewLoop right now.");
    } finally {
      setLoading(false);
    }
  }, [orderId, slug]);

  useEffect(() => {
    if (demoMode) {
      loadDemoOrder();
      window.addEventListener(STORE_EVENT, loadDemoOrder);
      window.addEventListener("storage", loadDemoOrder);
      return () => {
        window.removeEventListener(STORE_EVENT, loadDemoOrder);
        window.removeEventListener("storage", loadDemoOrder);
      };
    }
    void loadProductionOrder();
    const interval = window.setInterval(() => void loadProductionOrder(), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [demoMode, loadDemoOrder, loadProductionOrder]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl animate-pulse space-y-3 py-10">
        <div className="h-3 w-32 rounded-full bg-muted" />
        <div className="h-10 w-2/3 rounded-lg bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <p className="eyebrow">{cafeName}</p>
        <h1 className="mt-2 text-4xl font-semibold">
          We can&apos;t find that order.
        </h1>
        <p className="mt-3 text-muted-foreground">
          {error || "Double-check the link, or ask staff for help."}
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href={`/cafe/${slug}/order`}>Start a new order</Link>
        </Button>
      </div>
    );
  }

  const payment = order.paymentStatus
    ? PAYMENT_LABEL[order.paymentStatus]
    : undefined;

  return (
    <div className="mx-auto max-w-xl py-4">
      <p className="eyebrow">{cafeName}</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Order #{order.id}
        </h1>
        {!demoMode && (
          <Button
            size="icon"
            variant="outline"
            aria-label="Refresh order status"
            onClick={() => void loadProductionOrder()}
          >
            <RefreshCcw className="size-4" />
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm">
          <span className={`status-dot status-dot--${order.status}`} />
          {STATUS_LABEL[order.status]}
        </span>
        {payment && <Badge variant={payment.variant}>{payment.label}</Badge>}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">
            {order.orderType === "table"
              ? `Table ${order.tableNumber}`
              : "Pickup"}
            {" · "}
            {order.customerName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between gap-4">
                <span>
                  {item.quantity}× {item.nameSnapshot}
                </span>
                <span className="font-mono">
                  {formatCurrency(item.quantity * item.unitPriceCents)}
                </span>
              </div>
            ))}
          </div>
          {order.notes && (
            <p className="rounded-md bg-secondary p-2 text-xs">{order.notes}</p>
          )}
          <div className="space-y-2 border-t pt-3 font-mono text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotalCents ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tip</span>
              <span>{formatCurrency(order.tipCents ?? 0)}</span>
            </div>
            {(order.taxCents ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.taxCents ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(order.totalCents)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button asChild size="lg" variant="outline" className="mt-6 w-full">
        <Link href={`/cafe/${slug}`}>Back to {cafeName}</Link>
      </Button>
    </div>
  );
}
