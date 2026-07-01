import {
  AlertTriangle,
  CircleAlert,
  ClipboardList,
  ShoppingBag,
  TicketPercent,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/commerce";
import { requireCafeMember } from "@/lib/auth";
import { getProductionReadiness, isDemoMode } from "@/lib/config";
import { demoCafe, demoLoyaltyAccounts, demoOrders, demoStaff, demoTables } from "@/lib/demo-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Metrics = {
  ordersToday: number;
  revenueTodayCents: number;
  avgTicketCents: number;
  activeOrders: number;
  loyaltySignups: number;
  failedPayments: number;
  topItems: Array<{ name: string; quantity: number }>;
};

type ChecklistItem = {
  label: string;
  status: "done" | "blocked" | "manual";
  detail: string;
  href?: string;
};

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "destructive";
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="eyebrow">{label}</CardTitle>
        <Icon
          className={`size-4 ${tone === "destructive" ? "text-destructive" : "text-[var(--brass-bright)]"}`}
        />
      </CardHeader>
      <CardContent
        className={`font-heading text-5xl font-semibold ${tone === "destructive" && value !== "0" ? "text-destructive" : ""}`}
      >
        {value}
      </CardContent>
    </Card>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const badge =
    item.status === "done" ? (
      <Badge>Done</Badge>
    ) : item.status === "manual" ? (
      <Badge variant="outline">Manual step</Badge>
    ) : (
      <Badge variant="destructive">Blocked</Badge>
    );
  const row = (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div>
        <p className="font-medium">{item.label}</p>
        <p className="text-sm text-muted-foreground">{item.detail}</p>
      </div>
      {badge}
    </div>
  );
  return item.href ? (
    <Link href={item.href} className="block hover:opacity-90">
      {row}
    </Link>
  ) : (
    row
  );
}

