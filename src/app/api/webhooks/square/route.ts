import { NextResponse } from "next/server";

import { getProductionConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifySquareWebhook } from "@/lib/square";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature") ?? "";
  const config = getProductionConfig();
  const notificationUrl = `${config.APP_URL}/api/webhooks/square`;
  if (!verifySquareWebhook(
    body,
    signature,
    notificationUrl,
    config.SQUARE_WEBHOOK_SIGNATURE_KEY,
  )) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);
  const admin = getSupabaseAdmin();
  const refund = event.data?.object?.refund;
  if (refund?.payment_id && refund.status === "COMPLETED") {
    const { error } = await admin.from("orders")
      .update({ payment_status: "refunded" })
      .eq("square_payment_id", refund.payment_id);
    if (error) throw error;
  }

  const payment = event.data?.object?.payment;
  if (payment?.order_id) {
    let query = admin
      .from("orders")
      .select("id, subtotal_cents, tip_cents");
    query = payment.reference_id
      ? query.or(
          `square_order_id.eq.${payment.order_id},idempotency_key.eq.${payment.reference_id}`,
        )
      : query.eq("square_order_id", payment.order_id);
    const { data: order, error: orderError } = await query.maybeSingle();
    if (orderError) throw orderError;
    if (order && payment.status === "COMPLETED") {
      const totalCents = Number(payment.total_money?.amount ?? 0);
      const { error } = await admin.rpc("apply_paid_order", {
        p_order_id: order.id,
        p_square_order_id: payment.order_id,
        p_square_payment_id: payment.id,
        p_tax_cents: Math.max(
          0,
          totalCents - order.subtotal_cents - order.tip_cents,
        ),
        p_total_cents: totalCents,
      });
      if (error) throw error;
    } else if (
      order &&
      (payment.status === "FAILED" || payment.status === "CANCELED")
    ) {
      const { error } = await admin.from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);
      if (error) throw error;
    }
  }

  // Insert last so a processing failure is retried by Square.
  const { error: eventError } = await admin.from("payment_events").insert({
    id: event.event_id,
    event_type: event.type,
    payload: event as Json,
  });
  if (eventError && eventError.code !== "23505") throw eventError;
  return NextResponse.json({ received: true });
}
