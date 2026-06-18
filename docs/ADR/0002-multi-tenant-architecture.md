# ADR 0002: Multi-Tenant Architecture

## Status

Accepted

## Context

BrewLoop needs to support multiple cafes without creating a separate codebase, route tree, or deployment for each one.

The product should eventually allow a new cafe to launch a branded QR menu, loyalty program, staff order queue, and customer list in under 30 minutes.

## Decision

BrewLoop will use a shared multi-tenant architecture.

Default structure:

- One shared Next.js application
- One shared Supabase project/database at first
- Public cafe pages routed by slug
- Tenant-owned records separated by `cafe_id`
- Row Level Security used for tenant boundaries

Primary customer route pattern:

```text
/cafe/[slug]
/cafe/[slug]/order
/cafe/[slug]/rewards
```

Tenant-owned tables should include `cafe_id` directly or inherit it through a strict relationship.

Examples:

- `menu_categories.cafe_id`
- `menu_items.cafe_id`
- `orders.cafe_id`
- `customers.cafe_id`
- `loyalty_accounts.cafe_id`
- `promotions.cafe_id`

## Rationale

A shared multi-tenant architecture keeps onboarding scalable. Each new cafe should be configuration, not code.

Adding a cafe should require:

1. Create cafe record
2. Configure branding
3. Configure loyalty
4. Add/import menu
5. Generate QR codes
6. Invite staff
7. Launch

It should not require:

- New deployments
- Custom routes
- Hardcoded cafe-specific components
- Schema changes
- Branching logic per shop

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

## Consequences

Positive:

- Lower operational overhead
- Easier product updates
- One main deployment to monitor
- Stronger SaaS path
- Faster onboarding for new cafes

Negative:

- RLS and tenant isolation must be designed carefully.
- Shared infrastructure means BrewLoop owns uptime and reliability for SaaS customers.
- Mistakes in tenant filtering can be high impact.

## Follow-ups

- Add RLS policies during scaffold.
- Add tenant isolation tests where feasible.
- Document any incomplete RLS gaps in `docs/KNOWN_GAPS.md`.
