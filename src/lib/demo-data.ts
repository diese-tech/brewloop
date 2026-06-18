import type { Cafe, CafeOrder, LoyaltyAccount } from "@/lib/types";

export const demoCafe: Cafe = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Demo Coffee",
  slug: "demo-coffee",
  tagline: "Thoughtful coffee, easy pickup, rewards that stay simple.",
  primaryColor: "#6f4e37",
  categories: [
    { id: "coffee", name: "Coffee", sortOrder: 1 },
    { id: "tea", name: "Tea", sortOrder: 2 },
    { id: "pastries", name: "Pastries", sortOrder: 3 },
  ],
  items: [
    {
      id: "latte",
      categoryId: "coffee",
      name: "Latte",
      description: "Double espresso with silky steamed milk.",
      priceCents: 550,
      isActive: true,
    },
    {
      id: "cold-brew",
      categoryId: "coffee",
      name: "Cold Brew",
      description: "Slow-steeped for a smooth chocolate finish.",
      priceCents: 475,
      isActive: true,
    },
    {
      id: "matcha-latte",
      categoryId: "tea",
      name: "Matcha Latte",
      description: "Ceremonial matcha whisked with your choice of milk.",
      priceCents: 575,
      isActive: true,
    },
    {
      id: "croissant",
      categoryId: "pastries",
      name: "Croissant",
      description: "Flaky, buttery, and baked fresh each morning.",
      priceCents: 395,
      isActive: true,
    },
    {
      id: "blueberry-muffin",
      categoryId: "pastries",
      name: "Blueberry Muffin",
      description: "Tender crumb with lemon and fresh blueberries.",
      priceCents: 425,
      isActive: true,
    },
  ],
};

export const demoOrders: CafeOrder[] = [
  {
    id: "BL-1042",
    cafeId: demoCafe.id,
    customerName: "Maya",
    customerPhone: "555-0102",
    status: "new",
    orderType: "table",
    tableNumber: "12",
    notes: "Oat milk, please.",
    totalCents: 975,
    items: [
      {
        menuItemId: "latte",
        nameSnapshot: "Latte",
        quantity: 1,
        unitPriceCents: 550,
      },
      {
        menuItemId: "blueberry-muffin",
        nameSnapshot: "Blueberry Muffin",
        quantity: 1,
        unitPriceCents: 425,
      },
    ],
    createdAt: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
  {
    id: "BL-1041",
    cafeId: demoCafe.id,
    customerName: "Jordan",
    customerPhone: "555-0101",
    status: "making",
    orderType: "pickup",
    notes: "",
    totalCents: 950,
    items: [
      {
        menuItemId: "cold-brew",
        nameSnapshot: "Cold Brew",
        quantity: 2,
        unitPriceCents: 475,
      },
    ],
    createdAt: new Date(Date.now() - 11 * 60_000).toISOString(),
  },
];

export const demoLoyaltyAccounts: LoyaltyAccount[] = [
  {
    id: "loyalty-1",
    cafeId: demoCafe.id,
    name: "Jordan Lee",
    email: "jordan@example.com",
    phone: "555-0101",
    visits: 6,
    points: 60,
  },
  {
    id: "loyalty-2",
    cafeId: demoCafe.id,
    name: "Maya Chen",
    email: "maya@example.com",
    phone: "555-0102",
    visits: 3,
    points: 30,
  },
];

export function getCafeBySlug(slug: string) {
  return slug === demoCafe.slug ? demoCafe : null;
}
