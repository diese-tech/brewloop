# ADR 0001: Product Scope

## Status

Accepted

## Context

BrewLoop was inspired by a Reddit post describing a QR ordering and loyalty system for cafes. The original implementation used Telegram for customer messaging and loyalty, but the underlying value was broader than Telegram: scan a QR code, browse/order, capture the customer, and create a repeat-visit loop.

Dustin is connected with local coffee shops, which creates an opportunity to validate a local-business product through direct relationships.

Source context:

- [Sold a $700 app to a coffee shop. I didn't write it, Claude did.](https://www.reddit.com/r/AI_Agents/s/ch7ALPwnks)

## Decision

BrewLoop will start as a QR-to-web ordering and loyalty capture platform for independent cafes.

The v1 product will focus on:

- Public cafe page
- QR-to-web menu
- Pickup/table ordering
- Staff order queue
- Customer capture
- Basic loyalty progress
- Owner menu management

BrewLoop will not include these in v1:

- Payment processing
- Native mobile apps
- Telegram dependency
- SMS marketing
- POS replacement
- Deep POS integrations
- Inventory management
- Staff scheduling/payroll
- Complex campaign builders

## Rationale

The smallest valuable wedge is not "coffee shop software." That category is too broad and would lead to POS, payroll, inventory, scheduling, and support complexity.

The sharper wedge is:

> QR-to-web ordering plus loyalty capture for local cafes.

This is easy to demo, easy for owners to understand, and directly tied to repeat customer value.

## Telegram decision

BrewLoop will intentionally avoid Telegram as a required customer, staff, or owner dependency.

Reasons:

- Customers should not need to install or use Telegram.
- A normal phone browser is lower friction.
- Phone/email capture is more appropriate for local Florida coffee shops.
- Platform-neutral architecture keeps future SMS/email/wallet/POS options open.

## Payment decision

BrewLoop will avoid payments in v1.

Reasons:

- Payments create refund, payout, tax, reconciliation, and support complexity.
- Shops can keep using their existing register/POS during pilots.
- The first validation target is whether shops value QR ordering, customer capture, and loyalty.

## Consequences

Positive:

- Faster MVP
- Less support burden
- Easier pilot conversations
- Stronger focus on the repeat-customer value proposition

Negative:

- Customers may still need to pay at the counter/register.
- Some owners may expect payments eventually.
- Staff may need to reconcile BrewLoop orders with their existing register manually during pilots.

## Follow-ups

- Document known gaps in `docs/KNOWN_GAPS.md`.
- Revisit payments only after a pilot validates core demand.
- Revisit messaging after phone/email opt-in and compliance requirements are defined.
