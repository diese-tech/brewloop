# CODEX.md

Codex should read this file before working on BrewLoop.

BrewLoop is a QR-to-web ordering and loyalty capture app for independent cafes. It is not a full POS replacement in v1.

## Required session lifecycle

Every Codex session should begin by reading:

1. `CODEX.md`
2. `docs/DECISIONS.md`

Then use the routing table below to load any additional docs needed for the task.

Every Codex session should end by updating context when needed:

- Update `CODEX.md` if the operating rules, workflow, or required context changes.
- Update `docs/DECISIONS.md` if any durable product, architecture, infrastructure, or business-model decision was made or changed.
- Update relevant ADRs/topical docs when the decision belongs in a more specific document.
- Add unresolved risks or intentional deferrals to `docs/KNOWN_GAPS.md`.

Do not end a session with important context trapped only in a chat summary or commit message.

## North Star

A new cafe can launch a branded QR menu, loyalty program, staff order queue, and customer list in under 30 minutes with no developer involvement.

## Product wedge

Build around this wedge first:

> QR ordering plus loyalty capture for local cafes.

Keep the current pilot scope focused on:

- public cafe page
- QR menu
- pickup/table orders
- staff order board
- owner menu management
- customer capture
- basic loyalty progress

Do not expand the current pilot into payments, native apps, inventory, payroll, deep POS integrations, or complex campaigns unless Dustin explicitly changes scope.

## Stack

Preferred stack:

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel-ready deployment

## Routing table

Before editing, choose the route that matches the task.

| Task | Read |
|---|---|
| Product direction, roadmap, scope | `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/ADR/0001-product-scope.md` |
| Schema, tenant model, Supabase, RLS, auth | `docs/DECISIONS.md`, `docs/ADR/0002-multi-tenant-architecture.md`, `docs/PRODUCTION_READINESS.md` |
| Menu setup, imports, item options | `docs/MENU_ONBOARDING.md`, `docs/ADR/0004-menu-and-modifiers.md`, `docs/DECISIONS.md` |
| Customer/staff/owner UX | `docs/ROADMAP.md`, `docs/ADR/0001-product-scope.md`, `docs/MENU_ONBOARDING.md` |
| Testing, deployment, launch readiness | `docs/PRODUCTION_READINESS.md`, `docs/ADR/0002-multi-tenant-architecture.md` |
| SaaS vs client-owned hosting | `docs/CLIENT_OWNED_INFRASTRUCTURE.md`, `docs/ADR/0003-hosting-and-business-model.md` |
| Documentation updates | `docs/DECISIONS.md` and the relevant ADR/topical doc |

## Accepted decisions

- No Telegram dependency.
- No payments in v1.
- Menus live inside BrewLoop.
- New cafes should be configuration, not custom code.
- The current pilot uses notes for drink customization.
- Structured modifiers/options come later.
- Shared SaaS hosting is the default.
- Client-owned deployment is optional and premium.
- Tenant-owned data is separated by `cafe_id`.

## Implementation rules

- Keep changes small and coherent.
- Inspect existing files before editing.
- Preserve `/cafe/[slug]`, `/cafe/[slug]/order`, and `/cafe/[slug]/rewards` as the public route direction.
- Store prices in cents.
- Snapshot order item names and prices when orders are created.
- Keep cafe-specific behavior database-driven.
- Update docs when a durable decision changes.
- Add known gaps to `docs/KNOWN_GAPS.md`.
- Link pull requests to completed issues with `Closes #123` or
  `Auto-close: #123`; see `.github/AUTOMATION.md`.
- Commit after each meaningful milestone.

## Testing priority

Prioritize tests for:

- order total calculation
- price cents conversion
- loyalty rules
- order creation
- staff status updates
- menu CRUD
- public menu smoke test
- customer order smoke test
- tenant isolation where feasible

## Working loop

1. Read `CODEX.md`.
2. Read `docs/DECISIONS.md`.
3. Route the task using the table.
4. Read the relevant supporting docs.
5. Make a short plan.
6. Implement the smallest useful change.
7. Run relevant checks.
8. Commit meaningful work.
9. Update `CODEX.md`, `docs/DECISIONS.md`, ADRs, topical docs, or `docs/KNOWN_GAPS.md` if the session changed durable context.
10. Summarize changed files, checks run, and remaining gaps.
