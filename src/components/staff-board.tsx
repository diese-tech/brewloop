"use client";

import { useEffect, useState } from "react";
import { Clock3, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/commerce";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CafeOrder, OrderStatus } from "@/lib/types";

type Column = { key: string; status: OrderStatus | "problem"; label: string };

const columns: Column[] = [
  { key: "new", status: "new", label: "New" },
  { key: "making", status: "making", label: "Making" },
  { key: "ready", status: "ready", label: "Ready" },
  { key: "completed", status: "completed", label: "Completed" },
  { key: "problem", status: "problem", label: "Problems" },
];

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "making",
  making: "ready",
  ready: "completed",
};

const PAYMENT_LABEL: Record<
  NonNullable<CafeOrder["paymentStatus"]>,
  string
> = {
  paid: "paid",
  pending: "payment pending",
  failed: "payment failed",
  refunded: "refunded",
  unpaid: "unpaid",
};

const OPEN_STATUSES = new Set<OrderStatus>(["new", "making", "ready"]);

function isProblemOrder(order: CafeOrder) {
  return (
    order.status === "cancelled" ||
    order.paymentStatus === "failed" ||
    order.paymentStatus === "refunded"
  );
}

function ageMinutes(createdAt: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000));
}

export function StaffBoard({
  cafeId,
  demoMode,
  initialOrders,
}: {
  cafeId: string;
  demoMode: boolean;
  initialOrders: CafeOrder[];
}) {
  const [orders, setOrders] = useState<CafeOrder[]>(initialOrders);
  const [connected, setConnected] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (demoMode) {
      const sync = () => setOrders(demoStore.getOrders());
      sync();
      window.addEventListener(STORE_EVENT, sync);
      window.addEventListener("storage", sync);
      return () => {
        window.removeEventListener(STORE_EVENT, sync);
        window.removeEventListener("storage", sync);
      };
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const sync = async () => {
      try {
        const response = await fetch("/api/staff/orders");
        if (response.ok) {
          setOrders((await response.json()).orders);
          setConnected(true);
        }
      } catch {
        setConnected(false);
      }
    };
    const channel = supabase
      .channel(`staff-orders:${cafeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `cafe_id=eq.${cafeId}` },
        () => void sync(),
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });
    sync();
    return () => { void supabase.removeChannel(channel); };
  }, [cafeId, demoMode]);

  async function advance(order: CafeOrder) {
    const status = nextStatus[order.status];
    if (!status) return;
    const updated = orders.map((candidate) =>
      candidate.id === order.id ? { ...candidate, status } : candidate,
    );
    setOrders(updated);
    if (demoMode) {
      demoStore.setOrders(updated);
      return;
    }
    const response = await fetch("/api/staff/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status }),
    });
    if (!response.ok) setOrders(orders);
  }

  const openCount = orders.filter(
    (order) => OPEN_STATUSES.has(order.status) && !isProblemOrder(order),
  ).length;

  return (
    <div>
      <p className="eyebrow mb-4">{openCount} open now</p>
      {!demoMode && !connected && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <WifiOff className="size-4 shrink-0" />
          Live updates paused — reconnecting… New orders may not appear
          automatically until this resolves.
        </p>
      )}
      <div className="grid min-w-[85rem] grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnOrders = orders.filter((order) =>
            column.status === "problem"
              ? isProblemOrder(order)
              : order.status === column.status && !isProblemOrder(order),
          );
          return (
            <section key={column.key} className="rounded-xl bg-muted/55 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em]">
                  <span
                    className={`status-dot status-dot--${
                      column.status === "problem" ? "cancelled" : column.status
                    }`}
                  />
                  {column.label}
                </h2>
                <Badge variant="secondary">{columnOrders.length}</Badge>
              </div>
              <div className="space-y-3">
                {columnOrders.map((order) => {
                  const minutes = ageMinutes(order.createdAt, now);
                  const isAging =
                    (order.status === "new" || order.status === "making") &&
                    minutes >= 15;
                  return (
                    <Card key={order.id} className="bg-card shadow-sm">
                      <CardHeader className="gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">
                            {order.customerName}
                          </CardTitle>
                          <span className="font-mono text-xs text-muted-foreground">
                            {order.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline">{order.orderType}</Badge>
                          {order.tableNumber && (
                            <Badge variant="outline">
                              Table {order.tableNumber}
                            </Badge>
                          )}
                          {order.status === "cancelled" && (
                            <Badge variant="destructive">Cancelled</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1 text-sm">
                          {order.items.map((item) => (
                            <p key={`${order.id}-${item.menuItemId}`}>
                              {item.quantity}× {item.nameSnapshot}
                            </p>
                          ))}
                        </div>
                        {order.notes && (
                          <p className="rounded-md bg-secondary p-2 text-xs">
                            {order.notes}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`flex items-center gap-1 ${
                              isAging
                                ? "font-semibold text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Clock3 className="size-3" />
                            {minutes < 1 ? "just now" : `${minutes}m ago`}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {formatCurrency(order.totalCents)}{" "}
                            {order.paymentStatus
                              ? PAYMENT_LABEL[order.paymentStatus]
                              : "due"}
                          </span>
                        </div>
                        {nextStatus[order.status] && !isProblemOrder(order) && (
                          <Button
                            size="lg"
                            className="w-full"
                            onClick={() => void advance(order)}
                          >
                            Mark {nextStatus[order.status]}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {!columnOrders.length && (
                  <div className="rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground">
                    No {column.label.toLowerCase()} orders
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
