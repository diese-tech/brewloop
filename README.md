# BrewLoop

BrewLoop is a QR-to-web ordering and loyalty capture app for independent cafés.
It provides a branded public menu, pickup/table order flow, staff queue, owner
menu tools, customer capture, and basic visit rewards without replacing the
café's existing POS.

## Current prototype

- Black Rabbit pilot at `/cafe/black-rabbit`
- Mobile ordering at `/cafe/black-rabbit/order`
- Table QR support, for example `/cafe/black-rabbit/order?t=12`
- Phone/email rewards at `/cafe/black-rabbit/rewards`
- Staff status board at `/staff/orders`
- Owner dashboard and menu management under `/dashboard`
- Supabase schema, tenant-aware RLS policies, Realtime publication, and seed data
- Credential-free demo mode backed by browser storage

Demo mode lets the complete UI run before Supabase is configured. Orders placed
in one tab appear on the staff board in the same browser. Demo menu and rewards
changes also persist in that browser.

## Local development

Requirements:

- Node.js 20.9 or newer
- npm

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The copied environment runs the browser-storage prototype because
`BREWLOOP_DEMO_MODE=true`. Production must set it to `false` and provide every
Supabase, Square, application URL, and QR-signing variable.

Useful checks:

```bash
npm run lint
npm test
npm run build
```

## Environment variables

See `.env.example` for the complete list.

The service-role key must remain server-only. Never expose it through a
`NEXT_PUBLIC_` variable or initialize a service-role client in browser code.

## Supabase setup

1. Create a Supabase project.
2. Install the Supabase CLI if it is not already available.
3. Link the repository to the project.
4. Apply every migration in `supabase/migrations`.
5. Run `supabase/seed.sql` for the Black Rabbit records.
6. Add the project URL and anon key to `.env.local`.

The migration creates the issue-defined tables, constraints, indexes, RLS
policies, role helper functions, and an `orders` Realtime publication.

Production mode reads cafe/menu data from Supabase, creates orders through a
server transaction, processes Square payments, and uses Supabase Realtime for
the staff board.

Configure phone OTP with Twilio Verify in the Supabase dashboard. Twilio
credentials do not belong in this application because Supabase Auth owns SMS
delivery.

Square requires the public application/location IDs plus a server-only seller
access token and webhook signature key. Configure its webhook URL as
`/api/webhooks/square`.

## Product boundaries

The current pilot includes simulated card checkout and tipping, but does not
process real payments. It excludes Telegram, native apps, inventory, payroll,
deep POS integrations, and complex marketing campaigns.
See `CODEX.md` and the ADRs in `docs/ADR/` for the durable product and
architecture decisions.
