import { describe, expect, it } from "vitest";

import {
  calculateOrderTotal,
  dollarsToCents,
  loyaltyProgress,
} from "@/lib/commerce";

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
});
