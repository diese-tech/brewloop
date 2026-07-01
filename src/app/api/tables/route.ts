import { NextResponse } from "next/server";
import { z } from "zod";

import { parseOrRespond } from "@/lib/api-validation";
import { isDemoMode } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { tableLabelExists } from "@/lib/tables";
import type { CafeTable } from "@/lib/types";
import type { Database } from "@/types/database";

type TableUpdate = Database["public"]["Tables"]["tables"]["Update"];

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

async function currentTables(
  client: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  cafeId: string,
): Promise<CafeTable[]> {
  const { data } = await client
    .from("tables")
    .select("id, label, is_active")
    .eq("cafe_id", cafeId);
  return (data ?? []).map((table) => ({
    id: table.id,
    label: table.label,
    isActive: table.is_active,
  }));
}

const createSchema = z.object({
  label: z.string().trim().min(1).max(40),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1).max(40).optional(),
  isActive: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo table edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseOrRespond(createSchema, await request.json());
  if (parsed.response) return parsed.response;
  const input = parsed.data;

  const existing = await currentTables(member.client, member.cafeId);
  if (tableLabelExists(existing, input.label)) {
    return NextResponse.json({ error: "Table labels must be unique." }, { status: 400 });
  }

  const { data, error } = await member.client
    .from("tables")
    .insert({ cafe_id: member.cafeId, label: input.label })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    id: data.id,
    label: data.label,
    isActive: data.is_active,
  });
}

export async function PATCH(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo table edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseOrRespond(updateSchema, await request.json());
  if (parsed.response) return parsed.response;
  const { id, ...fields } = parsed.data;

  if (fields.label !== undefined) {
    const existing = await currentTables(member.client, member.cafeId);
    if (tableLabelExists(existing, fields.label, id)) {
      return NextResponse.json({ error: "Table labels must be unique." }, { status: 400 });
    }
  }

  const update: TableUpdate = {};
  if (fields.label !== undefined) update.label = fields.label;
  if (fields.isActive !== undefined) update.is_active = fields.isActive;

  const { error } = await member.client
    .from("tables")
    .update(update)
    .eq("id", id)
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo table edits stay in the browser." }, { status: 400 });
  }
  const member = await membership();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing table id." }, { status: 400 });

  const { error } = await member.client
    .from("tables")
    .delete()
    .eq("id", id)
    .eq("cafe_id", member.cafeId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
