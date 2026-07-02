import { DashboardShell } from "@/components/dashboard-shell";
import { requireCafeMember } from "@/lib/auth";

// Auth- and config-gated: must render per request, never at build time. A
// build without env vars would otherwise fail trying to prerender these
// pages instead of showing the runtime configuration error state.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCafeMember(["owner", "manager"]);
  return <DashboardShell>{children}</DashboardShell>;
}
