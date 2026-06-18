# Menu Onboarding Strategy

## Core answer

Yes, each business's menu needs to exist inside BrewLoop.

BrewLoop cannot reliably power QR ordering, loyalty, order history, analytics, or future customer segmentation unless menu categories and items are stored in the app database.

However, adding a new menu should be configuration, not engineering work.

## V1 approach

V1 can use simple owner-facing CRUD screens:

- Create category
- Create item
- Set description
- Set price
- Mark item active/inactive
- Assign item to category

This is enough for a demo and early pilot.

## V1.5 approach

V1.5 should reduce manual entry with a menu import flow.

Recommended import options:

1. CSV upload
2. Manual table-style editor
3. Duplicate/import from existing demo cafe
4. Bulk paste from spreadsheet text

Do not build complex POS sync before the product proves demand.

## Recommended CSV format

```csv
category,name,description,price,is_active
Coffee,Latte,Espresso with steamed milk,5.50,true
Coffee,Cold Brew,Slow-steeped cold coffee,4.75,true
Tea,Matcha Latte,Matcha with milk,5.75,true
Pastries,Croissant,Butter croissant,3.95,true
```

## Database mapping

CSV rows should map to:

- `menu_categories`
- `menu_items`

Import behavior:

- Create missing categories automatically.
- Match existing categories by normalized name.
- Create new items by default.
- Later, allow update/replace behavior.
- Store price as `price_cents`, not decimal dollars.

Example:

- CSV price `5.50` becomes `550` cents.

## Manual setup workflow

For early pilots, the BrewLoop operator can onboard a cafe manually:

1. Create cafe
2. Add categories
3. Add menu items
4. Mark unavailable items inactive
5. Generate QR code
6. Test customer ordering flow
7. Test staff order board
8. Launch pilot

The target is under 30 minutes per cafe for v1.5.

## Why menu data belongs in BrewLoop

Menu data is needed for:

- Customer browsing
- Cart creation
- Order item snapshots
- Order totals
- Loyalty rules
- Popular item reporting
- Future reorder/favorites
- Future campaign segmentation

Even if BrewLoop eventually integrates with Square, Toast, or another POS, BrewLoop still needs a normalized internal menu model.

## Integration strategy

POS/menu integrations should be later-stage accelerators, not v1 requirements.

Potential later options:

- Import menu from Square
- Sync menu availability from Square
- Push order to Square Orders API
- Export customer/loyalty data

Do not make integrations mandatory for base product value.

## Important design rule

Avoid custom menu code per shop.

Every cafe should use the same menu tables, same route structure, and same components. Differences between cafes should come from database settings:

- cafe name
- slug
- logo
- colors
- categories
- items
- pricing
- availability
- loyalty rules

If a new cafe requires a code change just to show its menu, the architecture is drifting in the wrong direction.

## Future menu features

Possible post-MVP additions:

- Item images
- Modifiers/add-ons
- Size variants
- Required/optional option groups
- Item availability by day/time
- Sold-out toggles
- Tax/service fee handling, only if payments are added
- Import preview before applying changes
- Export menu to CSV

These should wait until the basic menu/order/loyalty loop is validated with real shops.
