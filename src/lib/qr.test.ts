import { describe, expect, it } from "vitest";

import { signTable, verifyTableSignature } from "@/lib/qr";

describe("table QR signatures", () => {
  it("accepts only the signed cafe and table", () => {
    const signature = signTable("black-rabbit", "12", "x".repeat(32));
    expect(
      verifyTableSignature("black-rabbit", "12", signature, "x".repeat(32)),
    ).toBe(true);
    expect(
      verifyTableSignature("black-rabbit", "13", signature, "x".repeat(32)),
    ).toBe(false);
  });
});
