# ADR 0004: Menu and Modifiers

## Status

Accepted

## Context

BrewLoop needs each cafe's menu in order to power QR browsing, cart creation, order totals, order history, loyalty, analytics, and future campaign segmentation.

Real cafes also need drink customization such as milk type, size, whip/no-whip, cold foam, extra espresso shots, syrups, and substitutions.

However, full modifier support can become complex quickly and should not block MVP validation.

## Decision

BrewLoop will store cafe menu data internally.

V1 menu model:

- `menu_categories`
- `menu_items`

V1 order customization:

- Use a simple free-text notes field for order/item customizations.

Future modifier model:

- `modifier_groups`
- `modifiers`
- `menu_item_modifier_groups`
- `order_item_modifiers`

## Rationale

Menu data must exist in BrewLoop because it powers:

- Customer browsing
- Cart creation
- Order item snapshots
- Order totals
- Loyalty logic
- Popular item reporting
- Future reorder/favorites
- Future campaign segmentation

But v1 should avoid a deep modifier system because the immediate goal is proving the core order/loyalty loop.

## Menu onboarding direction

V1:

- Owner-facing CRUD screens
- Manual category/item setup

V1.5:

- CSV upload
- Bulk paste from spreadsheet
- Table-style editor
- Duplicate/import from demo or template cafe

V2+:

- Optional POS/menu imports
- Square menu import research
- Modifier groups
- Size variants
- Availability rules

## Modifier direction

Future modifier groups should be reusable and database-driven.

Examples:

- Milk Type
  - whole milk
  - oat milk
  - almond milk
- Size
  - small
  - medium
  - large
- Add-ons
  - cold foam
  - whipped cream
  - extra espresso shot
- Preferences
  - no ice
  - half sweet
  - no whip

Design rules:

- Do not hardcode shop-specific drink logic.
- Modifier groups can be optional or required.
- Modifiers can add cost.
- Order items should snapshot selected modifiers so historical orders remain accurate even if the menu changes later.

## Consequences

Positive:

- V1 stays simpler.
- Menu model remains future-compatible.
- Real cafe customization needs are acknowledged early.

Negative:

- V1 customization through notes is less structured.
- Staff may need to manually interpret notes.
- Item-level analytics will not understand modifiers until the future model exists.

## Follow-ups

- Keep `notes` in the v1 order model.
- Revisit modifiers after the first pilot shows which customizations are actually used.
- Add modifier tables only when customer/staff flow requires it.
