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
- Online card payment and tipping

BrewLoop will not include these in v1:

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

BrewLoop will include online card payment and tipping in the Black Rabbit v1
pilot.

Reasons:

- The approved Black Rabbit pilot preview defines payment as part of the
  customer journey.
- A complete scan-to-paid-order flow is more representative of the intended
  guest experience.
- Payment processing remains separate from POS replacement or deep POS
  integration.

## Consequences

Positive:

- Faster MVP
- A more complete and convincing customer pilot
- Clear paid status for staff operations
- Tip capture in the digital flow

Negative:

- Refund, tax, payout, reconciliation, dispute, and webhook requirements must
  be resolved before production transactions.
- Staff may still need to reconcile BrewLoop orders with the existing register.

## Follow-ups

- Select and integrate a payment processor before accepting real transactions.
- Define refund, tax, payout, reconciliation, and support procedures.
- Revisit messaging after phone/email opt-in and compliance requirements are defined.
