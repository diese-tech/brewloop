import { NextResponse } from "next/server";
import { z } from "zod";

import { isDemoMode } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  cafeId: z.string().uuid(),
  name: z.string().trim().max(100).default(""),
});

export async function POST(request: Request) {
  if (isDemoMode()) return NextResponse.json({ visits: 1, points: 10 });
  const input = schema.parse(await request.json());
  const client = await getSupabaseServerClient();
  const { data: { user } } = client
    ? await client.auth.getUser()
    : { data: { user: null } };
  if (!user?.phone) {
    return NextResponse.json({ error: "Verify your phone first." }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  let { data: customer, error: customerError } = await admin
    .from("customers")
    .select("id, name")
    .eq("cafe_id", input.cafeId)
    .eq("phone", user.phone)
    .limit(1)
    .maybeSingle();
  if (!customer && !customerError) {
    const created = await admin.from("customers").insert({
      cafe_id: input.cafeId,
      auth_user_id: user.id,
      phone: user.phone,
      name: input.name || "Bookbar regular",
    }).select("id, name").single();
    customer = created.data;
    customerError = created.error;
  } else if (customer) {
    const updated = await admin.from("customers").update({
      auth_user_id: user.id,
      name: input.name || customer.name,
    }).eq("id", customer.id).select("id, name").single();
    customer = updated.data;
    customerError = updated.error;
  }
  if (customerError) throw customerError;
  if (!customer) throw new Error("Unable to create customer.");
  let { data: account, error: accountError } = await admin
    .from("loyalty_accounts")
    .select("visits, points")
    .eq("cafe_id", input.cafeId)
    .eq("customer_id", customer.id)
    .maybeSingle();
  if (!account && !accountError) {
    const created = await admin.from("loyalty_accounts").insert({
      cafe_id: input.cafeId,
      customer_id: customer.id,
    })
    .select("visits, points")
    .single();
    account = created.data;
    accountError = created.error;
  }
  if (accountError) throw accountError;
  return NextResponse.json({ ...account, name: customer.name });
}
