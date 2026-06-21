# BrewLoop Visual Design Template

This file defines BrewLoop's reusable visual design system for cafe microsites, QR ordering, loyalty, staff tools, and owner dashboards.

The goal is not to create one fixed BrewLoop look. The goal is to create a template where each cafe can swap in its own:

- name
- logo
- colors
- brand art
- short copy
- menu content
- loyalty language
- external website/social CTA

BrewLoop should appear only as a quiet trust/footer mark:

> Powered by BrewLoop by ThreeTails

## Design intent

BrewLoop should feel like a cozy local cafe experience first and software second.

Default personality:

- cozy
- local
- warm
- practical
- lightly magical
- simple enough for staff
- polished enough for business owners

Avoid:

- sterile white SaaS dashboards
- generic restaurant-app UI
- loud marketplace branding
- fake AI styling
- corporate CRM language
- heavy POS aesthetics

## Template model

Every cafe uses the same layout system and component behavior, but receives a personalized theme.

### Template stays the same

- page structure
- customer QR flow
- loyalty signup flow
- menu layout
- order cart behavior
- staff board layout
- owner dashboard layout
- component states
- accessibility rules
- spacing system

### Cafe theme changes

- logo
- primary color
- secondary color
- background tone
- accent color
- brand imagery
- typography accent if needed
- hero copy
- loyalty reward wording
- external website/social CTA

This keeps onboarding configuration-driven instead of engineering-driven.

## Brand hierarchy

### Customer-facing pages

Cafe brand dominates.

BrewLoop appears only as a subtle footer note:

```text
Powered by BrewLoop by ThreeTails
```

Do not make BrewLoop visually compete with the cafe.

### Staff and owner pages

BrewLoop may be slightly more visible because these are operational tools, but the selected cafe name/theme should still be present.

Recommended staff/owner header:

```text
[ Cafe logo ] [ Cafe name ]
Powered by BrewLoop
```

## Default design lane

Primary lane:

> Cozy local cafe

Supporting lane:

> Boutique hospitality software

The interface should feel warm and specific to the shop, but still structured enough for ordering, staff operations, and owner management.

## Visual warmth

Target warmth level: 4 / 5.

This means:

- warm backgrounds are preferred over pure white
- surfaces can feel tactile/card-like
- accent colors can be rich and shop-specific
- typography can have personality in headings
- icons should support the brand mood

But:

- forms must remain clear
- order actions must remain obvious
- staff board must remain operational
- contrast must stay accessible

## Core layout pattern

Use a mobile-first structure.

QR customers are usually scanning from a phone, not a laptop.

Desktop should still look good, but mobile is the primary customer experience.

### Customer page hierarchy

1. Cafe identity
2. Loyalty entry
3. Menu/order entry
4. Current order/cart
5. Post-order CTA
6. External site/social CTA
7. Subtle BrewLoop footer

### Owner/staff hierarchy

1. Current cafe identity
2. Today/status context
3. Primary action area
4. Supporting metrics/details
5. Operational notes/gaps

## Important product flow decision

The preferred customer journey is:

1. Customer scans QR code.
2. Customer lands in a loyalty-first cafe portal.
3. Customer links phone/email or checks existing rewards.
4. Customer continues into the menu/order flow.
5. Customer places order.
6. Post-order confirmation prompts customer to visit the cafe's main website, social page, events page, or other shop-owned destination.

### Challenge to this approach

Loyalty-first is strong for customer capture, but it can create friction if the customer only wants to order quickly.

Design solution:

The loyalty area should be prominent but skippable.

Recommended hero actions:

- Primary: `Join / check rewards`
- Secondary: `Order now`

Never block ordering behind loyalty signup.

This preserves the business goal without making the QR flow annoying.

## Theme token structure

Each cafe should be configured with a theme object like this:

