import { MenuManager } from "@/components/menu-manager";

export default function DashboardMenuPage() {
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
        <MenuManager />
      </div>
    </div>
  );
}
