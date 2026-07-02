import { CustomersPanel } from "@/components/customers-panel";
import { requireCafeMember } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";
import { demoLoyaltyAccounts } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LoyaltyAccount } from "@/lib/types";

export default async function DashboardCustomersPage() {
  const member = await requireCafeMember(["owner", "manager"]);
  const demoMode = isDemoMode();

  let accounts: LoyaltyAccount[];
  if (demoMode) {
    accounts = demoLoyaltyAccounts;
  } else {
    const supabase = await getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone, loyalty_accounts(visits, points)")
      .eq("cafe_id", member.cafeId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    accounts = (data ?? []).map((row) => ({
      id: row.id,
      cafeId: member.cafeId,
      name: row.name ?? "Bookbar regular",
      email: row.email ?? "",
      phone: row.phone ?? "",
      visits: row.loyalty_accounts?.[0]?.visits ?? 0,
      points: row.loyalty_accounts?.[0]?.points ?? 0,
    }));
  }

  return <CustomersPanel demoMode={demoMode} initialAccounts={accounts} />;
}
