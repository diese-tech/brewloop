# BrewLoop Design Brief

This document guides the next prototyping pass for BrewLoop.

It translates the existing product decisions into concrete UX, visual direction, screen behavior, and prototype acceptance criteria.

## Current repo state

BrewLoop already has a working Next.js prototype scaffold with:

- Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui-style components
- Supabase packages installed
- Vitest configured
- Public landing page
- Demo cafe route: `/cafe/demo-coffee`
- Customer order route: `/cafe/demo-coffee/order`
- Table QR support via `?t=12`
- Rewards route: `/cafe/demo-coffee/rewards`
- Staff order board: `/staff/orders`
- Owner dashboard: `/dashboard`
- Owner menu management: `/dashboard/menu`
- Browser-storage demo adapter
- Supabase migration and seed documentation

The current product is demoable, but the UI should be upgraded into a more polished prototype that feels credible to a real local cafe owner.

## Prototype objective

Create a polished, clickable, pilot-ready prototype that can be shown to a local cafe owner in under five minutes.

The prototype should answer:

> Can a shop owner understand how BrewLoop helps them capture customers, run lightweight QR orders, and encourage repeat visits without replacing their POS?

## Design principles

### 1. Local cafe first

BrewLoop should feel warm, practical, and owner-friendly.

Avoid:

- crypto/SaaS bro energy
- enterprise dashboard overload
- fake AI language
- generic POS-clone aesthetics

Use:

- warm neutrals
- coffee/cafe cues
- clear spacing
- readable cards
- obvious actions
- calm confidence

### 2. No-POS-replacement clarity

The prototype must repeatedly make clear:

- no online payment in the current pilot
- customer pays at the cafe
- BrewLoop complements the existing register/POS
- BrewLoop's value is customer capture and repeat visits

### 3. Mobile-first customer flow

Customer screens should look excellent on a phone.

The QR flow is the wedge, so `/cafe/[slug]`, `/order`, and `/rewards` should feel better on mobile than desktop.

### 4. Staff speed over beauty

The staff board should be glanceable, touch-friendly, and low training.

A barista should understand it immediately.

### 5. Owner confidence

The owner dashboard should make BrewLoop feel like a business tool, not just a menu demo.

Prioritize:

- orders today
- customer capture
- loyalty signups
- repeat customers
- menu control

Do not prioritize:

- revenue charts
- payment analytics
- inventory
- scheduling

## Primary demo story

Use this sequence for the prototype:

1. Owner opens BrewLoop landing page.
2. Owner opens Demo Coffee.
3. Customer scans QR and lands on the cafe page.
4. Customer browses menu.
5. Customer adds items.
6. Customer enters name and optional phone.
7. Customer adds note like `oat milk, no whip`.
8. Customer places order.
9. Staff sees the order on the board.
10. Staff advances order from New → Making → Ready → Completed.
11. Customer joins rewards.
12. Owner views dashboard and sees customer/loyalty value.
13. Owner edits menu availability or adds an item.

## Target screens

### 1. Marketing landing page `/`

Current state:

- Hero exists.
- Feature cards exist.
- CTA links to demo cafe and staff board.

Prototype goals:

- Make the value proposition sharper.
- Add a simple demo path section.
- Add a "built for cafes that already have a register" message.
- Add owner-facing CTA: `Launch a demo cafe` or `View Demo Coffee`.

Content direction:

- Headline: `Turn QR orders into regulars.`
- Subheadline: `BrewLoop gives independent cafes a branded QR menu, lightweight order queue, and loyalty capture without replacing the register.`
- CTA 1: `Open Demo Coffee`
- CTA 2: `View Staff Board`

Sections:

- Hero
- Three value cards:
  - QR menu in minutes
  - Capture customer info
  - Reward repeat visits
- How it works:
  - Scan
  - Order
  - Pay at cafe
  - Join rewards
- Pilot boundary callout:
  - `No payments. No app download. No Telegram.`

### 2. Cafe public page `/cafe/demo-coffee`

Current state:

- Cafe name/tagline
- action card for menu/rewards
- simple feature cards

Prototype goals:

- Make this feel like a real branded cafe microsite.
- Add clearer order mode entry.
- Add visible loyalty hook.
- Add practical cafe details.

Required elements:

- Cafe name
- Tagline
- Status/open hours
- Location line
- CTA: `Order now`
- CTA: `Check rewards`
- Small note: `Pay at the cafe when ready`
- Featured items preview, optional for prototype

Mobile behavior:

- CTA buttons should appear early without scrolling too much.
- Order/rewards actions should be thumb-friendly.

