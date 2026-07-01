import { describe, expect, it } from "vitest";

import { tableLabelExists } from "@/lib/tables";
import type { CafeTable } from "@/lib/types";

const tables: CafeTable[] = [
  { id: "t1", label: "1", isActive: true },
  { id: "t2", label: "Patio 1", isActive: true },
];

describe("tableLabelExists", () => {
  it("detects duplicate labels without case or surrounding spaces", () => {
    expect(tableLabelExists(tables, " patio 1 ")).toBe(true);
    expect(tableLabelExists(tables, "PATIO 1", "t2")).toBe(false);
    expect(tableLabelExists(tables, "2")).toBe(false);
  });
});
