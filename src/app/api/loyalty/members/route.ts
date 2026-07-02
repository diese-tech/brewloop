import { NextResponse } from "next/server";
import { z } from "zod";

import { parseOrRespond } from "@/lib/api-validation";
import { REWARD_VISIT_THRESHOLD } from "@/lib/commerce";
import { isDemoMode } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function managerMembership() {
  const client = await getSupabaseServerClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await client
    .from("cafe_users")
    .select("cafe_id, role")
    .eq("user_id", user.id)
    .in("role", ["owner", "manager"])
    .limit(1)
    .maybeSingle();
  return data ? { client, cafeId: data.cafe_id } : null;
}

export async function GET(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Demo lookups stay in the browser." },
      { status: 400 },
    );
  }
  const member = await managerMembership();
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 3) {
    return NextResponse.json(
      { error: "Enter a phone number or email to look up." },
      { status: 400 },
    );
  }
  let lookup = member.client
    .from("customers")
    .select("id, name, email, phone, loyalty_accounts(id, visits, points)")
    .eq("cafe_id", member.cafeId);
  lookup = query.includes("@")
    ? lookup.ilike("email", query)
    : lookup.eq("phone", query);
  const { data, error } = await lookup.limit(1).maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "No member found." }, { status: 404 });
  }
  const account = data.loyalty_accounts?.[0] ?? null;
  return NextResponse.json({
    member: {
      accountId: account?.id ?? null,
      name: data.name ?? "Bookbar regular",
      email: data.email ?? "",
      phone: data.phone ?? "",
      visits: account?.visits ?? 0,
      points: account?.points ?? 0,
    },
  });
}

const redeemSchema = z.object({
  accountId: z.string().uuid(),
});

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Demo redemptions stay in the browser." },
      { status: 400 },
    );
  }
  const member = await managerMembership();
  if (!member) {
    return NextResponse.json(
      { error: "Only an owner or manager can redeem rewards." },
      { status: 403 },
    );
  }
  const parsed = parseOrRespond(redeemSchema, await request.json());
  if (parsed.response) return parsed.response;

  // The RPC locks the account row and spends the card plus records the
  // redeem transaction in one database transaction. It re-checks the
  // caller's owner/manager role against the account's cafe.
  const { data: redeemed, error: redeemError } = await member.client.rpc(
    "redeem_loyalty_reward",
    { p_account_id: parsed.data.accountId },
  );
  if (redeemError) {
    const message = redeemError.message ?? "";
    if (message.includes("not found")) {
      return NextResponse.json(
        { error: "Loyalty account not found." },
        { status: 404 },
      );
    }
    if (message.includes("Not enough visits")) {
      return NextResponse.json(
        {
          error: `Not enough visits yet — ${REWARD_VISIT_THRESHOLD} moons redeem a reward.`,
        },
        { status: 400 },
      );
    }
    if (message.includes("owner or manager")) {
      return NextResponse.json(
        { error: "Only an owner or manager can redeem rewards." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const account = redeemed?.[0];
  if (!account) {
    return NextResponse.json(
      { error: "Unable to redeem reward." },
      { status: 400 },
    );
  }
  return NextResponse.json({
    account: {
      accountId: parsed.data.accountId,
      visits: account.new_visits,
      points: account.new_points,
    },
  });
}