### 3. Customer order page `/cafe/demo-coffee/order`

Current state:

- Categories/items
- plus/minus quantity
- sticky order card
- pickup/table toggle
- table query support
- name/phone/notes
- confirmation state

Prototype goals:

- Make the cart easier on mobile.
- Make ordering mode obvious.
- Improve confirmation state.
- Surface notes as intentional customization, not an afterthought.

Required changes/design targets:

- Mobile cart should be collapsible or bottom-sticky.
- Desktop cart can stay right-side sticky.
- Menu cards should have clear add buttons.
- Quantity controls should be touch-friendly.
- Notes placeholder should show realistic cafe examples:
  - `oat milk, half sweet, no whip`
- Order confirmation should show:
  - order number
  - order type
  - table or pickup
  - total due at cafe
  - CTA to rewards
  - CTA to place another order or return to cafe page

Important copy:

- `No online payment. Pay at the cafe.`
- `Have a substitution? Add it in notes for now.`

Do not build structured modifiers yet.

### 4. Staff order board `/staff/orders`

Current state:

- Four columns: New, Making, Ready, Completed
- Cards show name, order id, type/table, items, notes, time, total
- Button advances status

Prototype goals:

- Make the board tablet-friendly.
- Improve status clarity.
- Add operational affordances without building complex ops.

Required elements:

- Clear column headers with counts
- Strong visual difference between New/Making/Ready/Completed
- Large status action buttons
- Notes highlighted enough for staff to notice
- Table number/pickup badge prominent
- Empty states in each column

Nice-to-have prototype touches:

- `Clear completed` button as disabled/nonfunctional placeholder or documented future action
- `Demo mode` badge so viewers understand local browser behavior
- Order age indicator, for example `4 min ago`

Do not add kitchen routing, printers, inventory, or payment reconciliation.

### 5. Rewards page `/cafe/demo-coffee/rewards`

Current state:

- Form asks name/email/phone
- Progress punch card shows ten visits

Prototype goals:

- Make rewards feel like a customer benefit and an owner capture engine.
- Make signup friction low.

Required elements:

- Clear reward rule:
  - `10 visits = reward`
- Phone/email lookup
- Visual punch card
- Progress state
- Empty/new customer state
- Privacy reassurance:
  - `No app download. No separate account.`

Prototype improvement:

- After placing order, rewards page should feel like the natural next step.
- Copy should explain why joining matters while waiting.

### 6. Owner dashboard `/dashboard`

Current state:

- Metrics cards
- callout about customer capture

Prototype goals:

- Make the owner dashboard explain the business value at a glance.
- Avoid fake revenue analytics since payments are excluded.

Required metrics:

- Orders today
- New customers
- Known customers
- Loyalty members

Add useful demo sections:

- Recent orders
- Recent loyalty signups
- `Pilot checklist` card:
  - menu configured
  - QR codes generated
  - staff board tested
  - rewards active

Design tone:

- This should feel like a simple command center, not an enterprise BI tool.

### 7. Menu management `/dashboard/menu`

Current state:

- Menu manager exists.
- Demo changes persist in browser.

Prototype goals:

- Make menu editing feel like the key owner control surface.
- Keep setup obviously configuration-driven.

Required actions:

- Add category
- Rename category
- Add item
- Edit item
- Hide/show item
- See price in dollars while storing cents internally

Prototype additions:

- Add a `Menu setup` intro card explaining:
  - `Menus live in BrewLoop so QR ordering, order totals, loyalty, and analytics work.`
- Add future import placeholder:
  - `CSV import coming next`
- Add sold-out/hidden language that makes sense to owners.

Do not build POS sync yet.

### 8. Owner customers page `/dashboard/customers`

If not already complete, create a prototype-quality page.

Purpose:

Show the owner what BrewLoop captures.

Required content:

- Customer name
- Phone/email
- visits
- last seen
- loyalty progress

Actions can be placeholders:

- view profile
- adjust visits
- export CSV later

### 9. Owner rewards page `/dashboard/rewards`

If not already complete, create a prototype-quality page.

Purpose:

Show the owner that loyalty rules are configurable later, even if current pilot uses one fixed rule.

Required content:

- Current rule: `10 visits = reward`
- Members count
- Rewards earned/redeemed placeholder
- Explanation that configurable rules are v1.5

Do not build SMS/email campaigns yet.

## Visual system direction

### Brand feel

Warm, local, practical, lightly premium.

Suggested traits:

- warm neutral backgrounds
- soft cards
- rounded corners
- subtle borders
- limited accent color
- clear iconography
- readable contrast

