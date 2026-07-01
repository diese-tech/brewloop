"use client";

import {
  demoCafe,
  demoLoyaltyAccounts,
  demoOrders,
  demoStaff,
  demoTables,
} from "@/lib/demo-data";
import type {
  CafeOrder,
  CafeTable,
  LoyaltyAccount,
  MenuCategory,
  MenuItem,
  StaffMember,
} from "@/lib/types";

const KEYS = {
  orders: "brewloop-demo-orders",
  loyalty: "brewloop-demo-loyalty",
  categories: "brewloop-demo-categories",
  menu: "brewloop-demo-menu",
  tables: "brewloop-demo-tables",
  staff: "brewloop-demo-staff",
};

export const STORE_EVENT = "brewloop-store-change";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(STORE_EVENT));
}

export const demoStore = {
  getOrders: () => read<CafeOrder[]>(KEYS.orders, demoOrders),
  setOrders: (orders: CafeOrder[]) => write(KEYS.orders, orders),
  getLoyalty: () =>
    read<LoyaltyAccount[]>(KEYS.loyalty, demoLoyaltyAccounts),
  setLoyalty: (accounts: LoyaltyAccount[]) => write(KEYS.loyalty, accounts),
  getCategories: () =>
    read<MenuCategory[]>(KEYS.categories, demoCafe.categories),
  setCategories: (categories: MenuCategory[]) =>
    write(KEYS.categories, categories),
  getMenu: () => read<MenuItem[]>(KEYS.menu, demoCafe.items),
  setMenu: (items: MenuItem[]) => write(KEYS.menu, items),
  getTables: () => read<CafeTable[]>(KEYS.tables, demoTables),
  setTables: (tables: CafeTable[]) => write(KEYS.tables, tables),
  getStaff: () => read<StaffMember[]>(KEYS.staff, demoStaff),
  setStaff: (staff: StaffMember[]) => write(KEYS.staff, staff),
};
