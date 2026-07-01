import { NextResponse } from "next/server";
import { z } from "zod";

import { parseOrRespond } from "@/lib/api-validation";
import { isDemoMode } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function ownerMembership() {
  const client = await getSupabaseServerClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await client
    .from("cafe_users")
    .select("cafe_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();
  return data ? { client, cafeId: data.cafe_id } : null;
}

const inviteSchema = z.object({
  phone: z.string().trim().min(7).max(20),
  name: z.string().trim().max(100).default(""),
  role: z.enum(["owner", "manager", "barista"]),
});

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ error: "Not available in demo mode." }, { status: 400 });
  const member = await ownerMembership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // profiles RLS only allows reading your own row, so an owner-scoped roster
  // of everyone else's name/phone requires the admin client. Access here is
  // already gated by the verified owner membership above.
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cafe_users")
    .select("id, user_id, role, profiles(display_name, phone)")
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    staff: (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role,
      name: row.profiles?.display_name ?? "",
      phone: row.profiles?.phone ?? "",
    })),
  });
}

export async function POST(request: Request) {
  if (isDemoMode()) return NextResponse.json({ error: "Not available in demo mode." }, { status: 400 });
  const member = await ownerMembership();
  if (!member) {
    return NextResponse.json(
      { error: "Only an owner can add staff." },
      { status: 403 },
    );
  }
  const parsed = parseOrRespond(inviteSchema, await request.json());
  if (parsed.response) return parsed.response;
  const input = parsed.data;

  try {
    const admin = getSupabaseAdmin();
    let userId: string;
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", input.phone)
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
      if (input.name) {
        await admin
          .from("profiles")
          .update({ display_name: input.name })
          .eq("id", userId);
      }
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        phone: input.phone,
        phone_confirm: true,
        user_metadata: input.name ? { display_name: input.name } : undefined,
      });
      if (createError || !created.user) {
        throw new Error(createError?.message ?? "Unable to create staff account.");
      }
      userId = created.user.id;
    }

    if (input.role !== "owner") {
      const { data: existingMembership } = await member.client
        .from("cafe_users")
        .select("role")
        .eq("cafe_id", member.cafeId)
        .eq("user_id", userId)
        .maybeSingle();
      if (existingMembership?.role === "owner") {
        const { count } = await member.client
          .from("cafe_users")
          .select("id", { count: "exact", head: true })
          .eq("cafe_id", member.cafeId)
          .eq("role", "owner");
        if ((count ?? 0) <= 1) {
          throw new Error("A cafe needs at least one owner.");
        }
      }
    }

    const { data: membership, error: membershipError } = await member.client
      .from("cafe_users")
      .upsert(
        { cafe_id: member.cafeId, user_id: userId, role: input.role },
        { onConflict: "cafe_id,user_id" },
      )
      .select("id, role")
      .single();
    if (membershipError) throw new Error(membershipError.message);

    return NextResponse.json({
      id: membership.id,
      userId,
      role: membership.role,
      name: input.name,
      phone: input.phone,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to add staff." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (isDemoMode()) return NextResponse.json({ error: "Not available in demo mode." }, { status: 400 });
  const member = await ownerMembership();
  if (!member) {
    return NextResponse.json(
      { error: "Only an owner can remove staff." },
      { status: 403 },
    );
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing membership id." }, { status: 400 });

  const { data: target } = await member.client
    .from("cafe_users")
    .select("role")
    .eq("id", id)
    .eq("cafe_id", member.cafeId)
    .maybeSingle();
  if (!target) return NextResponse.json({ error: "Staff member not found." }, { status: 404 });

  if (target.role === "owner") {
    const { count } = await member.client
      .from("cafe_users")
      .select("id", { count: "exact", head: true })
      .eq("cafe_id", member.cafeId)
      .eq("role", "owner");
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "A cafe needs at least one owner." },
        { status: 400 },
      );
    }
  }

  const { error } = await member.client
    .from("cafe_users")
    .delete()
    .eq("id", id)
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
