# Production Readiness Strategy

## Goal

BrewLoop should be production-ready enough to pilot with real local businesses while keeping operational overhead low.

The product should support many businesses through configuration, not custom code or separate deployments.

## Deployment model

Use one shared application and one shared database project at first.

Recommended baseline:

- Next.js app hosted on Vercel
- Supabase for Postgres/Auth/Realtime
- One production environment
- One preview/staging environment if possible
- Tenant separation by `cafe_id`

Avoid per-business deployments unless a much larger customer requires isolation later.

## Tenant model

Every tenant-owned table should include `cafe_id` directly or inherit it through a strict relationship.

Examples:

- `menu_categories.cafe_id`
- `menu_items.cafe_id`
- `orders.cafe_id`
- `customers.cafe_id`
- `loyalty_accounts.cafe_id`
- `promotions.cafe_id`

This keeps reads, writes, RLS policies, and future analytics straightforward.

## Configuration over customization

New businesses should be configured through database records.

Current core tables:

- `cafes`
- `cafe_users`
- `customers`
- `menu_categories`
- `menu_items`
- `orders`
- `order_items`
- `loyalty_accounts`
- `loyalty_transactions`
- `promotions`

Planned configuration and operations tables:

- `cafe_settings`
- `loyalty_programs`
- `reward_rules`
- `qr_codes`
- `business_hours`
- `staff_invites`
- `audit_events`

Later:

- `locations`
- `campaigns`
- `campaign_recipients`
- `promo_redemptions`
- `integrations`

## Security baseline

Production readiness requires:

- Supabase Row Level Security enabled for tenant-owned tables
- No real secrets committed
- `.env.example` only contains placeholder values
- Auth guard middleware for owner/staff routes
- Public write paths limited to customer/order/loyalty signup actions
- Service role key used only server-side when absolutely necessary
- Staff role checks before order/status/menu mutations

## RLS direction

Public users may:

- Read active cafe/menu data
- Create customer records
- Create orders and order items
- Join loyalty

Authenticated staff may:

- Read orders for their cafe
- Update order statuses for their cafe

Managers/owners may:

- Manage menu data for their cafe
- View customers and loyalty accounts for their cafe

Owners may:

- Manage cafe settings
- Invite staff
- Configure loyalty

The deployed policies require adversarial review and automated tenant-isolation
tests before a production pilot. Current security gaps belong in
`docs/KNOWN_GAPS.md`.

## Testing baseline

Minimum useful test layers:

### Unit tests

- Order total calculations
- Price cent conversion
- Loyalty point accrual
- Loyalty reward redemption
- Status transition validation

### Integration tests

- Create order with order items
- Join loyalty program
- Update order status
- Create/update menu item
- Tenant isolation checks if feasible

### E2E smoke tests

The checked-in Playwright suite covers:

- Public menu loads
- Customer submits pickup order
- Customer submits table order with `?t=12`
- Staff marks order making/ready/completed
- Owner creates or edits menu item

The suite currently runs against the browser-storage demo adapter. Database,
RLS, authentication, and real payment integration still require separate
integration coverage.

GitHub Actions runs the unit, build, parser, lint, and Playwright suites on pull
requests and pushes to `main`.

## Observability baseline

Before a real pilot, add lightweight visibility:

- Vercel logs for app/runtime issues
- Supabase logs for DB/auth issues
- Error boundary UI for customer-facing failures
- Basic `audit_events` table for important actions

Recommended `audit_events` examples:

- menu item created/updated/deactivated
- order status changed
- loyalty reward redeemed
- staff invited
- settings changed

Sentry or similar can be added later if real usage starts.

## Operational checklist before first pilot

Before using BrewLoop with a real cafe:

- Production deploy works
- Demo cafe flow works end-to-end
- Real cafe can be created without code changes
- Menu can be entered/imported
- QR code opens correct cafe/order page
- Table QR preserves table number
- Staff order board works on tablet/phone
- Owner can edit menu safely
- RLS policies are reviewed
- Test order data can be cleared
- Known gaps are documented
- Backup/export plan exists for customer/menu/order data

## Minimal-overhead onboarding flow

Target flow:

1. Create business/cafe
2. Configure brand
3. Configure loyalty
4. Add/import menu
5. Generate QR pack
6. Invite staff
7. Run test order
8. Launch pilot

The target for v1.5 is onboarding a cafe manually in under 30 minutes.

## Scaling principle

Do not scale complexity before scaling customers.

Delay these until real pilot feedback demands them:

- Payments
- Deep POS sync
- Native mobile apps
- Inventory
- Staff scheduling
- Payroll
- AI recommendations
- Multi-location dashboards

The scalable core is tenant-safe data, simple configuration, reliable QR ordering, and loyalty capture.