```ts
const cafeTheme = {
  name: "The Black Rabbit Bookbar",
  shortName: "Black Rabbit",
  logoUrl: "/themes/black-rabbit/logo.png",
  brandArtUrl: "/themes/black-rabbit/brand-art.png",
  primary: "#4B0F1E",
  primaryForeground: "#FFF7F2",
  background: "#120C10",
  surface: "#1D1419",
  surfaceAlt: "#2A1A22",
  border: "#5E2A38",
  accent: "#F4E8D8",
  accentMuted: "#B8916D",
  text: "#FFF7F2",
  textMuted: "#D8C6BB",
  success: "#8FAF7A",
  warning: "#D7A85B",
  danger: "#B85C5C",
  radius: "1.25rem",
  mood: "dark witchy bookbar",
};
```

Do not hardcode The Black Rabbit colors into shared components. Use theme tokens.

## Default neutral theme

Use this when a cafe has not provided branding yet.

```ts
const defaultCafeTheme = {
  primary: "#5B3826",
  primaryForeground: "#FFF8F0",
  background: "#F7EFE4",
  surface: "#FFF9F1",
  surfaceAlt: "#EFE1D1",
  border: "#D9C6B4",
  accent: "#A66A43",
  accentMuted: "#7C8A61",
  text: "#241711",
  textMuted: "#6F5A4B",
  success: "#6F8A53",
  warning: "#B9803A",
  danger: "#A84A3D",
  radius: "1rem",
  mood: "warm neighborhood cafe",
};
```

## First pilot theme: The Black Rabbit Bookbar

The first concrete design target is The Black Rabbit Bookbar in Clermont, Florida.

Their theme should feel:

- dark
- witchy
- literary
- cozy
- a little mysterious
- local and intimate
- not Halloween-cheap

Palette direction:

- black / near-black base
- maroon primary
- warm white text accents
- muted parchment/cream surfaces
- optional brass/gold accent
- subtle deep plum shadows

Suggested tokens:

```ts
const blackRabbitTheme = {
  primary: "#5A1024",
  primaryForeground: "#FFF5EC",
  background: "#100B0F",
  surface: "#1A1118",
  surfaceAlt: "#251620",
  border: "#4B2634",
  accent: "#E8D6BF",
  accentMuted: "#A98262",
  text: "#FFF7F0",
  textMuted: "#CDB8AA",
  success: "#8DA36B",
  warning: "#D3A04F",
  danger: "#B65B5B",
};
```

Visual motifs:

- moon phases
- book spines
- rabbit silhouette
- subtle stars
- potion-label style badges
- parchment cards on dark background
- thin ornate dividers, used sparingly

Avoid:

- cartoon witches
- neon purple overload
- Halloween clipart
- heavy gothic fonts for body text
- illegible contrast

## Typography

Use a clean, readable base typeface for all functional UI.

Recommended split:

### Body/UI font

Use a clean sans-serif.

Examples:

- Inter
- Geist Sans
- system sans-serif

### Display/accent font

Optional per cafe.

Use only for:

- hero headline
- cafe name
- small decorative section labels

For The Black Rabbit, the accent type can feel literary or mystical, but it must remain readable.

Avoid using decorative fonts for:

- menus
- order cards
- buttons
- staff board
- forms

## Spacing and shape

Overall feel:

- generous mobile padding
- rounded cards
- calm vertical rhythm
- strong CTA spacing
- no cramped forms

Suggested scale:

- page horizontal mobile padding: `1rem` to `1.25rem`
- desktop max width: `72rem` for marketing/cafe pages
- staff board max width: `90rem` or full width
- card radius: `1rem` to `1.5rem`
- button radius: match card radius, slightly tighter
- section spacing: `3rem` to `5rem` desktop, `2rem` mobile

## Icon direction

Use icons when possible, but keep them supportive.

Recommended icon usage:

- QR/order: simple scan or bag icon
- loyalty: gift, stamp, star, loop, rabbit/moon if themed
- staff board: clock, cup, check, bell
- owner dashboard: users, repeat, menu, chart-lite

Avoid:

- overusing coffee cup icons
- mixing too many icon styles
- icons that look like crypto/web3 badges

## Page templates

## 1. Cafe portal page

This is the main QR landing experience.

Purpose:

