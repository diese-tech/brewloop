import type { CafeTable } from "@/lib/types";

export function tableLabelExists(
  tables: CafeTable[],
  label: string,
  excludeId?: string,
) {
  const normalizedLabel = label.trim().toLocaleLowerCase();
  return tables.some(
    (table) =>
      table.id !== excludeId &&
      table.label.trim().toLocaleLowerCase() === normalizedLabel,
  );
}
