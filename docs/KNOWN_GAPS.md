# Known Gaps

These gaps remain unresolved in the current BrewLoop product.

## Provider verification

- Supabase, Twilio Verify, and Square Sandbox credentials are not available, so
  the live production path has not yet been exercised.
- Credential-free development uses explicit demo mode. Production rejects demo
  mode and missing provider configuration, unless the deploy also sets the
  explicit `BREWLOOP_ALLOW_HOSTED_DEMO=true` opt-in to host the demo showcase
  on the production domain during the pre-pilot sales phase.
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

- Loyalty uses one fixed ten-visit rule. Redemption exists (owner/manager
  lookup + redeem on `/dashboard/rewards`); configurable rules, points-based
  redemption, a transaction history UI, and a barista redeem flow on the
  staff board are deferred.
- Customer CSV export from `/dashboard/customers` is deferred.
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
  The production reward-redemption path (`/api/loyalty/members`) is untested
  against a live Supabase project.
- The checked-in Playwright suite covers the browser-storage demo flows,
  including owner customer synchronization and reward redemption.
- The owner/staff auth-redirect tests remain `fixme` because the Playwright
  suite runs in demo mode, where `requireCafeMember` short-circuits to a fake
  owner; they need a production-mode test harness.
