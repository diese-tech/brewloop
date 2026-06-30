# BrewLoop Decision Log

This document captures product, architecture, and business-model decisions made during early BrewLoop planning.

## Required Codex Session Lifecycle

Every Codex session starts with context tracking:

1. Read `CODEX.md`.
2. Read `docs/DECISIONS.md`.
3. Use the routing table below to choose any additional docs needed for the task.

Every Codex session ends with context preservation:

- Update `CODEX.md` when operating rules, workflow, or required context changes.
- Update `docs/DECISIONS.md` when durable product, architecture, infrastructure, or business-model decisions are made or changed.
- Update the relevant ADR/topical doc when the decision belongs in a more specific place.
- Update `docs/KNOWN_GAPS.md` when risks, deferrals, or incomplete hardening remain.

Important context should not live only in chat logs, commit messages, or issue comments.

## Codex Routing Table

Use this table as BrewLoop's Codex context-routing workflow before planning,
coding, or editing. Route the request to the relevant project documentation,
then produce the smallest useful output.

| Task type | Route | Read first | Behavior | Output |
|---|---|---|---|---|
| Product direction, roadmap, North Star, feature timing | Product Strategy | `docs/ROADMAP.md`, `docs/ADR/0001-product-scope.md`, `docs/DECISIONS.md` | Protect the QR ordering + loyalty wedge. Place features in v1, v1.5, v2, or later. | Recommendation, tradeoffs, next action |
| Schema, tenant separation, Supabase, auth, RLS, routes | Architecture | `docs/ADR/0002-multi-tenant-architecture.md`, `docs/PRODUCTION_READINESS.md`, `docs/DECISIONS.md` | Keep new businesses configuration-driven. Preserve `cafe_id` tenant boundaries. | Architecture plan or implementation constraints |
| Menus, imports, item CRUD, drink options, add-ons, item snapshots | Menu System | `docs/MENU_ONBOARDING.md`, `docs/ADR/0004-menu-and-modifiers.md`, `docs/DECISIONS.md` | Keep menus internal to BrewLoop. Use notes in v1. Save structured option groups for later validation. | Menu model decision or import plan |
| Prototype UI, QR customer flow, staff order board, owner dashboard, loyalty UX | Product Experience | `design.md`, `docs/ROADMAP.md`, `docs/ADR/0001-product-scope.md`, `docs/MENU_ONBOARDING.md` | Keep flows mobile-first, low-friction, and demoable for a local cafe owner. Use `design.md` as the prototype source of truth. | Flow, acceptance criteria, screen plan, or UI implementation constraints |
| CSS/markup conventions, BEM classes, design primitives, custom component styling | UI/Design System | `docs/BEM_STANDARDS.md`, `design.md` | Keep Tailwind as the default; use BEM only for reused/non-utility semantic patterns. Avoid one-off custom class names. | Class naming decision, primitive addition, or BEM gap to flag |
| Tests, deployment, hardening, logging, launch readiness | Production Readiness | `docs/PRODUCTION_READINESS.md`, `docs/ADR/0002-multi-tenant-architecture.md`, `docs/DECISIONS.md` | Make pilots safe and testable without enterprise overhead. | Checklist, test plan, or readiness review |
| SaaS-hosted vs client-owned deployment, pricing, warranty, provider accounts | Business Model / Infrastructure | `docs/CLIENT_OWNED_INFRASTRUCTURE.md`, `docs/ADR/0003-hosting-and-business-model.md`, `docs/DECISIONS.md` | Default to SaaS-hosted. Treat client-owned deployment as premium/custom. | Package recommendation or handoff flow |
| Decision logging, ADR updates, doc cleanup, handoff material | Documentation Ops | `docs/DECISIONS.md`, relevant ADRs, touched topical docs | Put durable decisions here. Use ADRs for scope, architecture, infra, or business-model choices. | Updated decision, rationale, consequences |

Routing rules:

- Pick one primary route before acting.
- Load only the docs listed for that route unless the request crosses domains.
- If the request crosses domains, name the primary route and supporting route.
- Revisit settled decisions only when pilot feedback or new evidence changes the tradeoff.
- When implementation is requested, produce constraints and acceptance criteria Codex can execute.

## Accepted Decisions

