import { NextResponse } from "next/server";
import { z } from "zod";

import { isDemoMode } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const querySchema = z.object({
  cafeSlug: z.string().min(1),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Demo orders are tracked in the browser." },
      { status: 400 },
    );
  }
  const { orderId } = await params;
  const url = new URL(request.url);
  const input = querySchema.safeParse({
    cafeSlug: url.searchParams.get("cafeSlug"),
  });
  if (!input.success) {
    return NextResponse.json({ error: "Missing cafe." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: cafe } = await admin
    .from("cafes")
    .select("id")
    .eq("slug", input.data.cafeSlug)
    .maybeSingle();
  if (!cafe) {
    return NextResponse.json({ error: "Cafe not found." }, { status: 404 });
  }

  const { data: order, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("cafe_id", cafe.id)
    .maybeSingle();
  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    customerName: order.customer_name ?? "Guest",
    orderType: order.order_type,
    tableNumber: order.table_number ?? undefined,
    notes: order.notes ?? "",
    status: order.status,
    paymentStatus: order.payment_status,
    subtotalCents: order.subtotal_cents,
    taxCents: order.tax_cents,
    tipCents: order.tip_cents,
    totalCents: order.total_cents,
    createdAt: order.created_at,
    items: order.order_items.map((item) => ({
      menuItemId: item.menu_item_id ?? item.id,
      nameSnapshot: item.name_snapshot,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
    })),
  });
}
