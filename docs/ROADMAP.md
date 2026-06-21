# BrewLoop Roadmap

## North Star

BrewLoop is the lightweight customer operating layer for independent cafes and small hospitality businesses.

The long-term goal is not to replace Square, Toast, Clover, Shopify POS, or other payment/register systems. BrewLoop should sit above or beside those systems as the fastest way for a local shop to launch:

- A branded QR menu
- Lightweight table or pickup ordering
- Staff order queue
- Customer capture
- Loyalty rewards
- Repeat-visit marketing
- Basic customer analytics

## North Star outcome

A new cafe can launch a branded QR menu, loyalty program, staff order queue, and customer list in under 30 minutes with no developer involvement.

## Product principle

Every new business should be mostly configuration, not code.

Adding a new cafe should require:

1. Create a cafe record
2. Set slug, logo, colors, and public profile details
3. Configure loyalty rules
4. Add or import the menu
5. Generate QR links/codes
6. Invite staff
7. Go live

It should not require custom routes, custom deployments, schema changes, branching business logic, or one-off code hacks.

## Product wedge

BrewLoop starts with a narrow wedge:

> QR-to-web ordering plus loyalty capture for local cafes.

This is intentionally smaller than a full cafe operating system. The pilot
should validate that shops value customer capture and repeat-visit loops before
the product expands into more complex operational features.

## V1.5: Sellable pilot

### Purpose

Make BrewLoop usable for real local shops with minimal hand-holding.

### Scope

#### Cafe onboarding

- Owner onboarding wizard
- Cafe profile setup
- Branding setup:
  - logo
  - primary color
  - public display name
  - address/social links
- Menu import helper:
  - CSV upload
  - structured manual entry
  - duplicate item/category support
- QR code generator:
  - general cafe QR
  - pickup QR
  - table-specific QR codes

#### Loyalty improvements

- Configurable loyalty rule:
  - visits-based punch card
  - points-per-order
  - manual adjustment
- Reward threshold configuration
- Staff redeem flow
- Customer lookup by phone/email

#### Operational polish

- Basic staff roles
- Simple order notes/modifiers
- Order history
- Daily order/customer summary
- Owner dashboard metrics:
  - orders today
  - new customers
  - repeat customers
  - loyalty signups

#### Production hygiene

- Error boundaries
- Loading states
- Empty states
- Auth guard middleware
- Environment validation
- Database integration and tenant-isolation tests
- Playwright smoke tests
- Vercel deployment checklist

### Success criteria

- A new cafe can be onboarded manually by the BrewLoop operator in under 30 minutes.
- A cafe can run a small pilot day without developer intervention.
- The owner can see whether customer capture and loyalty are working.

## V2: Retention platform

### Purpose

Turn BrewLoop from a QR/order-lite tool into a repeat-customer and retention platform.

### Scope

#### Messaging and campaigns

- Email campaign sending
- SMS campaign support after opt-in/compliance rules are defined
- Customer segments:
  - new customers
  - inactive customers
  - frequent customers
  - repeat customers
- Promo redemption tracking

#### Integrations

Integrations should come after the standalone product proves useful.

Possible integrations:

- Square Customers API
- Square Orders API
- Square Loyalty API
- Toast/Clover research later
- Google Business Profile link support
- Mailchimp/Resend export support

Integrations should reduce duplicate work. They should not be mandatory for the base product to function.

#### Multi-location and templates

- Multiple locations per business
- Reusable cafe templates
- Menu duplication between locations
- Brand-level dashboard
- Location-level staff views

#### Analytics

- Customer lifetime visits
- Repeat visit rate
- Loyalty conversion rate
- Campaign conversion tracking
- Estimated revenue from captured orders, if payment integration exists later
- Exportable CSV reports

#### Customer experience

- Customer profile page
- Wallet pass research
- PWA install prompt
- Saved favorites
- Reorder from previous order

### Success criteria

- BrewLoop can support multiple real businesses without custom code.
- Shop owners can make marketing decisions from BrewLoop data.
- At least one integration reduces operational friction without becoming the core dependency.

## Guardrails

Avoid these until after a real pilot validates demand:

- Payment processing
- Deep POS integration
- Complex campaign builders
- AI recommendation engines
- Native mobile apps
- Multi-location complexity
- Inventory management
- Scheduling/staff payroll

The wedge is simple: QR-to-web ordering plus loyalty capture. Everything else should support that wedge or wait.
