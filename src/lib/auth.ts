import { redirect } from "next/navigation";

import { isDemoMode } from "@/lib/config";
import { demoCafe } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function requireCafeMember(roles?: string[]) {
  if (isDemoMode()) return { cafeId: demoCafe.id, role: "owner" };
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  let query = supabase.from("cafe_users")
    .select("cafe_id, role")
    .eq("user_id", user.id);
  if (roles?.length) query = query.in("role", roles);
  const { data } = await query.limit(1).maybeSingle();
  if (!data) redirect("/login?error=unauthorized");
  return { cafeId: data.cafe_id, role: data.role };
}
