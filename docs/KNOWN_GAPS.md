# Known Gaps

These gaps remain unresolved in the current BrewLoop product.

## Provider verification

- Supabase, Twilio Verify, and Square Sandbox credentials are not available, so
  the live production path has not yet been exercised.
- Credential-free development uses explicit demo mode. Production rejects demo
  mode and missing provider configuration.
- Run `RUN_INTEGRATION_TESTS=true npm test` after applying migrations and adding
  provider credentials.

## Authentication and authorization

- The deployed RLS policies need an adversarial review and automated tenant
  isolation tests before production use.
- Public endpoints still need rate limiting and abuse protection.
- The Supabase security advisor reports a pre-existing
  `public.rls_auto_enable()` security-definer function as executable by `anon`
  and `authenticated`. It predates BrewLoop's migration and needs an ownership
  review before its grants are changed.

## Realtime and operations

- Error tracking, structured logging, audit events, and pilot data cleanup tools
  are not implemented.
- Backup/export and restore procedures are not defined.

## Product depth

- Owner menu management and analytics still use prototype data; the first
  production slice wires customer ordering, loyalty, and the staff board.
- Loyalty uses one fixed ten-visit rule. Configurable rules, redemption, and
  transaction history are deferred.
- Menu categories can be added, renamed, and deleted when empty; drag-and-drop
  reordering is deferred.
- Menu items can be added, edited, activated, and hidden; permanent deletion is
  deferred.
- Structured modifiers, messaging, and POS integrations remain out of scope.

## Payments

- Production checkout is wired to Square Web Payments, Orders, Payments, and
  verified webhooks but remains unverified until Sandbox credentials are added.
- Refund initiation, payouts, reconciliation, disputes, and support procedures
  remain operational gaps. Refund webhook handling is required before launch.

## Testing

- Credential-gated database and provider integration coverage remains minimal.
- The checked-in Playwright suite covers the browser-storage demo flows.
- Owner customer synchronization and reward redemption remain `fixme`.