- identify the cafe
- invite loyalty signup/check-in
- allow quick ordering without forcing signup
- point to cafe-owned destinations

Layout:

1. Full-screen-ish branded hero
2. Logo/cafe name
3. Short cafe tagline
4. Open/status badge
5. Loyalty card
6. Order CTA
7. External site/social/event CTA
8. Powered by BrewLoop footer

Recommended hero copy pattern:

```text
Welcome to [Cafe Name]
[Short mood/tagline]

Earn rewards every time you visit.
```

Primary CTA:

```text
Join / check rewards
```

Secondary CTA:

```text
Order now
```

External CTA examples:

```text
Visit our website
See upcoming events
Follow us on Instagram
Browse book club nights
```

For The Black Rabbit:

```text
Enter the rabbit hole.
Books, brews, and a little bit of magic.
```

## 2. Loyalty panel

Purpose:

Capture customer identity without forcing a full account.

Fields:

- phone or email
- name optional or second step

Design:

- make the reward visually satisfying
- use punch/stamp metaphor
- show current progress
- keep the form short

Rules:

- Do not require app download.
- Do not require password.
- Do not block ordering.

The loyalty panel should feel like a benefit, not a data grab.

## 3. Menu/order page

Purpose:

Let the customer order quickly from a phone.

Mobile layout:

1. Compact cafe header
2. Order mode indicator: pickup or table
3. Category tabs or stacked category sections
4. Menu item cards
5. Bottom sticky cart bar
6. Cart drawer/sheet for checkout details

Desktop layout:

1. Category/item grid
2. Right sticky cart

Item card style:

- item name
- short description
- price
- plus/add button
- optional brand/image area later

Cart style:

- bottom sticky on mobile
- side sticky on desktop
- clear total due at cafe
- notes field for custom requests
- name required
- phone optional but encouraged

Important message:

```text
No online payment. Pay at the cafe.
```

Notes placeholder:

```text
Oat milk, half sweet, no whip…
```

## 4. Order confirmation

Purpose:

Reinforce success and route the customer to the next best action.

Show:

- order number
- customer name
- pickup/table
- total due at cafe
- status: received
- estimated wait placeholder if available later

Primary post-order CTA:

```text
Check rewards
```

Secondary CTA:

```text
Visit [Cafe Name]'s site
```

For The Black Rabbit, examples:

```text
Browse events
See book club nights
Follow The Black Rabbit
```

## 5. Staff board

Purpose:

Let staff move orders through a simple queue.

Style:

- Kanban-style status columns
- large cards
- clear badges
- touch-friendly buttons
- strong notes visibility

Columns:

- New
- Making
- Ready
- Completed

Order card content:

- customer name
- order id
- pickup/table badge
- table number if present
- items
- notes
- time received
- total due
- next status button

Visual density:

- more compact than customer pages
- still spacious enough for touch

Do not add printer/KDS behavior in this design pass.

## 6. Owner dashboard

Purpose:

Small command center for the shop owner.

Style:

- calm dashboard
- not enterprise BI
- brand-aware but less decorative than customer pages

Top metrics:

- orders today
- new customers
- known customers
- loyalty members

Recommended sections:

- Today at a glance
- Recent orders
- Recent loyalty signups
- Pilot checklist
- Menu quick actions

Pilot checklist:

- menu configured
- QR codes generated
- staff board tested
- rewards active

The owner should immediately understand that BrewLoop is about customer capture and repeat visits.

## 7. Menu management

Purpose:

Let owner/operator configure the menu without code.

Style:

- practical
- table/card hybrid
- clear edit actions

Required controls:

- add category
- rename category
- add item
- edit item
- hide/show item
- price in dollars UI, cents internally

Future placeholder:

```text
CSV import coming next
```

## 8. Customers page

Purpose:

Show that BrewLoop creates a customer list.

Style:

- simple relationship view
- not full CRM

Fields:

- name
- phone/email
- visits
- last seen
- reward progress

Placeholder actions:

- view profile
- adjust visits
- export later

## 9. Rewards admin page

Purpose:

Show loyalty setup/value.

Current pilot:

