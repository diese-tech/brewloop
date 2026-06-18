"use client";

import { useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dollarsToCents, formatCurrency } from "@/lib/commerce";
import { demoCafe } from "@/lib/demo-data";
import { demoStore } from "@/lib/demo-store";
import type { MenuItem } from "@/lib/types";

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>(demoCafe.items);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(demoCafe.categories[0].id);

  useEffect(() => setItems(demoStore.getMenu()), []);

  function save(nextItems: MenuItem[]) {
    setItems(nextItems);
    demoStore.setMenu(nextItems);
  }

  function toggleItem(itemId: string) {
    save(
      items.map((item) =>
        item.id === itemId ? { ...item, isActive: !item.isActive } : item,
      ),
    );
  }

  function addItem() {
    if (!name.trim() || !price.trim()) return;
    const item: MenuItem = {
      id: crypto.randomUUID(),
      categoryId,
      name: name.trim(),
      description: description.trim(),
      priceCents: dollarsToCents(price),
      isActive: true,
    };
    save([...items, item]);
    setName("");
    setDescription("");
    setPrice("");
  }

  return (
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
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">
                  {formatCurrency(item.priceCents)}
                </span>
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
            <Plus className="size-5" /> Add item
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
                {demoCafe.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            disabled={!name.trim() || !price.trim()}
            onClick={addItem}
          >
            <Save /> Save item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
