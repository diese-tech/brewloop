import { describe, expect, it } from "vitest";

import {
  categoryHasItems,
  categoryNameExists,
  nextCategorySortOrder,
} from "@/lib/menu-management";
import type { MenuCategory, MenuItem } from "@/lib/types";

const categories: MenuCategory[] = [
  { id: "coffee", name: "Coffee", sortOrder: 2 },
  { id: "tea", name: "Tea", sortOrder: 5 },
];

const items: MenuItem[] = [
  {
    id: "latte",
    categoryId: "coffee",
    name: "Latte",
    description: "",
    priceCents: 550,
    isActive: true,
  },
];

describe("menu management helpers", () => {
  it("detects duplicate category names without case or surrounding spaces", () => {
    expect(categoryNameExists(categories, " coffee ")).toBe(true);
    expect(categoryNameExists(categories, "COFFEE", "coffee")).toBe(false);
    expect(categoryNameExists(categories, "Pastries")).toBe(false);
  });

  it("places new categories after the highest existing sort order", () => {
    expect(nextCategorySortOrder(categories)).toBe(6);
    expect(nextCategorySortOrder([])).toBe(1);
  });

  it("prevents deleting categories that still contain items", () => {
    expect(categoryHasItems(items, "coffee")).toBe(true);
    expect(categoryHasItems(items, "tea")).toBe(false);
  });
});