### Color guidance

Use existing design tokens where possible.

Preferred direction:

- background: warm off-white / cream
- cards: white or very light cream
- primary: espresso / coffee brown or muted amber
- secondary accents: sage, oat, or muted green
- destructive: muted red only where needed

Do not over-theme every cafe yet. Per-cafe branding can come later through `primary_color`, logo, and slug settings.

### Typography

Current typography is acceptable.

Keep:

- large, confident headings
- readable body copy
- small mono labels for operational metadata

Avoid:

- dense dashboard text
- tiny mobile controls
- excessive uppercase labels

## Component guidance

Use existing UI primitives when possible:

- Button
- Card
- Badge
- Input
- Label
- Textarea

Add only components needed for prototype clarity:

- StatCard
- EmptyState
- DemoModeBadge
- SectionHeader
- OrderStatusBadge
- MobileCartBar
- PilotChecklistCard

Keep components simple. Do not introduce a design system overhaul.

## Copy rules

Use owner/customer-friendly language.

Prefer:

- `Pay at the cafe`
- `Join rewards`
- `Known customers`
- `Loyalty members`
- `Hide item`
- `Mark ready`

Avoid:

- `tenant`
- `RLS`
- `CRM` on customer-facing screens
- `engagement engine`
- `AI-powered`
- `omnichannel`

## Demo data direction

Demo Coffee should feel believable.

Suggested menu:

Coffee:

- Latte
- Cold Brew
- Cappuccino
- Americano

Tea:

- Matcha Latte
- Chai Latte
- Iced Green Tea

Pastries:

- Butter Croissant
- Blueberry Muffin
- Banana Bread

Use realistic prices:

- drinks: $3.75–$6.25
- pastries: $3.25–$5.25

Include a few active sample orders so the staff board is not empty on first open.

## Prototype acceptance criteria

The design pass is complete when:

- Landing page communicates the product in under 10 seconds.
- Demo cafe page feels like a branded cafe microsite.
- Customer can place a pickup order on mobile without confusion.
- Customer can place a table order using `?t=12`.
- Confirmation clearly sends customer toward rewards.
- Staff board is readable on tablet/desktop and usable by touch.
- Owner dashboard explains customer capture and loyalty value.
- Menu management feels owner-friendly.
- Customers and rewards dashboard pages are prototype-quality.
- Empty/loading/demo states are intentional, not accidental.
- No payments, Telegram, native app, inventory, or POS sync are introduced.

## Out of scope for this prototyping pass

Do not build:

- payment processing
- SMS/email campaigns
- Square integration
- Toast/Clover integration
- native app
- inventory
- staff scheduling
- structured modifier engine
- multi-location dashboard
- advanced analytics

## Codex prompt for the prototyping pass

Use this prompt for Codex:

```text
Read CODEX.md and docs/DECISIONS.md first.

Primary route: Product Experience.
Supporting routes: Menu System and Production Readiness.

Then read:
- design.md
- docs/ROADMAP.md
- docs/MENU_ONBOARDING.md
- docs/KNOWN_GAPS.md

Task:
Upgrade the BrewLoop prototype UI using design.md as the source of truth.

Goals:
- Make the existing demo feel polished enough to show a real local cafe owner.
- Improve landing, cafe, order, rewards, staff board, owner dashboard, menu management, customers, and rewards dashboard screens.
- Preserve the current pilot boundaries: no payments, no Telegram, no native app, no POS integration.
- Keep demo mode working through the current browser-storage adapter.
- Keep cafe-specific behavior configuration-driven.

Implementation constraints:
- Use the existing Next.js/TypeScript/Tailwind/shadcn-style stack.
- Prefer existing UI primitives.
- Do not introduce large dependencies for this pass.
- Keep changes small and reviewable.
- Commit after meaningful milestones.

Acceptance criteria:
- Landing page communicates BrewLoop in under 10 seconds.
- Demo cafe page feels like a branded cafe microsite.
- Mobile customer order flow is clear and touch-friendly.
- Table QR query param still works.
- Order confirmation points customers toward rewards.
- Staff board is readable and tablet-friendly.
- Owner dashboard shows customer capture and loyalty value.
- Menu management is owner-friendly.
- Customers and rewards dashboard pages are prototype-quality.
- npm run lint, npm test, and npm run build pass or documented gaps are added to docs/KNOWN_GAPS.md.

End of session:
- Update CODEX.md, docs/DECISIONS.md, design.md, and/or docs/KNOWN_GAPS.md if durable context changed.
- Summarize changed files, checks run, and remaining gaps.
```
