import { NextResponse } from "next/server";
import { z } from "zod";

import { getProductionConfig, isDemoMode } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createSquareOrderAndPayment } from "@/lib/square";
import { verifyTableSignature } from "@/lib/qr";

const orderSchema = z.object({
  cafeId: z.string().uuid(),
  cafeSlug: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  customerName: z.string().trim().min(1).max(100),
  customerPhone: z.string().trim().max(30).default(""),
  notes: z.string().trim().max(500).default(""),
  orderType: z.enum(["pickup", "table"]),
  tableNumber: z.string().trim().max(20).default(""),
  tableSignature: z.string().default(""),
  tipCents: z.number().int().min(0),
  sourceId: z.string().min(1),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().min(1).max(50),
  })).min(1).refine(
    (items) => new Set(items.map((item) => item.menuItemId)).size === items.length,
    "Duplicate menu items are not allowed.",
  ),
});

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Demo orders stay in browser storage." },
      { status: 400 },
    );
  }
  try {
    const input = orderSchema.parse(await request.json());
    const config = getProductionConfig();
    if (
      input.orderType === "table" &&
      !verifyTableSignature(
        input.cafeSlug,
        input.tableNumber,
        input.tableSignature,
        config.QR_SIGNING_SECRET,
      )
    ) {
      return NextResponse.json({ error: "Invalid table QR." }, { status: 400 });
    }

    const sessionClient = await getSupabaseServerClient();
    const { data: { user } } = sessionClient
      ? await sessionClient.auth.getUser()
      : { data: { user: null } };
    const customerPhone = user?.phone ?? input.customerPhone;
    const admin = getSupabaseAdmin();
    const { data: cafe, error: cafeError } = await admin.from("cafes")
      .select("id, square_location_id, square_tax_ids")
      .eq("id", input.cafeId)
      .eq("slug", input.cafeSlug)
      .single();
    if (cafeError || !cafe) {
      return NextResponse.json({ error: "Cafe not found." }, { status: 404 });
    }
    const idempotencyKey = input.idempotencyKey;
    const { data: pending, error: pendingError } = await admin.rpc(
      "create_pending_order",
      {
        p_auth_user_id: user?.id ?? null,
        p_cafe_id: input.cafeId,
        p_customer_name: input.customerName,
        p_customer_phone: customerPhone,
        p_idempotency_key: idempotencyKey,
        p_items: input.items.map((item) => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
        })),
        p_notes: input.notes,
        p_order_type: input.orderType,
        p_table_number: input.tableNumber,
        p_tip_cents: input.tipCents,
      },
    );
    if (
      pendingError ||
      !pending ||
      typeof pending !== "object" ||
      Array.isArray(pending) ||
      !("id" in pending)
    ) {
      throw pendingError ?? new Error("Unable to create order.");
    }
    const orderId = String(pending.id);
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (orderError || !order) throw orderError ?? new Error("Order missing.");

    let payment;
    try {
      const locationId =
        cafe.square_location_id ??
        config.NEXT_PUBLIC_SQUARE_LOCATION_ID;
      if (!locationId) throw new Error("Square location is not configured.");
      payment = await createSquareOrderAndPayment({
        locationId,
        sourceId: input.sourceId,
        referenceId: idempotencyKey,
        tipCents: order.tip_cents,
        taxIds: cafe.square_tax_ids,
        lineItems: order.order_items.map((item) => ({
          name: item.name_snapshot,
          quantity: item.quantity,
          unitPriceCents: item.unit_price_cents,
        })),
      });
    } catch (error) {
      await admin.from("orders").update({ payment_status: "failed" })
        .eq("id", orderId);
      throw error;
    }
    const { error: mappingError } = await admin.from("orders").update({
      square_order_id: payment.orderId,
      square_payment_id: payment.paymentId,
    }).eq("id", orderId);
    if (mappingError) throw mappingError;
    if (payment.status !== "COMPLETED") {
      await admin.from("orders").update({
        payment_status: "failed",
      }).eq("id", orderId);
      throw new Error("Square did not complete the payment.");
    }
    const taxCents = Math.max(
      0,
      payment.totalCents - order.subtotal_cents - order.tip_cents,
    );
    const { error: paidError } = await admin.rpc("apply_paid_order", {
      p_order_id: orderId,
      p_square_order_id: payment.orderId,
      p_square_payment_id: payment.paymentId,
      p_tax_cents: taxCents,
      p_total_cents: payment.totalCents,
    });
    if (paidError) throw paidError;

    return NextResponse.json({
      id: orderId,
      customerName: order.customer_name,
      orderType: order.order_type,
      tableNumber: order.table_number,
      subtotalCents: order.subtotal_cents,
      taxCents,
      tipCents: order.tip_cents,
      totalCents: payment.totalCents,
      items: order.order_items.map((item) => ({
        menuItemId: item.menu_item_id ?? item.id,
        nameSnapshot: item.name_snapshot,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed." },
      { status: 400 },
    );
  }
}
