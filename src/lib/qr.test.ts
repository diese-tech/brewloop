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

  it("rejects a signature once it has expired", () => {
    const issuedAt = Date.now() - 13 * 60 * 60 * 1000; // 13h ago, past the 12h default TTL
    const signature = signTable("black-rabbit", "12", "x".repeat(32), issuedAt);
    expect(
      verifyTableSignature("black-rabbit", "12", signature, "x".repeat(32)),
    ).toBe(false);
  });

  it("accepts a signature within a custom TTL window", () => {
    const issuedAt = Date.now() - 30 * 60 * 1000; // 30 minutes ago
    const signature = signTable("black-rabbit", "12", "x".repeat(32), issuedAt);
    expect(
      verifyTableSignature("black-rabbit", "12", signature, "x".repeat(32), {
        ttlMs: 15 * 60 * 1000,
      }),
    ).toBe(false);
    expect(
      verifyTableSignature("black-rabbit", "12", signature, "x".repeat(32), {
        ttlMs: 60 * 60 * 1000,
      }),
    ).toBe(true);
  });

  it("rejects malformed, missing, or tampered signatures", () => {
    expect(
      verifyTableSignature("black-rabbit", "12", "", "x".repeat(32)),
    ).toBe(false);
    expect(
      verifyTableSignature("black-rabbit", "12", "not-a-signature", "x".repeat(32)),
    ).toBe(false);
    expect(
      verifyTableSignature("black-rabbit", "12", "abc.def", "x".repeat(32)),
    ).toBe(false);

    const signature = signTable("black-rabbit", "12", "x".repeat(32));
    const [issuedAt] = signature.split(".");
    expect(
      verifyTableSignature(
        "black-rabbit",
        "12",
        `${issuedAt}.tampered-signature`,
        "x".repeat(32),
      ),
    ).toBe(false);
  });

  it("rejects a signature issued too far in the future", () => {
    const issuedAt = Date.now() + 5 * 60 * 1000;
    const signature = signTable("black-rabbit", "12", "x".repeat(32), issuedAt);
    expect(
      verifyTableSignature("black-rabbit", "12", signature, "x".repeat(32)),
    ).toBe(false);
  });
});
