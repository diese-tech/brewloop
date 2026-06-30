import { NextResponse } from "next/server";
import { z } from "zod";

import { getStaffOrders } from "@/lib/data";
import { isDemoMode } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["making", "ready", "completed"]),
});

async function membership() {
  const client = await getSupabaseServerClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await client.from("cafe_users")
    .select("cafe_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return data ? { client, cafeId: data.cafe_id } : null;
}

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ orders: [] });
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await getStaffOrders(member.cafeId) });
}

export async function PATCH(request: Request) {
  if (isDemoMode()) return NextResponse.json({ ok: true });
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = updateSchema.parse(await request.json());
  const { data: order } = await member.client.from("orders")
    .select("status")
    .eq("id", input.orderId)
    .eq("cafe_id", member.cafeId)
    .single();
  const next = { new: "making", making: "ready", ready: "completed" } as const;
  if (!order || next[order.status as keyof typeof next] !== input.status) {
    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
  }
  const { error } = await member.client.from("orders")
    .update({ status: input.status })
    .eq("id", input.orderId)
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
