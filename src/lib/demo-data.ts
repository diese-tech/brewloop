import type { Cafe, CafeOrder, LoyaltyAccount } from "@/lib/types";

export const demoCafe: Cafe = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "The Black Rabbit Bookbar",
  slug: "black-rabbit",
  tagline: "Books, brews & a little bit of magic.",
  primaryColor: "#7a1b2b",
  address: "Clermont, Florida",
  hours: "Open today · 7am–10pm",
  externalLabel: "Browse book club nights",
  categories: [
    { id: "potions", name: "Signature Potions", sortOrder: 1 },
    { id: "bites", name: "Books & Bites", sortOrder: 2 },
  ],
  items: [
    {
      id: "frankenstein",
      categoryId: "potions",
      name: "Be My Frankenstein",
      description: "Espresso · bruised plum · oat",
      priceCents: 650,
      isActive: true,
    },
    {
      id: "ghost-malone",
      categoryId: "potions",
      name: "Ghost Malone",
      description: "White mocha · vanilla · ghost-pepper dust",
      priceCents: 600,
      isActive: true,
    },
    {
      id: "plague",
      categoryId: "potions",
      name: "The Plague",
      description: "Charcoal cold brew · black honey · citrus",
      priceCents: 625,
      isActive: true,
    },
    {
      id: "count-chocula",
      categoryId: "potions",
      name: "Count Chocula",
      description: "Dark mocha · hazelnut · malted cream",
      priceCents: 575,
      isActive: true,
    },
    {
      id: "frankenberry",
      categoryId: "potions",
      name: "Frankenberry",
      description: "Strawberry matcha · vanilla cold foam",
      priceCents: 625,
      isActive: true,
    },
    {
      id: "familiars-biscuit",
      categoryId: "bites",
      name: "Familiar's Biscuit",
      description: "Rosemary biscuit · blackberry preserves",
      priceCents: 725,
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
    items: [
      {
        menuItemId: "ghost-malone",
        nameSnapshot: "Ghost Malone",
        quantity: 1,
        unitPriceCents: 600,
      },
      {
        menuItemId: "familiars-biscuit",
        nameSnapshot: "Familiar's Biscuit",
        quantity: 1,
        unitPriceCents: 725,
      },
    ],
    subtotalCents: 1325,
    tipCents: 239,
    paymentStatus: "paid",
    totalCents: 1564,
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
    subtotalCents: 1250,
    tipCents: 225,
    paymentStatus: "paid",
    totalCents: 1475,
    items: [
      {
        menuItemId: "plague",
        nameSnapshot: "The Plague",
        quantity: 2,
        unitPriceCents: 625,
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
  return slug === demoCafe.slug || slug === "demo-coffee" ? demoCafe : null;
}
