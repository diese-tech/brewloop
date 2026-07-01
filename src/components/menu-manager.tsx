"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dollarsToCents, formatCurrency } from "@/lib/commerce";
import { demoStore, STORE_EVENT } from "@/lib/demo-store";
import {
  categoryHasItems,
  categoryNameExists,
  nextCategorySortOrder,
} from "@/lib/menu-management";
import type { MenuCategory, MenuItem } from "@/lib/types";

export function MenuManager({
  demoMode,
  cafeSlug,
  initialCategories,
  initialItems,
}: {
  demoMode: boolean;
  cafeSlug?: string;
  initialCategories: MenuCategory[];
  initialItems: MenuItem[];
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      initialCategories.map((category) => [category.id, category.name]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!demoMode) return;
    const sync = () => {
      const storedItems = demoStore.getMenu();
      const storedCategories = demoStore.getCategories();
      setItems(storedItems);
      setCategories(storedCategories);
      setCategoryDrafts(
        Object.fromEntries(
          storedCategories.map((category) => [category.id, category.name]),
        ),
      );
    };
    sync();
    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [demoMode]);

  function saveItemsLocal(nextItems: MenuItem[]) {
    setItems(nextItems);
    if (demoMode) demoStore.setMenu(nextItems);
  }

  function saveCategoriesLocal(nextCategories: MenuCategory[]) {
    const sorted = [...nextCategories].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    setCategories(sorted);
    if (demoMode) demoStore.setCategories(sorted);
  }

  async function toggleItem(item: MenuItem) {
    const nextActive = !item.isActive;
    saveItemsLocal(
      items.map((candidate) =>
        candidate.id === item.id
          ? { ...candidate, isActive: nextActive }
          : candidate,
      ),
    );
    if (demoMode) return;
    setError(null);
    const response = await fetch("/api/menu/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isActive: nextActive }),
    });
    if (!response.ok) {
      saveItemsLocal(items);
      const result = await response.json().catch(() => ({}));
      setError(result.error ?? "Unable to update item.");
    }
  }

  function resetItemForm() {
    setEditingItemId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId(categories[0]?.id ?? "");
    setError(null);
  }

  function editItem(item: MenuItem) {
    setEditingItemId(item.id);
    setName(item.name);
    setDescription(item.description);
    setPrice((item.priceCents / 100).toFixed(2));
    setCategoryId(item.categoryId);
    setError(null);
  }

  async function saveItem() {
    if (!name.trim() || !price.trim()) return;
    let priceCents: number;
    try {
      priceCents = dollarsToCents(price);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Invalid price.",
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (demoMode) {
      const item: MenuItem = {
        id: editingItemId ?? crypto.randomUUID(),
        categoryId,
        name: trimmedName,
        description: trimmedDescription,
        priceCents,
        isActive:
          items.find((candidate) => candidate.id === editingItemId)?.isActive ??
          true,
      };
      saveItemsLocal(
        editingItemId
          ? items.map((candidate) =>
              candidate.id === editingItemId ? item : candidate,
            )
          : [...items, item],
      );
      resetItemForm();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (editingItemId) {
        const response = await fetch("/api/menu/items", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItemId,
            categoryId,
            name: trimmedName,
            description: trimmedDescription,
            priceCents,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Unable to update item.");
        saveItemsLocal(
          items.map((candidate) =>
            candidate.id === editingItemId
              ? { ...candidate, categoryId, name: trimmedName, description: trimmedDescription, priceCents }
              : candidate,
          ),
        );
      } else {
        const response = await fetch("/api/menu/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId,
            name: trimmedName,
            description: trimmedDescription,
            priceCents,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Unable to add item.");
        saveItemsLocal([...items, result as MenuItem]);
      }
      resetItemForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to save item.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addCategory() {
    const categoryName = newCategoryName.trim();
    if (!categoryName) return;
    if (categoryNameExists(categories, categoryName)) {
      setError("Category names must be unique.");
      return;
    }

    if (demoMode) {
      const category: MenuCategory = {
        id: crypto.randomUUID(),
        name: categoryName,
        sortOrder: nextCategorySortOrder(categories),
      };
      saveCategoriesLocal([...categories, category]);
      setCategoryDrafts((current) => ({ ...current, [category.id]: category.name }));
      setNewCategoryName("");
      setCategoryId(category.id);
      setError(null);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          sortOrder: nextCategorySortOrder(categories),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to add category.");
      const category = result as MenuCategory;
      saveCategoriesLocal([...categories, category]);
      setCategoryDrafts((current) => ({ ...current, [category.id]: category.name }));
      setNewCategoryName("");
      setCategoryId(category.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to add category.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function renameCategory(categoryIdToRename: string) {
    const categoryName = categoryDrafts[categoryIdToRename]?.trim();
    if (!categoryName) return;
    if (categoryNameExists(categories, categoryName, categoryIdToRename)) {
      setError("Category names must be unique.");
      return;
    }

    const applyRename = () =>
      saveCategoriesLocal(
        categories.map((category) =>
          category.id === categoryIdToRename
            ? { ...category, name: categoryName }
            : category,
        ),
      );

    if (demoMode) {
      applyRename();
      setError(null);
      return;
    }

    setError(null);
    const response = await fetch("/api/menu/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: categoryIdToRename, name: categoryName }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error ?? "Unable to rename category.");
      return;
    }
    applyRename();
  }

  async function deleteCategory(categoryIdToDelete: string) {
    if (categoryHasItems(items, categoryIdToDelete)) {
      setError("Move or remove this category's items before deleting it.");
      return;
    }

    const applyDelete = () => {
      const nextCategories = categories.filter(
        (category) => category.id !== categoryIdToDelete,
      );
      saveCategoriesLocal(nextCategories);
      setCategoryDrafts((current) => {
        const next = { ...current };
        delete next[categoryIdToDelete];
        return next;
      });
      if (categoryId === categoryIdToDelete) {
        setCategoryId(nextCategories[0]?.id ?? "");
      }
    };

    if (demoMode) {
      applyDelete();
      setError(null);
      return;
    }

    setError(null);
    const response = await fetch(
      `/api/menu/categories?id=${encodeURIComponent(categoryIdToDelete)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error ?? "Unable to delete category.");
      return;
    }
    applyDelete();
  }

  const previewCategory = categories.find((category) => category.id === categoryId);
  const previewPriceCents = (() => {
    try {
      return price.trim() ? dollarsToCents(price) : 0;
    } catch {
      return 0;
    }
  })();

  return (
    <div className="space-y-6">
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Menu categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 && (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No categories yet. Add one below (e.g. &quot;Signature
              Potions&quot;) before adding menu items — items need a category
              to appear on the customer menu.
            </p>
          )}
          {[...categories]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row"
              >
                <Input
                  aria-label={`${category.name} category name`}
                  value={categoryDrafts[category.id] ?? category.name}
                  onChange={(event) =>
                    setCategoryDrafts((current) => ({
                      ...current,
                      [category.id]: event.target.value,
                    }))
                  }
                />
                <Button
                  variant="outline"
                  onClick={() => void renameCategory(category.id)}
                >
                  <Save /> Rename
                </Button>
                <Button
                  variant="outline"
                  disabled={categoryHasItems(items, category.id)}
                  onClick={() => void deleteCategory(category.id)}
                  aria-label={`Delete ${category.name} category`}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            ))}
          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
            <Input
              aria-label="New category name"
              placeholder="New category"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
            <Button
              disabled={!newCategoryName.trim() || busy}
              onClick={() => void addCategory()}
            >
              <Plus /> Add category
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="bg-card/90">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Menu items</CardTitle>
            {cafeSlug && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/cafe/${cafeSlug}/order`} target="_blank">
                  <ExternalLink /> View customer menu
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No menu items yet. Use the form on the right to add your
                first potion.
              </p>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <Badge variant={item.isActive ? "secondary" : "outline"}>
                      {item.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm">
                    {formatCurrency(item.priceCents)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editItem(item)}
                  >
                    <Pencil /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void toggleItem(item)}
                  >
                    {item.isActive ? "Hide" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="h-fit bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingItemId ? (
                  <Pencil className="size-5" />
                ) : (
                  <Plus className="size-5" />
                )}
                {editingItemId ? "Edit item" : "Add item"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Name</Label>
                <Input
                  id="item-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-description">Description</Label>
                <Input
                  id="item-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-price">Price (USD)</Label>
                <Input
                  id="item-price"
                  inputMode="decimal"
                  placeholder="5.50"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                className="w-full"
                disabled={
                  !name.trim() ||
                  !price.trim() ||
                  !categoryId ||
                  categories.length === 0 ||
                  busy
                }
                onClick={() => void saveItem()}
              >
                <Save /> {busy ? "Saving…" : editingItemId ? "Update item" : "Save item"}
              </Button>
              {editingItemId && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={resetItemForm}
                >
                  <X /> Cancel editing
                </Button>
              )}
            </CardContent>
          </Card>

          {name.trim() && (
            <div>
              <p className="eyebrow mb-2">Customer menu preview</p>
              <Card className="card card--spine bg-card/90">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-2xl">{name}</CardTitle>
                    <span className="font-mono text-xs text-[var(--brass-bright)]">
                      {formatCurrency(previewPriceCents)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="min-h-10 font-mono text-[0.58rem] uppercase leading-5 text-muted-foreground">
                    {description || "Add a description customers will see."}
                  </p>
                  {previewCategory && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Appears under &quot;{previewCategory.name}&quot;
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
