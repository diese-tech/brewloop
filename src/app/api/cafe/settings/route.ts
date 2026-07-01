import { NextResponse } from "next/server";
import { z } from "zod";

import { isDemoMode } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  acceptingOrders: z.boolean(),
});

export async function PATCH(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Cafe settings are read-only in demo mode." },
      { status: 400 },
    );
  }
  const client = await getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: membership } = await client
    .from("cafe_users")
    .select("cafe_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json(
      { error: "Only an owner can change cafe settings." },
      { status: 403 },
    );
  }

  const input = updateSchema.parse(await request.json());
  // RLS ("owners update cafe settings") is the real enforcement boundary;
  // the membership check above just produces a clearer error message.
  const { error } = await client
    .from("cafes")
    .update({ accepting_orders: input.acceptingOrders })
    .eq("id", membership.cafe_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ acceptingOrders: input.acceptingOrders });
}
