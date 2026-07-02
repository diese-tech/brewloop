import { RewardsManager } from "@/components/rewards-manager";
import { requireCafeMember } from "@/lib/auth";
import { loyaltyProgress } from "@/lib/commerce";
import { isDemoMode } from "@/lib/config";
import { demoLoyaltyAccounts } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function readyRewards(visitCounts: number[]) {
  return visitCounts.reduce(
    (total, visits) => total + loyaltyProgress(visits).rewardsEarned,
    0,
  );
}

export default async function DashboardRewardsPage() {
  const member = await requireCafeMember(["owner", "manager"]);
  const demoMode = isDemoMode();

  let members: number;
  let ready: number;
  let redeemed: number;

  if (demoMode) {
    const visitCounts = demoLoyaltyAccounts.map((account) => account.visits);
    members = visitCounts.length;
    ready = readyRewards(visitCounts);
    redeemed = 0;
  } else {
    const supabase = await getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const [accountsResult, redeemResult] = await Promise.all([
      supabase
        .from("loyalty_accounts")
        .select("visits")
        .eq("cafe_id", member.cafeId),
      supabase
        .from("loyalty_transactions")
        .select("id, loyalty_accounts!inner(cafe_id)", {
          count: "exact",
          head: true,
        })
        .eq("type", "redeem")
        .eq("loyalty_accounts.cafe_id", member.cafeId),
    ]);
    if (accountsResult.error) throw new Error(accountsResult.error.message);
    if (redeemResult.error) throw new Error(redeemResult.error.message);
    const visitCounts = (accountsResult.data ?? []).map((row) => row.visits);
    members = visitCounts.length;
    ready = readyRewards(visitCounts);
    redeemed = redeemResult.count ?? 0;
  }

  return (
    <RewardsManager
      demoMode={demoMode}
      initialMetrics={{ members, ready, redeemed }}
    />
  );
}
