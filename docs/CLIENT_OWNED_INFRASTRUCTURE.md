# Client-Owned Infrastructure Model

## Context

The Reddit source post and OP replies describe a business model where the developer does not personally host or pay for the client's production infrastructure.

Instead, the developer helps the business set up infrastructure in the client's name:

- domain account
- VPS/hosting account
- payment method
- production deployment
- warranty/support terms

The developer builds and deploys the app, but the business owns and pays for the infrastructure directly.

## Why this matters

This model reduces the developer's long-term financial exposure.

If the client pays once and the developer also pays monthly hosting forever, the project becomes a liability. Client-owned infrastructure avoids that by making the business responsible for recurring platform costs.

## BrewLoop recommendation

BrewLoop can support two models.

### Model A: SaaS-hosted BrewLoop

BrewLoop owner hosts one shared application and charges monthly.

Best for:

- recurring revenue
- centralized updates
- easiest support
- consistent product experience
- scaling across many cafes

Tradeoff:

- BrewLoop owner is responsible for uptime, infrastructure, billing, and support.

### Model B: Client-owned deployment

The business owns its hosting/domain/provider accounts.

Best for:

- one-time setup projects
- clients who want ownership
- reducing developer infrastructure liability
- local custom deals

Tradeoff:

- harder to update many clients
- harder to monitor consistently
- more deployment variance
- less SaaS leverage

## Recommended default

For BrewLoop as a product, prefer Model A: SaaS-hosted.

For early custom/local deals, Model B can be offered as a premium setup option.

## Client-owned deployment workflow

1. Create client account with hosting provider
2. Register or connect domain in client's name
3. Add client's payment method directly to provider account
4. Deploy BrewLoop instance or configured app
5. Configure environment variables
6. Configure database/storage
7. Generate QR links/codes
8. Test customer flow
9. Test staff flow
10. Handoff credentials and documentation

## Tools that can support this

Possible hosting/deployment tools:

- Vercel
- Render
- Fly.io
- Railway
- DigitalOcean App Platform
- DigitalOcean Droplet
- Hetzner VPS
- IONOS VPS

Possible database tools:

- Supabase
- Neon Postgres
- Railway Postgres
- Managed Postgres from cloud provider

Possible domain/DNS tools:

- Cloudflare Registrar/DNS
- Namecheap
- Porkbun
- Squarespace Domains
- GoDaddy, only if the client already uses it

## Recommended simple stack for client-owned deployments

For low-overhead deployments, prefer:

- Vercel for app hosting
- Supabase for database/auth/realtime
- Cloudflare for DNS

This avoids manually maintaining a VPS, server patches, reverse proxies, SSL certificates, and process managers.

## When to use a VPS

A VPS may make sense if:

- the client insists on owning a server
- the app requires long-running services
- cost must be extremely predictable
- the developer is comfortable with Linux ops
- monitoring/updates/backups are clearly defined

A VPS adds operational responsibility:

- OS security updates
- firewall
- backups
- SSL certificates
- reverse proxy
- database backups if self-hosted
- uptime monitoring
- logs
- disaster recovery

Do not use a VPS casually just because it sounds cheaper.

## Contract/support implications

If using client-owned infrastructure, the agreement should clearly state:

- who owns the accounts
- who pays recurring provider costs
- what support is included
- what counts as a bug fix
- what counts as new feature work
- whether provider outages are excluded
- whether DNS/domain issues are excluded
- how long warranty support lasts
- hourly/project rate for future changes

Suggested support model for one-time deals:

- setup fee includes deployment and initial handoff
- limited warranty covers bugs for a defined period
- new features are separate paid work
- hosting/provider bills are paid directly by the client

## BrewLoop product decision

Do not make client-owned infrastructure the default product model unless BrewLoop is being sold as custom local software.

For a scalable SaaS business, centralized hosting is cleaner.

For one-off local builds, client-owned infrastructure is a valid way to avoid recurring cost liability.

## Practical recommendation for Dustin

Start with SaaS-hosted BrewLoop for pilots.

Use one app and one database with tenant separation by `cafe_id`.

Offer client-owned deployment only as a premium or custom package, because it increases handoff and support complexity.

Example offer structure:

- BrewLoop SaaS Pilot: monthly subscription, hosted by BrewLoop
- BrewLoop Custom Ownership Setup: one-time setup fee plus client-owned Vercel/Supabase/domain accounts

This keeps the main product scalable while preserving the ability to close local businesses that prefer ownership.
