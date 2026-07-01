import { MenuManager } from "@/components/menu-manager";
import { requireCafeMember } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";
import { demoCafe } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MenuCategory, MenuItem } from "@/lib/types";

export default async function DashboardMenuPage() {
  const member = await requireCafeMember(["owner", "manager"]);
  const demoMode = isDemoMode();

  let categories: MenuCategory[];
  let items: MenuItem[];
  let cafeSlug: string | undefined;

  if (demoMode) {
    categories = demoCafe.categories;
    items = demoCafe.items;
    cafeSlug = demoCafe.slug;
  } else {
    const supabase = await getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const [{ data: cafe }, { data: categoryRows }, { data: itemRows }] =
      await Promise.all([
        supabase.from("cafes").select("slug").eq("id", member.cafeId).single(),
        supabase
          .from("menu_categories")
          .select("id, name, sort_order")
          .eq("cafe_id", member.cafeId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("menu_items")
          .select("id, category_id, name, description, price_cents, is_active")
          .eq("cafe_id", member.cafeId),
      ]);
    cafeSlug = cafe?.slug ?? undefined;
    categories = (categoryRows ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sort_order,
    }));
    items = (itemRows ?? []).map((item) => ({
      id: item.id,
      categoryId: item.category_id ?? "",
      name: item.name,
      description: item.description ?? "",
      priceCents: item.price_cents,
      isActive: item.is_active,
    }));
  }

  return (
    <div>
      <p className="eyebrow">The Black Rabbit · spellbook</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight">
        Menu management
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Set availability, edit potion details, and add new categories. CSV import
        is coming next.
      </p>
      <div className="mt-8">
        <MenuManager
          demoMode={demoMode}
          cafeSlug={cafeSlug}
          initialCategories={categories}
          initialItems={items}
        />
      </div>
    </div>
  );
}
