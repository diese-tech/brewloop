"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/commerce";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import type { CafeOrder, OrderStatus } from "@/lib/types";

const columns: Array<{ status: OrderStatus; label: string }> = [
  { status: "new", label: "New" },
  { status: "making", label: "Making" },
  { status: "ready", label: "Ready" },
  { status: "completed", label: "Completed" },
];

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "making",
  making: "ready",
  ready: "completed",
};

export function StaffBoard() {
  const [orders, setOrders] = useState<CafeOrder[]>([]);

  useEffect(() => {
    const sync = () => setOrders(demoStore.getOrders());
    sync();
    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function advance(order: CafeOrder) {
    const status = nextStatus[order.status];
    if (!status) return;
    const updated = orders.map((candidate) =>
      candidate.id === order.id ? { ...candidate, status } : candidate,
    );
    setOrders(updated);
    demoStore.setOrders(updated);
  }

  return (
    <div className="grid min-w-[70rem] grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnOrders = orders.filter(
          (order) => order.status === column.status,
        );
        return (
          <section key={column.status} className="rounded-xl bg-muted/55 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em]">
                <span
                  className={`size-2 rounded-full ${
                    column.status === "new"
                      ? "bg-[var(--warning)]"
                      : column.status === "making"
                        ? "bg-primary"
                        : column.status === "ready"
                          ? "bg-[var(--success)]"
                          : "bg-muted-foreground"
                  }`}
                />
                {column.label}
              </h2>
              <Badge variant="secondary">{columnOrders.length}</Badge>
            </div>
            <div className="space-y-3">
              {columnOrders.map((order) => (
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
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-mono">
                        {formatCurrency(order.totalCents)}{" "}
                        {order.paymentStatus === "paid" ? "paid" : "due"}
                      </span>
                    </div>
                    {nextStatus[order.status] && (
                      <Button className="w-full" onClick={() => advance(order)}>
                        Mark {nextStatus[order.status]}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
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
  );
}
