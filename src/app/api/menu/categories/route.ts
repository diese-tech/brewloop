import { NextResponse } from "next/server";
import { z } from "zod";

import { isDemoMode } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function membership() {
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

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  sortOrder: z.number().int().min(0),
});

const renameSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo menu edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = createSchema.parse(await request.json());
  const { data, error } = await member.client
    .from("menu_categories")
    .insert({ cafe_id: member.cafeId, name: input.name, sort_order: input.sortOrder })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    id: data.id,
    name: data.name,
    sortOrder: data.sort_order,
  });
}

export async function PATCH(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo menu edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = renameSchema.parse(await request.json());
  const { error } = await member.client
    .from("menu_categories")
    .update({ name: input.name })
    .eq("id", input.id)
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo menu edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing category id." }, { status: 400 });

  const { count } = await member.client
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("cafe_id", member.cafeId)
    .eq("category_id", id);
  if (count && count > 0) {
    return NextResponse.json(
      { error: "Move or remove this category's items before deleting it." },
      { status: 400 },
    );
  }

  const { error } = await member.client
    .from("menu_categories")
    .delete()
    .eq("id", id)
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
