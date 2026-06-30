import { DashboardShell } from "@/components/dashboard-shell";
import { requireCafeMember } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCafeMember(["owner", "manager"]);
  return <DashboardShell>{children}</DashboardShell>;
}
