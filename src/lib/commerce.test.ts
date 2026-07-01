import { describe, expect, it } from "vitest";

import {
  calculateOrderTotal,
  dollarsToCents,
  isProblemOrder,
  loyaltyProgress,
} from "@/lib/commerce";
import type { CafeOrder } from "@/lib/types";

function baseOrder(overrides: Partial<CafeOrder> = {}): CafeOrder {
  return {
    id: "BR-1",
    cafeId: "cafe-1",
    customerName: "Test",
    customerPhone: "",
    status: "new",
    orderType: "pickup",
    notes: "",
    paymentStatus: "paid",
    totalCents: 500,
    items: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("commerce helpers", () => {
  it("calculates totals from snapshotted unit prices", () => {
    expect(
      calculateOrderTotal([
        {
          menuItemId: "latte",
          nameSnapshot: "Latte",
          quantity: 2,
          unitPriceCents: 550,
        },
        {
          menuItemId: "croissant",
          nameSnapshot: "Croissant",
          quantity: 1,
          unitPriceCents: 395,
        },
      ]),
    ).toBe(1495);
  });

  it("converts decimal dollar input to integer cents", () => {
    expect(dollarsToCents("5.50")).toBe(550);
    expect(dollarsToCents(4.755)).toBe(476);
  });

  it("returns visit progress and earned rewards", () => {
    expect(loyaltyProgress(16, 10)).toEqual({
      current: 6,
      threshold: 10,
      rewardsEarned: 1,
    });
  });

  it("treats cancelled, failed, and refunded orders as problems", () => {
    expect(isProblemOrder(baseOrder({ status: "cancelled" }))).toBe(true);
    expect(isProblemOrder(baseOrder({ paymentStatus: "failed" }))).toBe(true);
    expect(isProblemOrder(baseOrder({ paymentStatus: "refunded" }))).toBe(true);
    expect(isProblemOrder(baseOrder())).toBe(false);
  });
});
