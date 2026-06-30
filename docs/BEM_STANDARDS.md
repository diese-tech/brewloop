# BrewLoop BEM Standards

This document defines BrewLoop's convention for app-specific, semantic CSS
classes. It exists because the app is mostly Tailwind utility classes, but a
handful of Black Rabbit visual motifs (loyalty stamps, parchment cards,
catalog labels, status dots) need a reusable, named vocabulary instead of
one-off class names. It does not replace Tailwind. It governs the smaller
surface area where a named, reusable visual pattern is worth a class.

Tracking: Issue #8, part of epic #7 (Black Rabbit pilot UI/admin production
readiness).

## Why BEM, and why not "just Tailwind"

Tailwind utilities are great for one-off layout and spacing. They are a poor
fit for:

- A visual motif reused across unrelated components (a loyalty stamp, a
  parchment-styled card, a status dot) where the *meaning* of the pattern
  matters more than the specific utilities behind it.
- Pseudo-elements, gradients, and `color-mix()` tricks that Tailwind can't
  express as plain utility classes (e.g. the parchment card's inset shadow
  stack, the book-spine rule pseudo-elements).
- States that should be named once and reused (`--filled` / `--empty`,
  `--new` / `--making` / `--ready`) instead of re-derived with ternaries at
  every call site.

BEM (Block, Element, Modifier) gives these patterns one name, one definition
in `globals.css`, and a predictable place to look when something needs to
change.

## Naming convention

```
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

- **Block** — a standalone, reusable visual/content concept. Lowercase,
  hyphen-separated words, named for what it *is*, not how it looks or where
  it lives: `moon-stamp`, `brand-mark`, `status-dot`, `eyebrow`,
  `site-credit`. Avoid presentation-only or layout-only names.
- **Element** — `block__element`. A part of a block that only makes sense
  inside that block. One underscore pair, never nested
  (`brand-mark__moon`, not `brand-mark__logo__moon`). If an element needs to
  stand alone outside its block, it isn't really an element — promote it to
  its own block.
- **Modifier** — `block--modifier` or `block__element--modifier`. A variant
  or state of a block/element. Always applied *alongside* the base class,
  never instead of it (`class="moon-stamp moon-stamp--empty"`, not
  `class="moon-stamp-empty"`). This is the rule the old custom classes
  broke: `moon-stamp-empty` looked like a sibling block instead of a state
  of `moon-stamp`.
- One exception to "modifier needs a base class": a modifier may be applied
  directly to a primitive component that already carries its own block
  identity via `data-slot` (e.g. shadcn's `<Card data-slot="card">`).
  `card--parchment` and `card--spine` are applied straight to `<Card>`
  without a redundant `card` marker class, because `data-slot="card"`
  already documents the block.

## When Tailwind utilities are acceptable (the default)

Use plain Tailwind utility classes for:

- Layout: flex/grid, gap, padding, margin, sizing.
- One-off typography sizing (`text-2xl`, `tracking-tight`) that isn't a
  reusable named role.
- Color/state classes already backed by the shadcn token system
  (`bg-primary`, `text-muted-foreground`, `border-border`).
- Anything used once, in one place, with no semantic name worth giving it.

Most of a page should still look like Tailwind. BEM classes are the
exception, not the default.

## When an app-specific BEM class is required

Reach for a BEM class (new or existing) when:

- The same visual pattern repeats across more than one component/page
  (e.g. the eyebrow label appears on the cafe page, dashboard, staff board,
  and order receipt).
- The styling can't be expressed as Tailwind utilities alone (gradients,
  `::before`/`::after`, `color-mix()`, multi-layer `box-shadow`).
- The pattern represents a named state machine (order status, loyalty
  stamp filled/empty) that should have one source of truth instead of an
  inline ternary chain.
- It is one of the Black Rabbit "motifs" called out in [`design.md`](../design.md)
  (crescent marks, moon loyalty stamps, parchment potion labels, book-spine
  rules).

Don't create a new BEM class for something used once that Tailwind already
handles cleanly.

## Current BrewLoop blocks

Defined in [`src/app/globals.css`](../src/app/globals.css) under
`@layer components`.

| Block | Elements | Modifiers | Purpose |
|---|---|---|---|
| `eyebrow` | — | — | Small uppercase mono kicker/label text (was `catalog-label`). |
| `site-credit` | — | — | Small footer attribution text (was `powered-by`). |
| `moon-stamp` | — | `--filled`, `--empty` | One dot in a 10-stamp loyalty row. |
| `brand-mark` | `__moon` | — | The Black Rabbit logo lockup (crescent + wordmark). |
| `card` (modifier-only, applied to shadcn `Card`) | — | `--parchment`, `--spine` | Card skins: parchment potion-label card, book-spine rule card. |
| `status-dot` | — | `--new`, `--making`, `--ready`, `--completed` | Staff order board column status indicator. |

## Examples

**Customer page eyebrow label**

```tsx
<p className="eyebrow mb-4">The Black Rabbit Bookbar</p>
```

**Order card (menu item, book-spine skin)**

```tsx
<Card className="card card--spine bg-card/90">
  <CardHeader>...</CardHeader>
