import { CircleAlert } from "lucide-react";
import Link from "next/link";

import { AcceptingOrdersToggle } from "@/components/accepting-orders-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCafeMember } from "@/lib/auth";
import { getProductionReadiness, isDemoMode } from "@/lib/config";
import { demoCafe } from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function StatusBadge({
  ok,
  okLabel = "Configured",
  missingLabel = "Missing",
}: {
  ok: boolean;
  okLabel?: string;
  missingLabel?: string;
}) {
  return (
    <Badge variant={ok ? "default" : "destructive"}>
      {ok ? okLabel : missingLabel}
    </Badge>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export default async function SetupPage() {
  const member = await requireCafeMember(["owner", "manager"]);
  const demoMode = isDemoMode();
  const readiness = getProductionReadiness();

  let cafeProfile: {
    name: string;
    tagline: string | null;
    address: string | null;
    hours: string | null;
    logoUrl: string | null;
    acceptingOrders: boolean;
    squareLocationId: string | null;
  };
  let staffCount: number | null = null;
  let categoryCount = 0;
  let activeItemCount = 0;

  if (demoMode) {
    cafeProfile = {
      name: demoCafe.name,
      tagline: demoCafe.tagline,
      address: demoCafe.address ?? null,
      hours: demoCafe.hours ?? null,
      logoUrl: null,
      acceptingOrders: demoCafe.acceptingOrders,
      squareLocationId: demoCafe.squareLocationId ?? null,
    };
    staffCount = 1;
    categoryCount = demoCafe.categories.length;
    activeItemCount = demoCafe.items.filter((item) => item.isActive).length;
  } else {
    const supabase = await getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data: cafe } = await supabase
      .from("cafes")
      .select(
        "name, tagline, address, hours, logo_url, accepting_orders, square_location_id",
      )
      .eq("id", member.cafeId)
      .single();
    cafeProfile = {
      name: cafe?.name ?? "Unknown cafe",
      tagline: cafe?.tagline ?? null,
      address: cafe?.address ?? null,
      hours: cafe?.hours ?? null,
      logoUrl: cafe?.logo_url ?? null,
      acceptingOrders: cafe?.accepting_orders ?? true,
      squareLocationId: cafe?.square_location_id ?? null,
    };
    if (member.role === "owner") {
      const { count } = await supabase
        .from("cafe_users")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId);
      staffCount = count ?? 0;
    }
    const [{ count: categories }, { count: items }] = await Promise.all([
      supabase
        .from("menu_categories")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId),
      supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("cafe_id", member.cafeId)
        .eq("is_active", true),
    ]);
    categoryCount = categories ?? 0;
    activeItemCount = items ?? 0;
  }

  return (
    <div>
      <p className="eyebrow">The Black Rabbit · setup &amp; readiness</p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight">
        Launch readiness
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        What&apos;s configured, what&apos;s missing, and what still needs a
        human before this pilot can go live.
      </p>

      {demoMode && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          Demo mode is on. The sections below show seeded example readiness,
          not real production credentials. Production configuration is
          checked only when demo mode is off.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cafe profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Name">
              <span className="font-medium">{cafeProfile.name}</span>
            </Row>
            <Row label="Tagline">
              <span className="text-right text-sm">
                {cafeProfile.tagline || "Not set"}
              </span>
            </Row>
            <Row label="Address">
              <span className="text-right text-sm">
                {cafeProfile.address || "Not set"}
              </span>
            </Row>
            <Row label="Hours">
              <span className="text-right text-sm">
                {cafeProfile.hours || "Not set"}
              </span>
            </Row>
            <Row label="Logo">
              <StatusBadge
                ok={Boolean(cafeProfile.logoUrl)}
                okLabel="Set"
                missingLabel="Not set"
              />
            </Row>
            <p className="mt-4 text-xs text-muted-foreground">
              Profile basics are operator-managed for the pilot — ask
              BrewLoop to update name, tagline, address, hours, or branding.
            </p>
            <div className="mt-4 border-t border-border pt-4">
              {demoMode ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {cafeProfile.acceptingOrders
                        ? "Accepting online orders"
                        : "Online ordering paused"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Demo mode always simulates an open, orderable cafe.
                    </p>
                  </div>
                  <Badge variant="outline">Demo only</Badge>
                </div>
              ) : (
                <AcceptingOrdersToggle
                  initialValue={cafeProfile.acceptingOrders}
                  canEdit={member.role === "owner"}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Categories">
              <span className="font-medium">{categoryCount}</span>
            </Row>
            <Row label="Active items">
              <span className="font-medium">{activeItemCount}</span>
            </Row>
            <Row label="Menu is orderable">
              <StatusBadge ok={categoryCount > 0 && activeItemCount > 0} />
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tables &amp; QRs</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="QR signing secret">
              <StatusBadge ok={demoMode || readiness.qrSigningSecret} />
            </Row>
            <p className="mt-4 text-xs text-muted-foreground">
              Add tables and generate/copy signed order links from the
              tables screen.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/dashboard/tables">Manage tables &amp; QRs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Staff</CardTitle>
          </CardHeader>
          <CardContent>
            {staffCount === null ? (
              <p className="text-sm text-muted-foreground">
                Staff management is visible to owners. Ask an owner for the
                current roster.
              </p>
            ) : (
              <Row label="Staff accounts">
                <span className="font-medium">{staffCount}</span>
              </Row>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Add staff by phone — they sign in immediately, no email or
              password needed.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/dashboard/staff">Manage staff access</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Environment">
              <Badge variant="outline">
                {demoMode ? "n/a (demo)" : readiness.square.environment}
              </Badge>
            </Row>
            <Row label="Application ID">
              <StatusBadge ok={demoMode || readiness.square.applicationId} />
            </Row>
            <Row label="Location ID">
              <StatusBadge
                ok={
                  demoMode ||
                  readiness.square.locationId ||
                  Boolean(cafeProfile.squareLocationId)
                }
              />
            </Row>
            <Row label="Access token">
              <StatusBadge ok={demoMode || readiness.square.accessToken} />
            </Row>
            <Row label="Webhook signature key">
              <StatusBadge
                ok={demoMode || readiness.square.webhookSignatureKey}
              />
            </Row>
            <p className="mt-4 text-xs text-muted-foreground">
              Values themselves are never shown here — only whether each is
              set.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Loyalty &amp; SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Supabase URL">
              <StatusBadge ok={demoMode || readiness.supabase.url} />
            </Row>
            <Row label="Supabase anon key">
              <StatusBadge ok={demoMode || readiness.supabase.anonKey} />
            </Row>
            <Row label="Supabase service role key">
              <StatusBadge ok={demoMode || readiness.supabase.serviceRoleKey} />
            </Row>
            <p className="mt-4 text-xs text-muted-foreground">
              Phone loyalty sign-in uses Supabase Auth with Twilio Verify as
              the SMS provider. Twilio credentials do not belong in this
              application — Twilio Verify is configured directly in the
              Supabase dashboard. The rows above only confirm BrewLoop can
              reach Supabase at all.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Mode">
              <Badge variant={demoMode ? "outline" : "default"}>
                {demoMode ? "Demo" : "Production"}
              </Badge>
            </Row>
            <Row label="App URL">
              <StatusBadge ok={demoMode || readiness.appUrl} />
            </Row>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
