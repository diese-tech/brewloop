"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dollarsToCents, formatCurrency } from "@/lib/commerce";
import { demoCafe } from "@/lib/demo-data";
import { demoStore } from "@/lib/demo-store";
import {
  categoryHasItems,
  categoryNameExists,
  nextCategorySortOrder,
} from "@/lib/menu-management";
import type { MenuCategory, MenuItem } from "@/lib/types";

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>(demoCafe.items);
  const [categories, setCategories] = useState<MenuCategory[]>(
    demoCafe.categories,
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(demoCafe.categories[0].id);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedItems = demoStore.getMenu();
    const storedCategories = demoStore.getCategories();
    setItems(storedItems);
    setCategories(storedCategories);
    setCategoryDrafts(
      Object.fromEntries(
        storedCategories.map((category) => [category.id, category.name]),
      ),
    );
    if (storedCategories.length) {
      setCategoryId(storedCategories[0].id);
    }
  }, []);

  function saveItems(nextItems: MenuItem[]) {
    setItems(nextItems);
    demoStore.setMenu(nextItems);
  }

  function saveCategories(nextCategories: MenuCategory[]) {
    const sorted = [...nextCategories].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    setCategories(sorted);
    demoStore.setCategories(sorted);
  }

  function toggleItem(itemId: string) {
    saveItems(
      items.map((item) =>
        item.id === itemId ? { ...item, isActive: !item.isActive } : item,
      ),
    );
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

  function saveItem() {
    if (!name.trim() || !price.trim()) return;
    try {
      const item: MenuItem = {
        id: editingItemId ?? crypto.randomUUID(),
        categoryId,
        name: name.trim(),
        description: description.trim(),
        priceCents: dollarsToCents(price),
        isActive:
          items.find((candidate) => candidate.id === editingItemId)?.isActive ??
          true,
      };
      saveItems(
        editingItemId
          ? items.map((candidate) =>
              candidate.id === editingItemId ? item : candidate,
            )
          : [...items, item],
      );
      resetItemForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Invalid price.",
      );
    }
  }

  function addCategory() {
    const categoryName = newCategoryName.trim();
    if (!categoryName) return;
    if (categoryNameExists(categories, categoryName)) {
      setError("Category names must be unique.");
      return;
    }
    const category: MenuCategory = {
      id: crypto.randomUUID(),
      name: categoryName,
      sortOrder: nextCategorySortOrder(categories),
    };
    saveCategories([...categories, category]);
    setCategoryDrafts((current) => ({
      ...current,
      [category.id]: category.name,
    }));
    setNewCategoryName("");
    setCategoryId(category.id);
    setError(null);
  }

  function renameCategory(categoryIdToRename: string) {
    const categoryName = categoryDrafts[categoryIdToRename]?.trim();
    if (!categoryName) return;
    if (
      categoryNameExists(categories, categoryName, categoryIdToRename)
    ) {
      setError("Category names must be unique.");
      return;
    }
    saveCategories(
      categories.map((category) =>
        category.id === categoryIdToRename
          ? { ...category, name: categoryName }
          : category,
      ),
    );
    setError(null);
  }

  function deleteCategory(categoryIdToDelete: string) {
    if (categoryHasItems(items, categoryIdToDelete)) {
      setError("Move or remove this category's items before deleting it.");
      return;
    }
    const nextCategories = categories.filter(
      (category) => category.id !== categoryIdToDelete,
    );
    saveCategories(nextCategories);
    setCategoryDrafts((current) => {
      const next = { ...current };
      delete next[categoryIdToDelete];
      return next;
    });
    if (categoryId === categoryIdToDelete) {
      setCategoryId(nextCategories[0]?.id ?? "");
    }
    setError(null);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/90">
        <CardHeader>
          <CardTitle>Menu categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                  onClick={() => renameCategory(category.id)}
                >
                  <Save /> Rename
                </Button>
                <Button
                  variant="outline"
                  disabled={categoryHasItems(items, category.id)}
                  onClick={() => deleteCategory(category.id)}
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
              disabled={!newCategoryName.trim()}
              onClick={addCategory}
            >
              <Plus /> Add category
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.isActive ? "Hide" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
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
                categories.length === 0
              }
              onClick={saveItem}
            >
              <Save /> {editingItemId ? "Update item" : "Save item"}
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
      </div>
    </div>
  );
}