export default async function DashboardPage() {
  const member = await requireCafeMember(["owner", "manager"]);
  const demoMode = isDemoMode();
  const readiness = getProductionReadiness();

  let metrics: Metrics;
  let hasMenu = false;
  let hasTables = false;
  let hasExtraStaff = false;
  let recentLoyalty: Array<{ id: string; name: string; visits: number }> = [];
  let cafeSlug = demoCafe.slug;
  let cafeSquareLocationId: string | null = null;

  if (demoMode) {
    const paidOrders = demoOrders.filter((order) => order.paymentStatus === "paid");
    const revenueTodayCents = paidOrders.reduce((sum, order) => sum + order.totalCents, 0);
    const activeOrders = demoOrders.filter(
      (order) =>
        ["new", "making", "ready"].includes(order.status) &&
        order.paymentStatus === "paid",
    ).length;
    const failedPayments = demoOrders.filter((order) => order.paymentStatus === "failed").length;
    const itemTotals = new Map<string, number>();
    for (const order of paidOrders) {
      for (const item of order.items) {
        itemTotals.set(item.nameSnapshot, (itemTotals.get(item.nameSnapshot) ?? 0) + item.quantity);
      }
    }
    metrics = {
      ordersToday: demoOrders.length,
      revenueTodayCents,
      avgTicketCents: paidOrders.length ? Math.round(revenueTodayCents / paidOrders.length) : 0,
      activeOrders,
      loyaltySignups: demoLoyaltyAccounts.length,
      failedPayments,
      topItems: [...itemTotals.entries()]
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5),
    };
    hasMenu = demoCafe.categories.length > 0 && demoCafe.items.some((item) => item.isActive);
    hasTables = demoTables.length > 0;
    hasExtraStaff = demoStaff.length > 1;
    recentLoyalty = demoLoyaltyAccounts.map((account) => ({
      id: account.id,
      name: account.name,
      visits: account.visits,
    }));
  } else {
    const supabase = await getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    // There's no per-cafe timezone in the schema yet, so "today" uses a
    // fixed US Eastern offset (the pilot cafe's location) rather than true
    // UTC midnight — a bar/cafe open into the evening would otherwise see
    // "today" reset mid-service (UTC midnight is 7-8pm Eastern). This
    // doesn't auto-adjust for DST; a real per-cafe timezone is a future
    // improvement once there's more than one pilot location.
    const EASTERN_OFFSET_HOURS = 4;
    const todayStart = new Date();
    todayStart.setUTCHours(EASTERN_OFFSET_HOURS, 0, 0, 0);
    if (todayStart.getTime() > Date.now()) {
      todayStart.setUTCDate(todayStart.getUTCDate() - 1);
    }
    const todayIso = todayStart.toISOString();

    // cafe_users RLS only lets a non-owner read their own membership row
    // (see "members read cafe memberships" vs. the owner-only "for all"
    // policy), so a manager viewing this page with the user-scoped client
    // would always see a staff count of 1. Use the admin client for this
    // one count — access is already gated by the verified owner/manager
    // membership check above, and this only exposes an aggregate number.
    const admin = getSupabaseAdmin();

    const [
      { data: cafeRow },
      { data: ordersToday },
      { data: activeOrderRows },
      { count: loyaltySignups },
      { data: recentPaidOrders },
      { count: categoryCount },
      { count: activeItemCount },
      { count: tableCount },
      { count: staffCount },
      { data: loyaltyRows },
    ] = await Promise.all([
      supabase
        .from("cafes")
        .select("slug, square_location_id")
        .eq("id", member.cafeId)
        .single(),
      supabase
        .from("orders")
        .select("total_cents, payment_status")
        .eq("cafe_id", member.cafeId)
        .in("payment_status", ["paid", "failed", "refunded"])
        .gte("created_at", todayIso),
      supabase
        .from("orders")
        .select("id, status, payment_status")
        .eq("cafe_id", member.cafeId)
        .in("status", ["new", "making", "ready"]),
      supabase
        .from("loyalty_accounts")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId)
        .gte("created_at", todayIso),
      // Most-ordered items: pull recent paid orders for this cafe, then
      // their items, then aggregate in JS. Two plain queries instead of a
      // single embedded-filter query, since there's no other precedent for
      // that syntax in this codebase and it can't be verified against a
      // live database here.
      supabase
        .from("orders")
        .select("id")
        .eq("cafe_id", member.cafeId)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("menu_categories")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId),
      supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId)
        .eq("is_active", true),
      supabase
        .from("tables")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId),
      admin
        .from("cafe_users")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId),
      supabase
        .from("loyalty_accounts")
        .select("id, points, visits, customers(name)")
        .eq("cafe_id", member.cafeId)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    const paidOrderIds = (recentPaidOrders ?? []).map((order) => order.id);
    const { data: itemRows } = paidOrderIds.length
      ? await supabase
          .from("order_items")
          .select("name_snapshot, quantity")
          .in("order_id", paidOrderIds)
      : { data: [] };

    const paidToday = (ordersToday ?? []).filter((order) => order.payment_status === "paid");
    const revenueTodayCents = paidToday.reduce((sum, order) => sum + order.total_cents, 0);
    const activeOrders = (activeOrderRows ?? []).filter(
      (order) => order.payment_status === "paid",
    ).length;
    const failedPayments = (ordersToday ?? []).filter(
      (order) => order.payment_status === "failed",
    ).length;
    const itemTotals = new Map<string, number>();
    for (const item of itemRows ?? []) {
      itemTotals.set(item.name_snapshot, (itemTotals.get(item.name_snapshot) ?? 0) + item.quantity);
    }

    metrics = {
      ordersToday: (ordersToday ?? []).length,
      revenueTodayCents,
      avgTicketCents: paidToday.length ? Math.round(revenueTodayCents / paidToday.length) : 0,
      activeOrders,
      loyaltySignups: loyaltySignups ?? 0,
      failedPayments,
      topItems: [...itemTotals.entries()]
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5),
    };
    hasMenu = (categoryCount ?? 0) > 0 && (activeItemCount ?? 0) > 0;
    hasTables = (tableCount ?? 0) > 0;
    hasExtraStaff = (staffCount ?? 0) > 1;
    cafeSlug = cafeRow?.slug ?? cafeSlug;
    cafeSquareLocationId = cafeRow?.square_location_id ?? null;
    recentLoyalty = (loyaltyRows ?? []).map((row) => ({
      id: row.id,
      name: row.customers?.name ?? "Guest",
      visits: row.visits,
    }));
  }

  const checklist: ChecklistItem[] = [
    {
      label: "Supabase connected",
      status: demoMode || (readiness.supabase.url && readiness.supabase.anonKey && readiness.supabase.serviceRoleKey) ? "done" : "blocked",
      detail: "Database, auth, and realtime.",
      href: "/dashboard/setup",
    },
    {
      label: "Square configured",
      status:
        demoMode ||
        (readiness.square.applicationId &&
          (readiness.square.locationId || Boolean(cafeSquareLocationId)) &&
          readiness.square.accessToken &&
          readiness.square.webhookSignatureKey)
          ? "done"
          : "blocked",
      detail: "Application, location, access token, webhook key.",
      href: "/dashboard/setup",
    },
    {
      label: "Phone OTP (Twilio Verify via Supabase)",
      status: demoMode || (readiness.supabase.url && readiness.supabase.anonKey) ? "done" : "blocked",
      detail: "Configured in the Supabase dashboard, not this app.",
      href: "/dashboard/setup",
    },
    {
      label: "Menu ready",
      status: hasMenu ? "done" : "blocked",
      detail: "At least one category with an active item.",
      href: "/dashboard/menu",
    },
    {
      label: "Tables & QR links",
      status: demoMode || (hasTables && readiness.qrSigningSecret) ? "done" : "blocked",
      detail: "At least one table with QR signing configured.",
      href: "/dashboard/tables",
    },
    {
      label: "Staff added",
      status: demoMode || hasExtraStaff ? "done" : "blocked",
      detail: "At least one teammate beyond the owner.",
      href: "/dashboard/staff",
    },
    {
      label: "Demo walkthrough",
      status: "manual",
      detail: "Scan the QR, order, and check the staff board yourself.",
      href: `/cafe/${cafeSlug}`,
    },
    {
      label: "Sandbox payment test",
      status: "manual",
      detail: "Run one real test order through Square sandbox before launch.",
      href: "/dashboard/tables",
    },
  ];

  return (
    <div>
      <p className="eyebrow">The Black Rabbit · pilot operations</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight">
        Pilot operations
      </h1>
      <p className="mt-2 text-muted-foreground">
        {demoMode
          ? "Seeded demo metrics — not connected to production data."
          : "Today's numbers and whether this pilot is ready to launch."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Orders today" value={String(metrics.ordersToday)} icon={ShoppingBag} />
        <MetricCard
          label="Revenue today"
          value={formatCurrency(metrics.revenueTodayCents)}
          icon={WalletCards}
        />
        <MetricCard
          label="Average ticket"
          value={formatCurrency(metrics.avgTicketCents)}
          icon={TicketPercent}
        />
        <MetricCard label="Active orders" value={String(metrics.activeOrders)} icon={ClipboardList} />
        <MetricCard label="Loyalty signups today" value={String(metrics.loyaltySignups)} icon={Users} />
        <MetricCard
          label="Failed payments today"
          value={String(metrics.failedPayments)}
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-2xl">Most ordered (recent)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topItems.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No paid orders yet — this fills in once the first orders come
                through.
              </p>
            ) : (
              metrics.topItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span className="font-heading text-lg">{item.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {item.quantity} sold
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Launch checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => (
              <ChecklistRow key={item.label} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {metrics.failedPayments > 0 && (
        <p className="mt-6 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          {metrics.failedPayments} payment{metrics.failedPayments === 1 ? "" : "s"}{" "}
          failed today.{" "}
          <Link href="/staff/orders" className="underline">
            Check the staff board&apos;s Problems column
          </Link>
          .
        </p>
      )}

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-2xl">Recent loyalty signups</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/customers">View all customers</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {recentLoyalty.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground sm:col-span-2">
              No loyalty signups yet — they&apos;ll show up here as customers
              join.
            </p>
          ) : (
            recentLoyalty.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <span className="font-heading text-lg">{customer.name}</span>
                <span className="eyebrow">{customer.visits} moons</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
