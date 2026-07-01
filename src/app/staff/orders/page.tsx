import { AppNav } from "@/components/app-nav";
import { StaffBoard } from "@/components/staff-board";
import { requireCafeMember } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";
import { getStaffOrders } from "@/lib/data";

const OPEN_STATUSES = new Set(["new", "making", "ready"]);

export default async function StaffOrdersPage() {
  const member = await requireCafeMember();
  const orders = await getStaffOrders(member.cafeId);
  const openCount = orders.filter(
    (order) =>
      OPEN_STATUSES.has(order.status) &&
      order.paymentStatus !== "failed" &&
      order.paymentStatus !== "refunded",
  ).length;
  return (
    <>
      <AppNav />
      <main className="px-6 py-8">
        <div className="mx-auto mb-6 max-w-[90rem]">
          <p className="eyebrow">
            The Black Rabbit · {openCount} open · live
          </p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight">
            Staff order board
          </h1>
        </div>
        <div className="mx-auto max-w-[90rem] overflow-x-auto pb-4">
          <StaffBoard
            cafeId={member.cafeId}
            demoMode={isDemoMode()}
            initialOrders={orders}
          />
        </div>
      </main>
    </>
  );
}
