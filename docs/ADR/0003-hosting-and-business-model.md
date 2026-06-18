# ADR 0003: Hosting and Business Model

## Status

Accepted

## Context

The Reddit OP described a model where the developer does not host or pay for the client's infrastructure. Instead, the developer helps the business set up its own domain/VPS/hosting account and payment method, then deploys the app on behalf of the business.

That model reduces the developer's recurring cost liability, but it behaves more like custom client work than scalable SaaS.

BrewLoop needs a clear default model while still allowing local custom deals when useful.

## Decision

BrewLoop's default model will be SaaS-hosted.

Default SaaS model:

- One shared BrewLoop app
- One shared Supabase database/project at first
- Tenant separation by `cafe_id`
- BrewLoop owner manages hosting, updates, monitoring, and product improvements
- Cafes pay BrewLoop recurring subscription fees

Client-owned infrastructure will be supported only as an optional premium/custom package.

Client-owned model:

- Client owns domain/DNS account
- Client owns Vercel/Supabase/hosting accounts
- Client adds their own payment method to providers
- Developer deploys and configures the app
- Support/warranty is limited by contract

## Rationale

The SaaS-hosted model is better for a scalable product:

- One deployment to update
- Easier monitoring
- Easier bug fixes
- Better recurring revenue
- Less environment drift
- Cleaner product roadmap

The client-owned model is useful for:

- One-off local deals
- Businesses that strongly prefer ownership
- Premium setup packages
- Reducing developer responsibility for third-party hosting bills

However, making client-owned deployments the default would create an agency-style business with more handoff complexity and less leverage.

## Recommended tools

Default SaaS stack:

- Vercel for app hosting
- Supabase for database/auth/realtime
- Cloudflare/DNS
- Resend later for email
- Twilio later for SMS

Client-owned recommended stack:

- Client-owned Vercel account
- Client-owned Supabase account
- Client-owned Cloudflare/Porkbun/domain account
- GitHub access for deployment

Avoid VPS by default unless there is a clear reason.

## VPS position

A VPS can work, but it adds operational responsibility:

- OS updates
- firewall
- backups
- SSL certificates
- reverse proxy
- logs
- monitoring
- database operations if self-hosted
- disaster recovery

BrewLoop should not use a VPS casually just because it looks cheaper.

## Contract implications for client-owned deployments

Client-owned deals should clearly state:

- Client owns and pays for third-party accounts.
- Setup includes initial deployment and launch support.
- Warranty covers bugs for a defined period only.
- Provider outages, DNS issues, billing issues, and new features are not included in warranty.
- Future changes are billed separately.

## Consequences

Positive:

- SaaS path remains scalable.
- Custom ownership package remains available for local sales.
- Hosting responsibility is clear per deal type.

Negative:

- SaaS model means BrewLoop owns uptime and provider bills.
- Client-owned model creates update/support variance.
- Supporting both models requires strong boundaries.

## Follow-ups

- Document client-owned setup in `docs/CLIENT_OWNED_INFRASTRUCTURE.md`.
- Create onboarding checklist for both SaaS-hosted and client-owned pilots.
- Decide pricing after first pilot conversations.
