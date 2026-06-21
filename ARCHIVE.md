# BrewLoop Archive

Historical project state that is complete or superseded. This file is a filing
cabinet, not active operating context. Consult the referenced source files for
current decisions, plans, and gaps.

## 2026-06-18 - MVP scaffold completed

**Status:** Completed

The initial demo-ready BrewLoop scaffold was delivered with:

- Public Demo Coffee routes:
  - `/cafe/demo-coffee`
  - `/cafe/demo-coffee/order`
  - `/cafe/demo-coffee/rewards`
- Pickup and table-order flows, including the `?t=` table-number parameter.
- Staff order status board.
- Owner dashboard, menu management, customer view, and rewards view.
- Browser-storage demo persistence and cross-tab synchronization.
- Unit coverage for price conversion, order totals, and loyalty progress.
- Passing lint, test, and production build checks.
- Completed V1 production-hygiene work:
  - Tenant-aware RLS hardening.
  - Demo seed data separated from the migration.
  - Initial automated unit tests.

Historical source:

- `README.md`
- `docs/ROADMAP.md` - V1: Proof of workflow
- Git commit `72902d8` (`feat: scaffold BrewLoop MVP flows`)
- Git commit `58ae2d8` (`docs: finalize MVP handoff and hardening`)

## 2026-06-18 - Initial Supabase deployment completed

**Status:** Completed

The initial multi-tenant schema was hardened and deployed to Supabase project
`jbjmkxydehsfwlhqdzkh`.

Completed database work:

- Applied migration `20260619011020_initial_schema`.
- Created 11 BrewLoop tables with primary keys, foreign keys, checks, and
  tenant-oriented indexes.
- Enabled RLS on all BrewLoop tables.
- Installed 24 role-targeted RLS policies.
- Moved BrewLoop security-definer policy helpers into the non-exposed
  `private` schema.
- Added explicit Data API grants for `anon`, `authenticated`, and
  `service_role`.
- Added `public.orders` to the Supabase Realtime publication.
- Seeded Demo Coffee with three categories and five menu items.
- Generated TypeScript database types and connected them to the browser and
  server Supabase clients.
- Verified the migration, schema, constraints, policies, indexes, seed records,
  lint, tests, and production build.

Historical source:

- `supabase/migrations/20260619011020_initial_schema.sql`
- `supabase/seed.sql`
- `src/types/database.ts`
- Git commit `ce802e5` (`deploy and harden Supabase schema`)

## Superseded project statements

The following earlier planning states are retained here for historical context
and should not be treated as current gaps:

- "Add RLS policies during scaffold." RLS policies are now deployed.
- "If RLS is incomplete during scaffolding, document the gap." Initial RLS is
  deployed; adversarial review and automated tenant-isolation testing remain
  active gaps.
- "Supabase schema and seed data exist locally." The schema and Demo Coffee
  seed data are now also deployed remotely.
- "Generate database types." Generated types now exist at
  `src/types/database.ts`.
- "Enable orders for Realtime." The deployed `orders` table is in the
  Supabase Realtime publication; the staff UI still uses browser storage.
- "Document the client-owned infrastructure model." The durable hosting model
  is recorded in `docs/ADR/0003-hosting-and-business-model.md` and
  `docs/CLIENT_OWNED_INFRASTRUCTURE.md`.
- "Document known gaps." Current unresolved work is maintained in
  `docs/KNOWN_GAPS.md`.

## Still active - do not archive

These items remain current and belong in active project documentation:

- Replace the browser-storage demo adapter with production Supabase reads and
  writes.
- Implement transaction-safe server-side order creation and price validation.
- Add Supabase Auth guards and server-side role enforcement.
- Perform adversarial RLS review and automated tenant-isolation testing.
- Add rate limiting and abuse protection for public writes.
- Resolve ownership and permissions for the pre-existing
  `public.rls_auto_enable()` function.
- Add database integration tests and Playwright smoke tests.
- Add observability, audit events, cleanup tools, and backup/restore procedures.
- Complete onboarding, configurable loyalty, menu imports, and other V1.5 work.
