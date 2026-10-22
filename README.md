# ThaiGoShare

Mobile-first vanilla HTML/CSS/JavaScript prototype for renting travel gear and Thai outfits from local shops. Catalog prices are illustrative and not verified market prices. Unsplash images are remote visual placeholders; replace with licensed product photos before launch.

## Run locally

The app uses ES modules. Start a static server from this directory, for example `npx serve .`, then open the printed local URL. No build step or secret is required for the client-side demonstration.

## Supabase setup

Create a Supabase project and run `supabase/schema.sql`. Create a trusted owner through the dashboard or private admin script; signups are assigned renter role. Replace the placeholder owner UUID in `supabase/seed.sql` with that trusted profile UUID, then run the seed. Seed item IDs are stable and repeatable. SQL stores money in integer satang, applies RLS, blocks overlapping pending/confirmed bookings with a PostgreSQL exclusion constraint, and provides atomic `create_booking` and owner status-transition RPCs. The current browser app does not call these services; reservations are not persisted or availability-checked.

Copy `.env.example` to `.env.local` when deploying/configuring. The Supabase anon key is public; never put a service role key or OpenAI key in client code. The OpenAI endpoint is not implemented in this demo.

## Implemented demo flows

- Search by name, category, area; sort by price.
- Product detail, pickup/return dates, instant integer-satang pricing, protection toggle, and clear demo checkout summary.
- Checkout is display-only and does not submit a booking or take payment.
- AI matcher uses deterministic fallback categories matched to actual demo products; it does not call OpenAI.
- Business calculator estimates commission only, with illustrative values.
- Auth controls are disabled placeholders until Supabase Auth is wired.

## Pricing tests

Requires Node.js 18+: `node --test tests/pricing.test.js`. The JS pricing API accepts baht and converts to satang; SQL amounts are satang. Return date is exclusive. Commission is 12% of rent; community fund is 2% of commission and not additional renter revenue.

## Two-minute demo

1. Explain local rental and community benefit.
2. Search for a Khao Yai tent, filter and sort.
3. Open detail, choose dates, toggle damage protection, inspect estimate.
4. Show the checkout disclaimer: no real reservation/payment yet.
5. Show AI fallback and commission estimate.

## Remaining before launch

Connect Supabase Auth/catalog and booking RPCs, build owner/renter dashboards, implement a validated/rate-limited server-side AI endpoint, verify terms/prices with partner shops, use licensed product imagery, test configured integrations and deploy. No public URL or demo accounts are configured.
