import { NextResponse } from "next/server";
import { z } from "zod";

import { getProductionConfig, isDemoMode } from "@/lib/config";
import { signTable } from "@/lib/qr";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Signed QRs require production mode." }, { status: 400 });
  }
  const url = new URL(request.url);
  const input = z.object({
    slug: z.string().min(1),
    table: z.string().min(1).max(20),
  }).parse({
    slug: url.searchParams.get("slug"),
    table: url.searchParams.get("table"),
  });
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: cafe } = await supabase.from("cafes")
    .select("id")
    .eq("slug", input.slug)
    .single();
  if (!cafe) return NextResponse.json({ error: "Cafe not found" }, { status: 404 });
  const { data: membership } = await supabase.from("cafe_users")
    .select("id")
    .eq("cafe_id", cafe.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = getProductionConfig();
  const signature = signTable(input.slug, input.table, config.QR_SIGNING_SECRET);
  return NextResponse.json({
    url: `${config.APP_URL}/cafe/${input.slug}/order?t=${encodeURIComponent(input.table)}&sig=${signature}`,
  });
}
