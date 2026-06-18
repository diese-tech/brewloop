"use client";

import { demoCafe, demoLoyaltyAccounts, demoOrders } from "@/lib/demo-data";
import type { CafeOrder, LoyaltyAccount, MenuItem } from "@/lib/types";

const KEYS = {
  orders: "brewloop-demo-orders",
  loyalty: "brewloop-demo-loyalty",
  menu: "brewloop-demo-menu",
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
  getMenu: () => read<MenuItem[]>(KEYS.menu, demoCafe.items),
  setMenu: (items: MenuItem[]) => write(KEYS.menu, items),
};
