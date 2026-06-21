import type { OrderItem } from "@/lib/types";

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function calculateOrderTotal(items: OrderItem[]) {
  return items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  );
}

export function dollarsToCents(value: string | number) {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    throw new Error("Price must be a valid number.");
  }
  return Math.round(amount * 100);
}

export function loyaltyProgress(visits: number, threshold = 10) {
  const normalized = Math.max(0, visits);
  return {
    current: normalized % threshold,
    threshold,
    rewardsEarned: Math.floor(normalized / threshold),
  };
}
