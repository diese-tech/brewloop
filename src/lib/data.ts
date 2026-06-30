import { isDemoMode } from "@/lib/config";
import { demoCafe, demoOrders } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Cafe, CafeOrder } from "@/lib/types";

export async function getCafeBySlug(slug: string): Promise<Cafe | null> {
  if (isDemoMode()) {
    return slug === demoCafe.slug ? demoCafe : null;
  }
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: cafe, error } = await supabase
    .from("cafes")
    .select("*, menu_categories(*), menu_items(*)")
    .eq("slug", slug)
    .single();
  if (error || !cafe) return null;

  return {
    id: cafe.id,
    name: cafe.name,
    slug: cafe.slug,
    tagline: cafe.tagline ?? "",
    primaryColor: cafe.primary_color ?? "#7a1b2b",
    address: cafe.address ?? undefined,
    hours: cafe.hours ?? undefined,
    externalLabel: cafe.external_label ?? undefined,
    categories: cafe.menu_categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sort_order,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    items: cafe.menu_items.map((item) => ({
      id: item.id,
      categoryId: item.category_id ?? "",
      name: item.name,
      description: item.description ?? "",
      priceCents: item.price_cents,
      isActive: item.is_active,
    })),
    squareTaxIds: cafe.square_tax_ids,
    squareLocationId: cafe.square_location_id ?? undefined,
  };
}

export async function getStaffOrders(cafeId: string): Promise<CafeOrder[]> {
  if (isDemoMode()) return demoOrders;
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("cafe_id", cafeId)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((order) => ({
    id: order.id,
    cafeId: order.cafe_id,
    customerName: order.customer_name ?? "Guest",
    customerPhone: order.customer_phone ?? "",
    status: order.status as CafeOrder["status"],
    orderType: order.order_type as CafeOrder["orderType"],
    tableNumber: order.table_number ?? undefined,
    notes: order.notes ?? "",
    subtotalCents: order.subtotal_cents,
    taxCents: order.tax_cents,
    tipCents: order.tip_cents,
    paymentStatus: order.payment_status as CafeOrder["paymentStatus"],
    totalCents: order.total_cents,
    items: order.order_items.map((item) => ({
      menuItemId: item.menu_item_id ?? item.id,
      nameSnapshot: item.name_snapshot,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
    })),
    createdAt: order.created_at,
  }));
}