</Card>
```

**Order confirmation receipt (parchment skin)**

```tsx
<Card className="card card--parchment mt-8 text-left">
  ...
</Card>
```

**Dashboard panel label**

```tsx
<CardTitle className="eyebrow">{label}</CardTitle>
```

**Form field — plain Tailwind, no BEM needed**

```tsx
<div className="space-y-2">
  <Label htmlFor="table">Table number</Label>
  <Input id="table" value={tableNumber} onChange={...} />
</div>
```

**Status states (loyalty stamp)**

```tsx
<span className="moon-stamp moon-stamp--filled" />
<span className="moon-stamp moon-stamp--empty" />
```

**Status states (staff order board)**

```tsx
<span className={`status-dot status-dot--${column.status}`} />
```

## Review checklist

Use this before merging UI changes:

- [ ] Semantic HTML used where it exists (`<button>`, `<nav>`, `<section>`,
      `<h1>`–`<h3>`, form labels) instead of generic `<div>`/`<span>` with
      click handlers.
- [ ] Any app-specific, reused, or non-Tailwind-expressible style uses a
      `block`, `block__element`, or `block--modifier` class — not a new
      one-off custom class name.
- [ ] No new one-off custom class names (e.g. `moon-stamp-empty`-style
      hyphenated pseudo-modifiers). If it needs a state, it's a `--modifier`.
- [ ] Demo mode still works end to end (`npm run dev`, browser-storage flows
      in `src/lib/demo-store.ts` — no Supabase wiring required to click
      through).
- [ ] Customer-facing screens are checked mobile-first (narrow viewport
      first, then confirm desktop).
- [ ] Staff-facing screens are checked for usability states: empty column,
      loading, and the active/next-action state (e.g. "Mark ready" button).

## Non-goals for this pass (issue #8)

- No full rewrite of the UI to BEM/CSS — Tailwind utilities remain the
  default for layout and one-off styling.
- No customer/staff/admin screen redesigns.
- No new styling framework or large dependency.

## Known BEM gaps for later, screen-specific issues

- The owner dashboard, customer list, and menu management screens
  (`src/app/dashboard/**`) still mix inline conditional Tailwind for
  emphasis/empty states; they weren't redesigned here and should adopt
  `eyebrow`/`status-dot`-style patterns as those screens get their own
  passes.
- The checkout/payment form (`OrderBuilder`'s `checkout` stage) has no
  BEM patterns yet beyond `eyebrow`/`site-credit`/`card--parchment` reuse —
  a dedicated payment-form pass should define `card-form` field/error
  states if validation UI is added.
- No BEM badge/status vocabulary exists yet for payment status
  (`paid`/`due`) shown in `staff-board.tsx`; only the order-status dot was
  centralized in this pass.
