"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Copy, Plus, Printer, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import { tableLabelExists } from "@/lib/tables";
import type { CafeTable } from "@/lib/types";

export function TablesManager({
  demoMode,
  cafeSlug,
  initialTables,
  qrSigningSecretConfigured,
}: {
  demoMode: boolean;
  cafeSlug: string;
  initialTables: CafeTable[];
  qrSigningSecretConfigured: boolean;
}) {
  const [tables, setTables] = useState<CafeTable[]>(initialTables);
  const [newLabel, setNewLabel] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialTables.map((table) => [table.id, table.label])),
  );
  const [links, setLinks] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!demoMode) return;
    const sync = () => {
      const stored = demoStore.getTables();
      setTables(stored);
      setDrafts(Object.fromEntries(stored.map((table) => [table.id, table.label])));
    };
    sync();
    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [demoMode]);

  function saveLocal(next: CafeTable[]) {
    setTables(next);
    if (demoMode) demoStore.setTables(next);
  }

  async function addTable() {
    const label = newLabel.trim();
    if (!label) return;
    if (tableLabelExists(tables, label)) {
      setError("Table labels must be unique.");
      return;
    }
    setError(null);

    if (demoMode) {
      const table: CafeTable = { id: crypto.randomUUID(), label, isActive: true };
      saveLocal([...tables, table]);
      setDrafts((current) => ({ ...current, [table.id]: table.label }));
      setNewLabel("");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to add table.");
      const table = result as CafeTable;
      saveLocal([...tables, table]);
      setDrafts((current) => ({ ...current, [table.id]: table.label }));
      setNewLabel("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to add table.");
    } finally {
      setBusy(false);
    }
  }

  async function renameTable(id: string) {
    const label = drafts[id]?.trim();
    if (!label) return;
    if (tableLabelExists(tables, label, id)) {
      setError("Table labels must be unique.");
      return;
    }
    const apply = () => {
      saveLocal(tables.map((table) => (table.id === id ? { ...table, label } : table)));
      setLinks((current) => {
        if (!(id in current)) return current;
        const next = { ...current };
        delete next[id];
        return next;
      });
    };

    if (demoMode) {
      apply();
      setError(null);
      return;
    }
    setError(null);
    try {
      const response = await fetch("/api/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, label }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Unable to rename table.");
      }
      apply();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to rename table.");
    }
  }

  async function toggleTable(table: CafeTable) {
    const nextActive = !table.isActive;
    const apply = () =>
      saveLocal(
        tables.map((candidate) =>
          candidate.id === table.id ? { ...candidate, isActive: nextActive } : candidate,
        ),
      );
    apply();
    if (demoMode) return;
    setError(null);
    try {
      const response = await fetch("/api/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: table.id, isActive: nextActive }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Unable to update table.");
      }
    } catch (caughtError) {
      saveLocal(tables);
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update table.");
    }
  }

  async function deleteTable(id: string) {
    const apply = () => saveLocal(tables.filter((table) => table.id !== id));
    if (demoMode) {
      apply();
      setError(null);
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/tables?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Unable to delete table.");
      }
      apply();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete table.");
    }
  }

  async function generateLink(table: CafeTable) {
    setBusyId(table.id);
    setError(null);
    try {
      let url: string;
      if (demoMode) {
        url = `${window.location.origin}/cafe/${cafeSlug}/order?t=${encodeURIComponent(table.label)}`;
      } else {
        const response = await fetch(
          `/api/qr/table?slug=${encodeURIComponent(cafeSlug)}&table=${encodeURIComponent(table.label)}`,
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Unable to generate link.");
        url = result.url as string;
      }
      setLinks((current) => ({ ...current, [table.id]: url }));
      await navigator.clipboard.writeText(url).catch(() => undefined);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to generate link.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyAllLinks() {
    setError(null);
    const lines: string[] = [];
    for (const table of tables) {
      if (!table.isActive) continue;
      let url = links[table.id];
      if (!url) {
        try {
          if (demoMode) {
            url = `${window.location.origin}/cafe/${cafeSlug}/order?t=${encodeURIComponent(table.label)}`;
          } else {
            const response = await fetch(
              `/api/qr/table?slug=${encodeURIComponent(cafeSlug)}&table=${encodeURIComponent(table.label)}`,
            );
            const result = await response.json();
            if (!response.ok) throw new Error(result.error ?? "Unable to generate link.");
            url = result.url as string;
          }
          setLinks((current) => ({ ...current, [table.id]: url }));
        } catch (caughtError) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to generate links.");
          return;
        }
      }
      lines.push(`${table.label}: ${url}`);
    }
    await navigator.clipboard.writeText(lines.join("\n")).catch(() => undefined);
  }

  return (
    <div className="space-y-6">
      {!demoMode && !qrSigningSecretConfigured && (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          QR signing secret isn&apos;t configured. Table links can&apos;t be
          generated until it is — see the setup readiness page.
        </p>
      )}
      <Card className="bg-card/90">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Tables</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void copyAllLinks()}
          >
            <Copy /> Copy all links
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {tables.length === 0 && (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No tables yet. Add one below — a label like &quot;1&quot; or
              &quot;Patio 2&quot; works.
            </p>
          )}
          {tables.map((table) => (
            <div
              key={table.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-1 items-center gap-2">
                <Input
                  aria-label={`${table.label} table label`}
                  value={drafts[table.id] ?? table.label}
                  onChange={(event) =>
                    setDrafts((current) => ({ ...current, [table.id]: event.target.value }))
                  }
                  className="max-w-40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void renameTable(table.id)}
                >
                  <Save /> Rename
                </Button>
                <Badge variant={table.isActive ? "secondary" : "outline"}>
                  {table.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {links[table.id] && (
                  <span className="max-w-52 truncate font-mono text-xs text-muted-foreground">
                    {links[table.id]}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    busyId === table.id ||
                    !table.isActive ||
                    (!demoMode && !qrSigningSecretConfigured)
                  }
                  onClick={() => void generateLink(table)}
                >
                  <Copy /> {busyId === table.id ? "Generating…" : "Copy link"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void toggleTable(table)}
                >
                  {table.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void deleteTable(table.id)}
                  aria-label={`Delete ${table.label} table`}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
            <Input
              aria-label="New table label"
              placeholder="New table (e.g. 5 or Patio 2)"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
            />
            <Button disabled={!newLabel.trim() || busy} onClick={() => void addTable()}>
              <Plus /> Add table
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className="bg-card/90 print:hidden">
        <CardHeader>
          <CardTitle>Print list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Copy each table&apos;s link above, then print this page for a
            reference sheet while you set up table tents. QR code images
            aren&apos;t generated yet — links can be pasted into any QR
            generator until that ships.
          </p>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print table list
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
