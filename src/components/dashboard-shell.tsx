import Link from "next/link";

import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";

const links = [
  ["Overview", "/dashboard"],
  ["Menu", "/dashboard/menu"],
  ["Customers", "/dashboard/customers"],
  ["Rewards", "/dashboard/rewards"],
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[11rem_1fr]">
        <aside>
          <p className="mb-3 px-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Owner tools
          </p>
          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {links.map(([label, href]) => (
              <Button
                key={href}
                asChild
                variant="ghost"
                className="justify-start"
              >
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </>
  );
}
