# BrewLoop Decision Log

This document captures product, architecture, and business-model decisions made during early BrewLoop planning.

## 1. Product wedge

Decision:

BrewLoop starts as a QR-to-web ordering and loyalty capture platform for independent cafes.

Why:

- The initial opportunity is helping local shops capture repeat customers without replacing their existing POS.
- QR ordering is simple to understand and easy to demo.
- Loyalty capture creates business value beyond a one-time order.

Not doing yet:

- Full POS replacement
- Payment processing
- Inventory management
- Staff scheduling/payroll
- Native mobile app
- Deep POS integrations

## 2. North Star

Decision:

BrewLoop's North Star is:

> A new cafe can launch a branded QR menu, loyalty program, staff order queue, and customer list in under 30 minutes with no developer involvement.

Why:

- Every new business should be configuration, not custom code.
- A repeatable onboarding flow is required for BrewLoop to scale beyond one-off local projects.

## 3. Telegram avoidance

Decision:

BrewLoop will not depend on Telegram for customer ordering, loyalty, owner setup, or staff operations.

Why:

- Local cafe customers should not need Telegram or any messaging app to order or join rewards.
- QR-to-web is lower friction and works from a normal mobile browser.
- Telegram may work in some markets, but it is not the right default for local Florida coffee shops.
- The valuable part is customer capture and repeat-visit marketing, not Telegram itself.

Default replacement:

- QR-to-web for entry
- Phone/email for loyalty signup
- Email/SMS as future optional campaign channels

## 4. No payments in v1

Decision:

BrewLoop v1 does not include payment processing.

Why:

- Payments add support, reconciliation, refund, tax, payout, and POS mismatch complexity.
- Early validation only needs to prove menu browsing, lightweight orders, staff queue, and loyalty capture.
- Shops can continue using their existing register/POS during pilots.

Future:

- Consider Square, Toast, Clover, or Stripe only after the base workflow is validated.

## 5. Menu data belongs in BrewLoop

Decision:

Each business's menu must exist in BrewLoop's database.

Why:

- Menu data powers customer browsing, cart creation, order totals, order item snapshots, loyalty, analytics, reorder/favorites, and future campaigns.
- Even if a POS integration exists later, BrewLoop still needs a normalized internal menu model.

Implementation direction:

- V1: manual owner CRUD
- V1.5: CSV upload, bulk paste, table editor, duplicate-from-template
- V2+: POS/menu imports as optional accelerators

## 6. Menu setup should be configuration, not engineering

Decision:

Adding a new cafe should not require code changes.

Why:

- Custom code per shop destroys scalability.
- The same routes, tables, and components should support every cafe.

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

## 7. Drink modifiers are deferred but planned

Decision:

V1 should use an order notes field for customizations. Proper drink modifiers should be designed for a later version.

Why:

- Real cafes need milk substitutions, sizes, whip/no-whip, cold foam, syrup, extra shots, and other modifiers.
- However, a full modifier system is a schema/product rabbit hole and should not block MVP validation.

V1 fallback:

- `notes` field on orders/order items

Future model:

- `modifier_groups`
- `modifiers`
- `menu_item_modifier_groups`
- `order_item_modifiers`

## 8. Shared SaaS hosting is the default

Decision:

BrewLoop's default product model should be a shared SaaS-hosted app.

Why:

- One app and one codebase are easier to update, monitor, support, and improve.
- Tenant separation by `cafe_id` keeps onboarding scalable.
- Recurring revenue is better aligned with a product business.

Default stack:

- Vercel
- Supabase
- Cloudflare/DNS
- Resend later
- Twilio later

## 9. Client-owned infrastructure is optional/premium

Decision:

Client-owned deployment is valid, but should be offered as a custom/premium package, not the default BrewLoop product path.

Why:

- Client-owned deployments reduce BrewLoop's recurring hosting liability.
- They can help close local businesses that want ownership.
- But they create update, support, monitoring, and environment drift problems.

Possible client-owned stack:

- Client-owned Vercel account
- Client-owned Supabase account
- Client-owned domain/DNS account
- Client payment method on provider accounts

Contract direction:

- Client owns and pays for third-party accounts.
- Setup includes initial deployment and handoff.
- Warranty covers bugs for a defined period only.
- New features and provider/DNS issues are separate.

## 10. One shared app before per-client deployments

Decision:

Start with one shared app and one shared database project.

Why:

- Per-client deployments increase operational overhead too early.
- A shared app validates the product faster.
- Multi-tenant design is the right foundation for SaaS.

Exception:

- Offer client-owned deployment only when it is part of a premium/custom sale.

## 11. Production readiness is part of the product

Decision:

Production readiness should be built into the roadmap, not patched in later.

Baseline requirements:

- RLS for tenant-owned tables
- Auth guards for staff/owner routes
- No committed secrets
- Environment validation
- Error/loading/empty states
- Basic tests
- Basic logging/observability
- Known gaps documented

## 12. Testing strategy

Decision:

Testing should cover business-critical flows first, not chase perfect coverage.

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

## 13. Integrations come after validation

Decision:

Square, Toast, Clover, SMS, email campaigns, and wallet passes should wait until after the standalone product proves value.

Why:

- Integrations are accelerators, not the core wedge.
- Building integrations before pilots risks wasting time on the wrong feature set.

## 14. Roadmap summary

V1:

- Prove the core QR ordering + loyalty capture workflow.

V1.5:

- Make onboarding and pilot usage practical for real cafes.

V2:

- Expand into retention, campaigns, integrations, analytics, and possibly multi-location support.