### 1. Product wedge

BrewLoop starts as QR-to-web ordering plus loyalty capture for independent cafes.

Why:

- Helps local shops capture repeat customers without replacing their existing POS.
- Easy to demo.
- Loyalty capture creates business value beyond a single order.

Deferred:

- Full POS replacement
- Inventory management
- Staff scheduling/payroll
- Native mobile app
- Deep POS integrations

### 2. North Star

A new cafe can launch a branded QR menu, loyalty program, staff order queue, and customer list in under 30 minutes with no developer involvement.

### 3. Telegram avoidance

BrewLoop does not depend on Telegram for customer ordering, loyalty, owner setup, or staff operations.

Replacement model:

- QR-to-web for customer entry
- Phone/email for loyalty signup
- Email/SMS as future optional campaign channels

### 4. Online payment in the Black Rabbit pilot

BrewLoop's Black Rabbit v1 pilot includes card payment and tipping in the
customer checkout flow.

Reason:

- The approved pilot preview treats payment as part of the complete branded
  ordering experience.
- The pilot should validate the full scan-to-paid-order journey rather than
  stopping at an unpaid queue entry.

Constraint:

- The current implementation is a UI simulation. A production processor,
  refunds, taxes, payouts, reconciliation, and webhook handling remain required
  before real transactions can be accepted.

### 5. Menu data belongs in BrewLoop

Each business menu lives in BrewLoop's database.

Implementation path:

- V1: manual owner CRUD
- V1.5: CSV upload, bulk paste, table editor, duplicate-from-template
- V2+: POS/menu imports as optional accelerators

### 6. Menu setup is configuration, not engineering

Adding a new cafe should not require code changes.

Per-cafe differences should come from database configuration:

- name
- slug
- logo
- colors
- categories
- items
- prices
- availability
- loyalty rules

### 7. Drink modifiers are deferred but planned

The current pilot uses an order notes field for custom requests.

Future model:

- `modifier_groups`
- `modifiers`
- `menu_item_modifier_groups`
- `order_item_modifiers`

### 8. Shared SaaS hosting is the default

BrewLoop's default product model is one shared SaaS-hosted app.

Default stack:

- Vercel
- Supabase
- Cloudflare/DNS
- Resend later
- Twilio later

### 9. Client-owned infrastructure is optional/premium

Client-owned deployment is valid as a custom package, not the default BrewLoop path.

Possible client-owned stack:

- Client-owned Vercel account
- Client-owned Supabase account
- Client-owned domain/DNS account
- Client payment method on provider accounts

### 10. One shared app before per-client deployments

Start with one shared app and one shared database project.

Exception:

- Offer client-owned deployment only as part of a premium/custom sale.

### 11. Production readiness is part of the product

Baseline:

- RLS for tenant-owned tables
- Auth guards for staff/owner routes
- No committed secrets
- Environment validation
- Error/loading/empty states
- Basic tests
- Basic logging/observability
- Known gaps documented

### 12. Testing strategy

Testing should cover business-critical flows first.

Priority tests:

- Order total calculation
- Price cents conversion
- Loyalty accrual/redeem rules
- Order creation
- Staff status updates
- Menu CRUD
- Public menu smoke test
- Customer order smoke test
- Tenant isolation where feasible

### 13. Integrations come after validation

Square, Toast, Clover, SMS, email campaigns, and wallet passes wait until the standalone product proves value.

### 14. Roadmap summary

Current phase:

- Make onboarding and pilot usage practical for real cafes.

V2:

- Expand into retention, campaigns, integrations, analytics, and possibly multi-location support.

### 15. Codex session lifecycle

Every Codex session begins by reading `CODEX.md` and `docs/DECISIONS.md`.

Every Codex session ends by updating `CODEX.md`, `docs/DECISIONS.md`, relevant ADRs/topical docs, or `docs/KNOWN_GAPS.md` when the session changes durable context.

### 16. Prototype design brief

Prototype/UI polish work should follow `design.md`.

`design.md` is the source of truth for the next prototyping pass covering landing, cafe microsite, customer order flow, staff board, owner dashboard, menu management, customers, and rewards dashboard screens.

The design pass must preserve current pilot boundaries: no payments, no Telegram, no native app, no inventory, and no POS integration.
