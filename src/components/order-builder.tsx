"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateOrderTotal, formatCurrency } from "@/lib/commerce";
import { demoStore } from "@/lib/demo-store";
import type { Cafe, CafeOrder, OrderType } from "@/lib/types";

export function OrderBuilder({
  cafe,
  initialTable,
}: {
  cafe: Cafe;
  initialTable?: string;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderType, setOrderType] = useState<OrderType>(
    initialTable ? "table" : "pickup",
  );
  const [tableNumber, setTableNumber] = useState(initialTable ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const orderItems = useMemo(
    () =>
      cafe.items
        .filter((item) => item.isActive && quantities[item.id])
        .map((item) => ({
          menuItemId: item.id,
          nameSnapshot: item.name,
          quantity: quantities[item.id],
          unitPriceCents: item.priceCents,
        })),
    [cafe.items, quantities],
  );
  const total = calculateOrderTotal(orderItems);

  function changeQuantity(itemId: string, change: number) {
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(0, (current[itemId] ?? 0) + change),
    }));
    setConfirmation(null);
  }

  function submitOrder() {
    if (!customerName.trim() || orderItems.length === 0) return;
    if (orderType === "table" && !tableNumber.trim()) return;

    const id = `BL-${Math.floor(1000 + Math.random() * 9000)}`;
    const order: CafeOrder = {
      id,
      cafeId: cafe.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      status: "new",
      orderType,
      tableNumber: orderType === "table" ? tableNumber.trim() : undefined,
      notes: notes.trim(),
      totalCents: total,
      items: orderItems,
      createdAt: new Date().toISOString(),
    };
    demoStore.setOrders([order, ...demoStore.getOrders()]);
    setQuantities({});
    setNotes("");
    setConfirmation(id);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-10">
        {cafe.categories.map((category) => {
          const items = cafe.items.filter(
            (item) => item.categoryId === category.id && item.isActive,
          );
          return (
            <section key={category.id}>
              <h2 className="mb-4 text-2xl font-semibold">{category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <Card key={item.id} className="bg-card/90 shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle>{item.name}</CardTitle>
                        <Badge variant="secondary">
                          {formatCurrency(item.priceCents)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="min-h-12 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-5 flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label={`Remove one ${item.name}`}
                        >
                          <Minus />
                        </Button>
                        <span className="w-8 text-center font-mono text-sm">
                          {quantities[item.id] ?? 0}
                        </span>
                        <Button
                          size="icon"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label={`Add one ${item.name}`}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <aside>
        <Card className="sticky top-6 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" /> Your order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {orderItems.length ? (
              <div className="space-y-2 text-sm">
                {orderItems.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex justify-between gap-4"
                  >
                    <span>
                      {item.quantity}× {item.nameSnapshot}
                    </span>
                    <span className="font-mono">
                      {formatCurrency(item.quantity * item.unitPriceCents)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-3 font-semibold">
                  <span>Total due at café</span>
                  <span className="font-mono">{formatCurrency(total)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add an item to start your order.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={orderType === "pickup" ? "default" : "outline"}
                onClick={() => setOrderType("pickup")}
              >
                Pickup
              </Button>
              <Button
                variant={orderType === "table" ? "default" : "outline"}
                onClick={() => setOrderType("table")}
              >
                Table
              </Button>
            </div>
            {orderType === "table" && (
              <div className="space-y-2">
                <Label htmlFor="table">Table number</Label>
                <Input
                  id="table"
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Name for the order"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="For order updates"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Oat milk, no whip…"
              />
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={
                !orderItems.length ||
                !customerName.trim() ||
                (orderType === "table" && !tableNumber.trim())
              }
              onClick={submitOrder}
            >
              Place order
            </Button>
            {confirmation && (
              <div className="rounded-lg bg-secondary p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Check className="size-4" /> Order {confirmation} received
                </p>
                <Button asChild variant="link" className="h-auto px-0 pt-2">
                  <Link href="/cafe/demo-coffee/rewards">
                    Join rewards while you wait
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
