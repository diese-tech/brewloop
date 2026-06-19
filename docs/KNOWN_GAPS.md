# Known Gaps

These gaps are intentional or incomplete in the current BrewLoop MVP scaffold.

## Data integration

- The interactive UI uses a browser-storage demo adapter. Supabase clients,
  generated database types, deployed schema, RLS, and Demo Coffee seed data
  exist, but production reads and writes are not yet wired to those clients.
- Browser-storage data is local to one browser profile and is not suitable for
  a real café pilot.
- Order creation should become one server-side transaction that validates menu
  prices, calculates the total, inserts the order, and snapshots its items.

## Authentication and authorization

- Staff and owner routes do not yet require Supabase Auth.
- Route-level auth guards and server-side role checks still need implementation.
- The initial RLS policies need an adversarial review and automated tenant
  isolation tests before production use.
- Public insert policies are intentionally permissive for scaffolding and need
  rate limiting, abuse protection, and a transaction-safe order API.
- The Supabase security advisor reports a pre-existing
  `public.rls_auto_enable()` security-definer function as executable by `anon`
  and `authenticated`. It predates BrewLoop's migration and still needs an
  ownership review before its grants are changed.

## Realtime and operations

- The staff board synchronizes browser tabs through local storage rather than
  Supabase Realtime, although the deployed `orders` table is enabled for
  Realtime publication.
- Error tracking, structured logging, audit events, and pilot data cleanup tools
  are not implemented.
- Backup/export and restore procedures are not defined.

## Product depth

- Loyalty uses one fixed ten-visit rule in the demo. Configurable rules,
  redemption, and transaction history are deferred.
- Menu category creation/editing is not yet exposed in the UI.
- Item edits currently cover adding and active/inactive status, not full field
  editing or deletion.
- Structured modifiers, payments, messaging, and POS integrations remain out of
  v1 scope by decision.

## Testing

- Unit coverage currently targets pricing totals, cents conversion, and loyalty
  progress.
- Integration tests for database mutations, RLS, and status transitions are
  still required.
- Playwright smoke tests for customer, staff, and owner flows are still required.
