export type MenuCategory = {
  id: string;
  name: string;
  sortOrder: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  isActive: boolean;
};

export type OrderStatus = "new" | "making" | "ready" | "completed";
export type OrderType = "pickup" | "table";

export type OrderItem = {
  menuItemId: string;
  nameSnapshot: string;
  quantity: number;
  unitPriceCents: number;
};

export type CafeOrder = {
  id: string;
  cafeId: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  orderType: OrderType;
  tableNumber?: string;
  notes: string;
  subtotalCents?: number;
  taxCents?: number;
  tipCents?: number;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded" | "unpaid";
  totalCents: number;
  items: OrderItem[];
  createdAt: string;
};

export type LoyaltyAccount = {
  id: string;
  cafeId: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  points: number;
};

export type Cafe = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  primaryColor: string;
  address?: string;
  hours?: string;
  externalLabel?: string;
  squareTaxIds?: string[];
  squareLocationId?: string;
  categories: MenuCategory[];
  items: MenuItem[];
};
