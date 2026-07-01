import { StaffManager } from "@/components/staff-manager";
import { requireCafeMember } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";
import { demoStaff } from "@/lib/demo-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StaffMember } from "@/lib/types";

export default async function DashboardStaffPage() {
  const member = await requireCafeMember(["owner", "manager"]);
  const demoMode = isDemoMode();
  const isOwner = member.role === "owner";

  let staff: StaffMember[] = [];

  if (demoMode) {
    staff = demoStaff;
  } else if (isOwner) {
    // profiles RLS only allows reading your own row, so an owner-scoped
    // roster of everyone else's name/phone requires the admin client.
    // Access here is already gated by the verified owner membership above.
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("cafe_users")
      .select("id, user_id, role, profiles(display_name, phone)")
      .eq("cafe_id", member.cafeId);
    staff = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role as StaffMember["role"],
      name: row.profiles?.display_name ?? "",
      phone: row.profiles?.phone ?? "",
    }));
  }

  return (
    <div>
      <p className="eyebrow">The Black Rabbit · staff access</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight">
        Staff access
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Staff sign in with just a phone number — no password. Add someone
        here and they can sign in right away.
      </p>
      <div className="mt-8">
        <StaffManager demoMode={demoMode} isOwner={isOwner} initialStaff={staff} />
      </div>
    </div>
  );
}
