"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, UserRoundPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import type { StaffMember, StaffRole } from "@/lib/types";

const ROLE_LABEL: Record<StaffRole, string> = {
  owner: "Owner",
  manager: "Manager",
  barista: "Barista",
};

export function StaffManager({
  demoMode,
  isOwner,
  initialStaff,
}: {
  demoMode: boolean;
  isOwner: boolean;
  initialStaff: StaffMember[];
}) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("barista");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!demoMode) return;
    const sync = () => setStaff(demoStore.getStaff());
    sync();
    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [demoMode]);

  const canManage = demoMode || isOwner;

  async function addStaff() {
    if (!name.trim() || !phone.trim()) return;
    setError(null);

    if (demoMode) {
      const member: StaffMember = {
        id: crypto.randomUUID(),
        userId: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        role,
      };
      const next = [...staff, member];
      setStaff(next);
      demoStore.setStaff(next);
      setName("");
      setPhone("");
      setRole("barista");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/staff/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), role }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to add staff member.");
      setStaff((current) => [...current, result as StaffMember]);
      setName("");
      setPhone("");
      setRole("barista");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to add staff member.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeStaff(member: StaffMember) {
    setError(null);
    if (demoMode) {
      const next = staff.filter((candidate) => candidate.id !== member.id);
      setStaff(next);
      demoStore.setStaff(next);
      return;
    }

    const previous = staff;
    setStaff(staff.filter((candidate) => candidate.id !== member.id));
    try {
      const response = await fetch(
        `/api/staff/members?id=${encodeURIComponent(member.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Unable to remove staff member.");
      }
    } catch (caughtError) {
      setStaff(previous);
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to remove staff member.",
      );
    }
  }

  if (!canManage) {
    return (
      <Card className="bg-card/90">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Staff access management is owner-only. Ask an owner to add, remove,
          or view staff.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Staff members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {staff.length === 0 && (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No staff added yet. Use the form to add someone by phone
              number.
            </p>
          )}
          {staff.map((member) => (
            <div
              key={member.id}
              className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{member.name || "Unnamed"}</h3>
                  <Badge variant="outline">{ROLE_LABEL[member.role]}</Badge>
                </div>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {member.phone || "No phone on file"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void removeStaff(member)}
                aria-label={`Remove ${member.name || member.phone}`}
              >
                <Trash2 /> Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="h-fit bg-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRoundPlus className="size-5" /> Add staff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff-name">Name</Label>
            <Input
              id="staff-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-phone">Phone</Label>
            <Input
              id="staff-phone"
              placeholder="+1 352 555 0148"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as StaffRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barista">Barista</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="w-full"
            disabled={!name.trim() || !phone.trim() || busy}
            onClick={() => void addStaff()}
          >
            <Plus /> {busy ? "Adding…" : "Add staff"}
          </Button>
          {!demoMode && (
            <p className="text-xs text-muted-foreground">
              If they&apos;ve never signed in before, this creates their
              account so they can sign in with this phone right away — no
              email or password needed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
