import { NextResponse } from "next/server";
import { z } from "zod";

import { parseOrRespond } from "@/lib/api-validation";
import { getProductionConfig, isDemoMode } from "@/lib/config";
import { signTable } from "@/lib/qr";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  slug: z.string().min(1),
  table: z.string().min(1).max(20),
});

export async function GET(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Signed QRs require production mode." }, { status: 400 });
  }
  const url = new URL(request.url);
  const parsed = parseOrRespond(querySchema, {
    slug: url.searchParams.get("slug"),
    table: url.searchParams.get("table"),
  });
  if (parsed.response) return parsed.response;
  const input = parsed.data;

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
  let config;
  try {
    config = getProductionConfig();
  } catch {
    return NextResponse.json(
      { error: "QR signing isn't configured yet. Check the setup readiness page." },
      { status: 400 },
    );
  }
  const signature = signTable(input.slug, input.table, config.QR_SIGNING_SECRET);
  return NextResponse.json({
    url: `${config.APP_URL}/cafe/${input.slug}/order?t=${encodeURIComponent(input.table)}&sig=${signature}`,
  });
}
