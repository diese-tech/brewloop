import type { MenuCategory, MenuItem } from "@/lib/types";

export function categoryNameExists(
  categories: MenuCategory[],
  name: string,
  excludeId?: string,
) {
  const normalizedName = name.trim().toLocaleLowerCase();
  return categories.some(
    (category) =>
      category.id !== excludeId &&
      category.name.trim().toLocaleLowerCase() === normalizedName,
  );
}

export function nextCategorySortOrder(categories: MenuCategory[]) {
  return categories.length
    ? Math.max(...categories.map((category) => category.sortOrder)) + 1
    : 1;
}

export function categoryHasItems(items: MenuItem[], categoryId: string) {
  return items.some((item) => item.categoryId === categoryId);
}
