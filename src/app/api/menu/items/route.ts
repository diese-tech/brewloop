import { NextResponse } from "next/server";
import { z } from "zod";

import { parseOrRespond } from "@/lib/api-validation";
import { isDemoMode } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type MenuItemUpdate = Database["public"]["Tables"]["menu_items"]["Update"];

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

async function categoryBelongsToCafe(
  client: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  categoryId: string,
  cafeId: string,
) {
  if (!client) return false;
  const { data } = await client
    .from("menu_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("cafe_id", cafeId)
    .maybeSingle();
  return Boolean(data);
}

const createSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(280).default(""),
  priceCents: z.number().int().min(0),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(280).optional(),
  priceCents: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo menu edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseOrRespond(createSchema, await request.json());
  if (parsed.response) return parsed.response;
  const input = parsed.data;

  if (!(await categoryBelongsToCafe(member.client, input.categoryId, member.cafeId))) {
    return NextResponse.json({ error: "Category not found for this cafe." }, { status: 400 });
  }

  const { data, error } = await member.client
    .from("menu_items")
    .insert({
      cafe_id: member.cafeId,
      category_id: input.categoryId,
      name: input.name,
      description: input.description,
      price_cents: input.priceCents,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    id: data.id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description ?? "",
    priceCents: data.price_cents,
    isActive: data.is_active,
  });
}

export async function PATCH(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo menu edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseOrRespond(updateSchema, await request.json());
  if (parsed.response) return parsed.response;
  const { id, ...fields } = parsed.data;

  if (
    fields.categoryId !== undefined &&
    !(await categoryBelongsToCafe(member.client, fields.categoryId, member.cafeId))
  ) {
    return NextResponse.json({ error: "Category not found for this cafe." }, { status: 400 });
  }

  const update: MenuItemUpdate = {};
  if (fields.categoryId !== undefined) update.category_id = fields.categoryId;
  if (fields.name !== undefined) update.name = fields.name;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.priceCents !== undefined) update.price_cents = fields.priceCents;
  if (fields.isActive !== undefined) update.is_active = fields.isActive;

  const { error } = await member.client
    .from("menu_items")
    .update(update)
    .eq("id", id)
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
