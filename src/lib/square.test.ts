import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createSquareOrderAndPayment,
  verifySquareWebhook,
} from "@/lib/square";

describe("Square order payload", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("keeps server prices, tax references, and tip explicit", async () => {
    vi.stubEnv("BREWLOOP_DEMO_MODE", "false");
    vi.stubEnv("APP_URL", "https://example.com");
    vi.stubEnv("QR_SIGNING_SECRET", "x".repeat(32));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    vi.stubEnv("NEXT_PUBLIC_SQUARE_APPLICATION_ID", "app");
    vi.stubEnv("SQUARE_ACCESS_TOKEN", "token");
    vi.stubEnv("SQUARE_WEBHOOK_SIGNATURE_KEY", "webhook");
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ order: { id: "order" } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        payment: { id: "payment", status: "COMPLETED", total_money: { amount: 1200 } },
      }))));

    await createSquareOrderAndPayment({
      locationId: "location",
      sourceId: "source",
      lineItems: [{ name: "Latte", quantity: 2, unitPriceCents: 550 }],
      tipCents: 100,
      taxIds: ["tax"],
      referenceId: "reference",
    });

    const payload = JSON.parse(
      String(vi.mocked(fetch).mock.calls[0][1]?.body),
    );
    expect(payload.order.line_items[0]).toMatchObject({
      quantity: "2",
      base_price_money: { amount: 550, currency: "USD" },
    });
    expect(payload.order.taxes).toEqual([
      { uid: "tax-0", catalog_object_id: "tax", scope: "ORDER" },
    ]);
    expect(payload.order.service_charges?.[0].amount_money.amount).toBe(100);
  });

  it("verifies Square's notification URL plus body signature", () => {
    const body = '{"event_id":"event"}';
    const url = "https://example.com/api/webhooks/square";
    const signature = createHmac("sha256", "secret")
      .update(url + body)
      .digest("base64");
    expect(verifySquareWebhook(body, signature, url, "secret")).toBe(true);
    expect(verifySquareWebhook(body, signature, `${url}/wrong`, "secret"))
      .toBe(false);
  });
});
