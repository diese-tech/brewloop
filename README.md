# BrewLoop

BrewLoop is a QR-to-web ordering and loyalty capture app for independent cafés.
It provides a branded public menu, pickup/table order flow, staff queue, owner
menu tools, customer capture, and basic visit rewards without replacing the
café's existing POS.

## Current MVP

- Public demo café at `/cafe/demo-coffee`
- Mobile ordering at `/cafe/demo-coffee/order`
- Table QR support, for example `/cafe/demo-coffee/order?t=12`
- Phone/email rewards at `/cafe/demo-coffee/rewards`
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

Useful checks:

```bash
npm run lint
npm test
npm run build
```

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key must remain server-only. Never expose it through a
`NEXT_PUBLIC_` variable or initialize a service-role client in browser code.

## Supabase setup

1. Create a Supabase project.
2. Install the Supabase CLI if it is not already available.
3. Link the repository to the project.
4. Apply `supabase/migrations/20260619011020_initial_schema.sql`.
5. Run `supabase/seed.sql` for the Demo Coffee records.
6. Add the project URL and anon key to `.env.local`.

The migration creates the issue-defined tables, constraints, indexes, RLS
policies, role helper functions, and an `orders` Realtime publication.

The UI currently uses the local demo adapter. Replacing that adapter with the
included lazy Supabase browser/server clients is the next integration milestone;
see `docs/KNOWN_GAPS.md`.

## Product boundaries

The current pilot scope intentionally excludes payments, Telegram, native apps,
inventory, payroll, deep POS integrations, and complex marketing campaigns.
See `CODEX.md` and the ADRs in `docs/ADR/` for the durable product and
architecture decisions.
