# Architecture Memory

## Current accepted direction

- Shared SaaS-hosted app is the default.
- Tenant separation is based on `cafe_id`.
- Public cafe routes use `/cafe/[slug]`.
- Supabase is the planned database/auth/realtime layer.
- RLS is required for tenant-owned tables.

## Open questions

- Exact RLS policy implementation details.
- Whether staff routes are global first or cafe-scoped in the URL.
- How much auth should exist in the first scaffold versus being documented as a known gap.
