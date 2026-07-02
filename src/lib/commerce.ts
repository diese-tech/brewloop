import type { CafeOrder, OrderItem } from "@/lib/types";

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

/**
 * An order that fell out of the normal new -> making -> ready -> completed
 * pipeline: cancelled, or paid-then-failed/refunded. Shared by the staff
 * board's "Problems" column and the ops dashboard's counts so both agree on
 * what counts as a problem order.
 */
export function isProblemOrder(order: CafeOrder) {
  return (
    order.status === "cancelled" ||
    order.paymentStatus === "failed" ||
    order.paymentStatus === "refunded"
  );
}

export const REWARD_VISIT_THRESHOLD = 10;

/** Points added per visit by the accrual path (apply_paid_order). */
export const POINTS_PER_VISIT = 10;

export function loyaltyProgress(visits: number, threshold = REWARD_VISIT_THRESHOLD) {
  const normalized = Math.max(0, visits);
  return {
    current: normalized % threshold,
    threshold,
    rewardsEarned: Math.floor(normalized / threshold),
  };
}

export function canRedeemReward(visits: number, threshold = REWARD_VISIT_THRESHOLD) {
  return visits >= threshold;
}

/**
 * Redeeming a reward spends one full punch card: visits drop by the
 * threshold and points drop by the matching accrued amount, so remaining
 * visits keep counting toward the next reward.
 */
export function applyRedemption(
  account: { visits: number; points: number },
  threshold = REWARD_VISIT_THRESHOLD,
) {
  if (!canRedeemReward(account.visits, threshold)) {
    throw new Error("Not enough visits to redeem a reward.");
  }
  return {
    visits: account.visits - threshold,
    points: Math.max(0, account.points - threshold * POINTS_PER_VISIT),
  };
}
