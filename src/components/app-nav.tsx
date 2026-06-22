import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function AppNav() {
  return (
    <header className="border-b border-border bg-card/92 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <BrandMark compact />
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/cafe/black-rabbit">Café</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/staff/orders">Staff</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Owner</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
