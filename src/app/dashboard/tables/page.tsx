import { TablesManager } from "@/components/tables-manager";
import { requireCafeMember } from "@/lib/auth";
import { getProductionReadiness, isDemoMode } from "@/lib/config";
import { demoCafe, demoTables } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CafeTable } from "@/lib/types";

export default async function DashboardTablesPage() {
  const member = await requireCafeMember(["owner", "manager"]);
  const demoMode = isDemoMode();

  let cafeSlug: string;
  let tables: CafeTable[];

  if (demoMode) {
    cafeSlug = demoCafe.slug;
    tables = demoTables;
  } else {
    const supabase = await getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const [{ data: cafe }, { data: tableRows }] = await Promise.all([
      supabase.from("cafes").select("slug").eq("id", member.cafeId).single(),
      supabase
        .from("tables")
        .select("id, label, is_active")
        .eq("cafe_id", member.cafeId)
        .order("label", { ascending: true }),
    ]);
    cafeSlug = cafe?.slug ?? "";
    tables = (tableRows ?? []).map((table) => ({
      id: table.id,
      label: table.label,
      isActive: table.is_active,
    }));
  }

  const qrSigningSecretConfigured = demoMode || getProductionReadiness().qrSigningSecret;

  return (
    <div>
      <p className="eyebrow">The Black Rabbit · tables &amp; QR links</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight">
        Tables &amp; QR links
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Add a table, generate its signed order link, and print or copy the
        set for table tents.
      </p>
      <div className="mt-8">
        <TablesManager
          demoMode={demoMode}
          cafeSlug={cafeSlug}
          initialTables={tables}
          qrSigningSecretConfigured={qrSigningSecretConfigured}
        />
      </div>
    </div>
  );
}