- fixed 10-visit reward

Future v1.5:

- configurable visits-based rule
- points-per-order option later
- manual adjustment

Style:

- simple rule card
- member stats
- redemption placeholder

## Component styling

### Buttons

Primary buttons:

- high contrast
- filled with cafe primary color
- rounded
- large touch target

Secondary buttons:

- outlined or soft-filled
- visible on dark and light themes

Danger actions:

- muted red
- avoid loud destructive styling unless truly destructive

### Cards

Customer cards:

- warm/tactile
- larger radius
- soft shadow or subtle border

Staff cards:

- clearer borders
- less decorative
- status-first

Owner cards:

- balanced between warmth and utility

### Badges

Use badges for:

- pickup/table
- open/closed
- order status
- reward status
- demo mode

For themed cafes, badges can carry mood through color and shape.

### Forms

Forms should be short.

Rules:

- label every field
- use helpful placeholders
- keep mobile keyboards in mind
- avoid multi-step complexity unless it reduces friction

## Theme examples

## The Black Rabbit Bookbar theme

Mood:

```text
dark witchy book cafe
```

Suggested styling:

- dark maroon gradient background
- parchment-colored cards
- cream text
- brass accent lines
- rabbit/moon/book iconography
- subtle star texture or divider

Hero example:

```text
Enter the rabbit hole.
Books, brews, and a little bit of magic.
```

CTA examples:

```text
Check your rewards
Order from the bar
Browse events
```

Powered-by footer:

```text
Powered by BrewLoop by ThreeTails
```

## Simple bright cafe theme

Inspired by simple coffee storefronts.

Mood:

```text
clean neighborhood roaster
```

Suggested styling:

- cream background
- white cards
- espresso text
- muted green accent
- simple product cards
- minimal decoration

Hero example:

```text
Good coffee, easy mornings.
```

CTA examples:

```text
Join rewards
Order now
Visit our shop
```

## Accessibility requirements

- Maintain readable contrast for all themed palettes.
- Do not use decorative fonts for body text or form inputs.
- Buttons must be large enough for mobile touch.
- Color cannot be the only status indicator.
- Staff board status must include text labels.
- Forms must have labels.

## Prototyping rules

For the next design pass:

- Make the theme system obvious in code.
- Use The Black Rabbit Bookbar as the first branded example.
- Keep the default cafe theme available.
- Do not add payments.
- Do not add POS integration.
- Do not add structured modifiers yet.
- Keep the loyalty-first portal skippable.
- Make mobile customer flow the priority.
- Keep staff/owner tools functional and less decorative.

## Codex prompt

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
Apply the BrewLoop visual design template from design.md.

Goals:
- Treat BrewLoop as a brand-swappable cafe microsite and ordering template.
- Make the customer-facing pages cafe-branded first, with BrewLoop only as a subtle powered-by footer.
- Use The Black Rabbit Bookbar as the first concrete theme example: dark, witchy, literary, maroon/black/cream accents.
- Keep a neutral default cafe theme available for other shops.
- Prioritize mobile QR customer flow.
- Make the loyalty-first portal prominent but skippable.
- Preserve the current order, rewards, staff, and owner demo flows.

Constraints:
- No payments.
- No Telegram.
- No native app.
- No POS integration.
- No structured modifier engine.
- Use existing Next.js, TypeScript, Tailwind, and UI primitives.
- Keep cafe-specific styling configuration-driven, not hardcoded per page.

Acceptance criteria:
- The Black Rabbit Bookbar theme feels dark, witchy, cozy, and local without becoming Halloween clipart.
- Customer pages feel like the cafe, not BrewLoop.
- `Powered by BrewLoop by ThreeTails` appears subtly.
- The portal leads with loyalty but still allows immediate ordering.
- Mobile ordering is clear and touch-friendly.
- Staff board remains practical and readable.
- Owner dashboard feels like a small command center.
- Theme tokens make it obvious how another cafe could swap in colors/logo/copy.
- Run lint, tests, and build; document any gaps in docs/KNOWN_GAPS.md.
```
