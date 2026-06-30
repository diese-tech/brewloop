"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateOrderTotal, formatCurrency } from "@/lib/commerce";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import type {
  Cafe,
  CafeOrder,
  MenuCategory,
  OrderType,
} from "@/lib/types";

type Stage = "menu" | "checkout" | "confirmed";
type SquareCard = {
  attach(selector: string): Promise<void>;
  tokenize(): Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>;
};

declare global {
  interface Window {
    Square?: {
      payments(applicationId: string, locationId: string): Promise<{
        card(): Promise<SquareCard>;
      }>;
    };
  }
}

export function OrderBuilder({
  cafe,
  initialTable,
  tableSignature = "",
  demoMode,
  square,
}: {
  cafe: Cafe;
  initialTable?: string;
  tableSignature?: string;
  demoMode: boolean;
  square: {
    applicationId: string;
    locationId: string;
    environment: "sandbox" | "production";
  };
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderType, setOrderType] = useState<OrderType>(
    initialTable ? "table" : "pickup",
  );
  const [tableNumber, setTableNumber] = useState(initialTable ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<Stage>("menu");
  const [tipPercent, setTipPercent] = useState(18);
  const [confirmation, setConfirmation] = useState<CafeOrder | null>(null);
  const [menuItems, setMenuItems] = useState(cafe.items);
  const [categories, setCategories] = useState<MenuCategory[]>(cafe.categories);
  const [paymentError, setPaymentError] = useState("");
  const [paying, setPaying] = useState(false);
  const squareCard = useRef<SquareCard | null>(null);
  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    if (!demoMode) return;
    const syncMenu = () => {
      setMenuItems(demoStore.getMenu());
      setCategories(demoStore.getCategories());
    };
    syncMenu();
    window.addEventListener(STORE_EVENT, syncMenu);
    window.addEventListener("storage", syncMenu);
    return () => {
      window.removeEventListener(STORE_EVENT, syncMenu);
      window.removeEventListener("storage", syncMenu);
    };
  }, [demoMode]);

  useEffect(() => {
    if (demoMode || stage !== "checkout" || squareCard.current) return;
    if (!square.applicationId || !square.locationId) {
      setPaymentError("Square is not configured.");
      return;
    }
    const scriptUrl = square.environment === "production"
      ? "https://web.squarecdn.com/v1/square.js"
      : "https://sandbox.web.squarecdn.com/v1/square.js";
    const setup = async () => {
      if (!window.Square) return;
      const payments = await window.Square.payments(
        square.applicationId,
        square.locationId,
      );
      squareCard.current = await payments.card();
      await squareCard.current.attach("#square-card");
    };
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${scriptUrl}"]`,
    );
    if (existing) {
      void setup().catch((error) => setPaymentError(String(error)));
      return;
    }
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.onload = () => void setup().catch((error) => setPaymentError(String(error)));
    script.onerror = () => setPaymentError("Square checkout failed to load.");
    document.head.appendChild(script);
  }, [demoMode, square, stage]);

  const orderItems = useMemo(
    () =>
      menuItems
        .filter((item) => item.isActive && quantities[item.id])
        .map((item) => ({
          menuItemId: item.id,
          nameSnapshot: item.name,
          quantity: quantities[item.id],
          unitPriceCents: item.priceCents,
        })),
    [menuItems, quantities],
  );
  const subtotal = calculateOrderTotal(orderItems);
  const tip = Math.round(subtotal * (tipPercent / 100));
  const total = subtotal + tip;
  const canCheckout =
    orderItems.length > 0 &&
    customerName.trim() &&
    (orderType === "pickup" || tableNumber.trim());
  const canUseTable = demoMode || Boolean(initialTable && tableSignature);

  function changeQuantity(itemId: string, change: number) {
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(0, (current[itemId] ?? 0) + change),
    }));
  }

  async function submitOrder() {
    if (!canCheckout) return;

    setPaymentError("");
    setPaying(true);
    if (!demoMode) {
      try {
        const tokenResult = await squareCard.current?.tokenize();
        if (tokenResult?.status !== "OK" || !tokenResult.token) {
          throw new Error(
            tokenResult?.errors?.[0]?.message ?? "Enter valid card details.",
          );
        }
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cafeId: cafe.id,
            cafeSlug: cafe.slug,
            idempotencyKey: idempotencyKey.current,
            customerName,
            customerPhone,
            notes,
            orderType,
            tableNumber,
            tableSignature,
            tipCents: tip,
            sourceId: tokenResult.token,
            items: orderItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })),
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Checkout failed.");
        setConfirmation({
          id: result.id,
          cafeId: cafe.id,
          customerName: result.customerName,
          customerPhone,
          status: "new",
          orderType: result.orderType,
          tableNumber: result.tableNumber ?? undefined,
          notes,
          subtotalCents: result.subtotalCents,
          taxCents: result.taxCents,
          tipCents: result.tipCents,
          paymentStatus: "paid",
          totalCents: result.totalCents,
          items: result.items,
          createdAt: new Date().toISOString(),
        });
        setStage("confirmed");
      } catch (error) {
        setPaymentError(error instanceof Error ? error.message : "Checkout failed.");
      } finally {
        setPaying(false);
      }
      return;
    }

    const id = `BR-${Math.floor(1000 + Math.random() * 9000)}`;
    const order: CafeOrder = {
      id,
      cafeId: cafe.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      status: "new",
      orderType,
      tableNumber: orderType === "table" ? tableNumber.trim() : undefined,
      notes: notes.trim(),
      subtotalCents: subtotal,
      tipCents: tip,
      paymentStatus: "paid",
      totalCents: total,
      items: orderItems,
      createdAt: new Date().toISOString(),
    };
    demoStore.setOrders([order, ...demoStore.getOrders()]);
    setConfirmation(order);
    setStage("confirmed");
    setPaying(false);
  }

  if (stage === "confirmed" && confirmation) {
    return (
      <div className="mx-auto max-w-xl py-4 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-[var(--brass)] bg-[var(--surface-alt)]">
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--success)] text-background">
            <Check className="size-6" />
          </span>
        </div>
        <p className="eyebrow mt-7">Order received</p>
        <h2 className="mt-2 text-5xl font-semibold">You’re in the queue.</h2>
        <p className="mt-2 font-heading text-xl italic text-muted-foreground">
          We’ll call your name at the bar.
        </p>

        <Card className="card card--parchment mt-8 text-left">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  Order
                </span>
                <CardTitle className="mt-1 text-2xl text-[var(--ink)]">
                  #{confirmation.id}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-[var(--ink-muted)] text-[var(--ink)]"
              >
                Received
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-[var(--ink)]">
            <div className="mb-5 grid grid-cols-2 border-b border-[var(--ink-muted)]/30 pb-4">
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                  Name
                </p>
                <p className="font-heading text-xl">{confirmation.customerName}</p>
              </div>
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                  Seat
                </p>
                <p className="font-heading text-xl">
                  {confirmation.orderType === "table"
                    ? `Table ${confirmation.tableNumber}`
                    : "Pickup"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {confirmation.items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between gap-4">
                  <span className="font-heading text-lg">
                    ×{item.quantity} {item.nameSnapshot}
                  </span>
                  <span className="font-mono text-sm">
                    {formatCurrency(item.quantity * item.unitPriceCents)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-[var(--ink-muted)]/30 pt-4 font-mono text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(confirmation.subtotalCents ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tip</span>
                <span>{formatCurrency(confirmation.tipCents ?? 0)}</span>
              </div>
              {(confirmation.taxCents ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(confirmation.taxCents ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold">
                <span>Total paid</span>
                <span>{formatCurrency(confirmation.totalCents)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="eyebrow mt-5">Est. 8–10 min · Paid · Visa ••42</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Button asChild size="lg">
            <Link href={`/cafe/${cafe.slug}/rewards`}>Check your rewards</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/cafe/${cafe.slug}`}>Back to the bookbar</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "checkout") {
    return (
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => setStage("menu")}>
          <ArrowLeft /> Back to menu
        </Button>
        <p className="eyebrow mt-7">Secure checkout</p>
        <h2 className="mt-2 text-5xl font-semibold">Pay for your order.</h2>

        <Card className="mt-7">
          <CardHeader>
            <CardTitle>Order · {orderType === "table" ? `Table ${tableNumber}` : "Pickup"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.menuItemId} className="flex justify-between gap-4">
                <span className="font-heading text-lg">
                  ×{item.quantity} {item.nameSnapshot}
                </span>
                <span className="font-mono text-sm">
                  {formatCurrency(item.quantity * item.unitPriceCents)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="eyebrow">Add a tip for the bar</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-2">
            {[0, 15, 18, 20].map((percent) => (
              <Button
                key={percent}
                variant={tipPercent === percent ? "default" : "outline"}
                onClick={() => setTipPercent(percent)}
              >
                {percent === 0 ? "No tip" : `${percent}%`}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="eyebrow">Card details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input id="card-number" defaultValue="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input aria-label="Expiration date" defaultValue="09 / 27" />
                  <Input aria-label="Security code" defaultValue="424" />
                  <Input aria-label="Postal code" defaultValue="34711" />
                </div>
                <Input aria-label="Name on card" placeholder="Name on card" />
              </>
            ) : (
              <div id="square-card" className="min-h-24" />
            )}
          </CardContent>
        </Card>

        {paymentError && (
          <p className="mt-4 text-sm text-destructive">{paymentError}</p>
        )}
        <Button
          className="mt-5 h-12 w-full"
          size="lg"
          disabled={paying || (!demoMode && Boolean(paymentError))}
          onClick={() => void submitOrder()}
        >
          <LockKeyhole />{" "}
          {paying
            ? "Processing…"
            : demoMode
              ? `Pay ${formatCurrency(total)}`
              : "Pay securely"}
        </Button>
        {!demoMode && (
          <p className="site-credit mt-4 text-center">
            Square calculates applicable tax before charging your card.
          </p>
        )}
        <p className="site-credit mt-4 text-center">
          Encrypted checkout · Powered by BrewLoop
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-10">
        {[...categories]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => {
            const items = menuItems.filter(
              (item) => item.categoryId === category.id && item.isActive,
            );
            if (!items.length) return null;
            return (
              <section key={category.id}>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-3xl font-semibold">{category.name}</h2>
                  <span className="eyebrow">{items.length} selections</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <Card key={item.id} className="card card--spine bg-card/90">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-2xl">{item.name}</CardTitle>
                          <span className="font-mono text-xs text-[var(--brass-bright)]">
                            {formatCurrency(item.priceCents)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="min-h-10 font-mono text-[0.58rem] uppercase leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="mt-5 flex items-center justify-end gap-2">
                          {(quantities[item.id] ?? 0) > 0 && (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => changeQuantity(item.id, -1)}
                                aria-label={`Remove one ${item.name}`}
                              >
                                <Minus />
                              </Button>
                              <span className="w-8 text-center font-mono text-sm">
                                {quantities[item.id]}
                              </span>
                            </>
                          )}
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
        <Card className="sticky top-6 bg-card/95 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShoppingBag className="size-5" /> Your order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {orderItems.length ? (
              <div className="space-y-2 text-sm">
                {orderItems.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between gap-4">
                    <span>
                      {item.quantity}× {item.nameSnapshot}
                    </span>
                    <span className="font-mono">
                      {formatCurrency(item.quantity * item.unitPriceCents)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-3 font-semibold">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add a potion to begin your order.
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
                disabled={!canUseTable}
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
                placeholder="Oat milk, extra hot…"
              />
            </div>
            <Button
              className="h-11 w-full"
              size="lg"
              disabled={!canCheckout}
              onClick={() => setStage("checkout")}
            >
              Continue to payment
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
