import Link from "next/link";
import { Coffee } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppNav() {
  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Coffee className="size-4" />
          </span>
          BrewLoop
        </Link>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/cafe/demo-coffee">Café</Link>
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
