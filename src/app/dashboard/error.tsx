"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isSupabaseUnconfigured = error.message.includes(
    "Supabase is not configured",
  );

  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <p className="eyebrow">The Black Rabbit · dashboard blocked</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {isSupabaseUnconfigured
          ? "Supabase isn't configured yet."
          : "Something went wrong loading the dashboard."}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {isSupabaseUnconfigured
          ? "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY need to be set before any owner/staff page — including setup readiness — can load, since they gate sign-in itself."
          : error.message}
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
