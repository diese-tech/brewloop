import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { getProductionConfig } from "@/lib/config";

type SquareLineItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
};

function buildSquareOrder(
  locationId: string,
  lineItems: SquareLineItem[],
  tipCents: number,
  taxIds: string[] = [],
  idempotencyKey: string = randomUUID(),
) {
  return {
    idempotency_key: idempotencyKey,
    order: {
      location_id: locationId,
      reference_id: idempotencyKey,
      ...(taxIds.length
        ? {
            taxes: taxIds.map((catalog_object_id, index) => ({
              uid: `tax-${index}`,
              catalog_object_id,
              scope: "ORDER",
            })),
          }
        : {}),
      line_items: lineItems.map((item) => ({
        name: item.name,
        quantity: String(item.quantity),
        base_price_money: { amount: item.unitPriceCents, currency: "USD" },
      })),
      ...(tipCents
        ? {
            service_charges: [{
              name: "Tip",
              amount_money: { amount: tipCents, currency: "USD" },
              calculation_phase: "TOTAL_PHASE",
            }],
          }
        : {}),
    },
  };
}

export async function createSquareOrderAndPayment(input: {
  locationId: string;
  sourceId: string;
  lineItems: SquareLineItem[];
  tipCents: number;
  taxIds: string[];
  referenceId: string;
}) {
  const config = getProductionConfig();
  const baseUrl = config.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
  const headers = {
    Authorization: `Bearer ${config.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2026-05-20",
  };
  const orderResponse = await fetch(`${baseUrl}/v2/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(
      buildSquareOrder(
        input.locationId,
        input.lineItems,
        input.tipCents,
        input.taxIds,
        input.referenceId,
      ),
    ),
  });
  const orderBody = await orderResponse.json();
  if (!orderResponse.ok || !orderBody.order?.id) {
    throw new Error(orderBody.errors?.[0]?.detail ?? "Square order failed.");
  }

  const paymentResponse = await fetch(`${baseUrl}/v2/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_id: input.sourceId,
      idempotency_key: input.referenceId,
      order_id: orderBody.order.id,
      location_id: input.locationId,
      reference_id: input.referenceId,
      autocomplete: true,
    }),
  });
  const paymentBody = await paymentResponse.json();
  if (!paymentResponse.ok || !paymentBody.payment?.id) {
    throw new Error(paymentBody.errors?.[0]?.detail ?? "Square payment failed.");
  }
  return {
    orderId: orderBody.order.id as string,
    paymentId: paymentBody.payment.id as string,
    status: paymentBody.payment.status as string,
    totalCents: Number(paymentBody.payment.total_money?.amount ?? 0),
  };
}

export function verifySquareWebhook(
  body: string,
  signature: string,
  notificationUrl: string,
  key: string,
) {
  const expected = Buffer.from(
    createHmac("sha256", key).update(notificationUrl + body).digest("base64"),
  );
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
