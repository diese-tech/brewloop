import { MenuManager } from "@/components/menu-manager";

export default function DashboardMenuPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Owner menu management
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Menu configuration
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Prices are stored as cents. Changes in demo mode persist in this browser.
      </p>
      <div className="mt-8">
        <MenuManager />
      </div>
    </div>
  );
}
