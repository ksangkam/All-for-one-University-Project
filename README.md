# ThaiGoShare

Mobile-first vanilla HTML/CSS/JavaScript prototype for renting travel gear and Thai outfits from local shops. Catalog prices are illustrative and not verified market prices. Unsplash images are remote visual placeholders; replace with licensed product photos before launch.

## Run locally

The app uses ES modules. Start a static server from this directory, for example `npx serve .`, then open the printed local URL. No build step or secret is required for the client-side demonstration.

## Supabase setup

Create a Supabase project and run these SQL files in order from the SQL Editor:

1. `supabase/schema.sql`
2. `supabase/owner_portal.sql`
3. `supabase/seed.sql` (replace the example owner UUID with a real approved owner profile, or seed after an owner has been approved)

Set the project's Site URL and allowed redirect URLs in Supabase Auth for your local server and deployed domain. Copy the Supabase project URL and **public anon/publishable key** into `js/supabase-config.js`. The anon key is intended for browser use; never put a service role key there. The static site cannot read `.env.local` directly, so `.env.example` documents the names but the browser values belong in the config module.

All new signups get the `renter` role. A shop signup creates a pending `owner_applications` record, not owner privileges. Review the request in Supabase and run the approval transaction at the bottom of `supabase/owner_portal.sql` using a trusted SQL Editor session; client-side role changes are blocked. Owners can then create their shop and manage its listings from `dashboard/owner.html`. Product write policies scope all listing actions to the signed-in shop owner. RLS protects data even if someone bypasses the UI.

Money is stored in integer satang. The schema applies RLS, blocks overlapping pending/confirmed bookings with a PostgreSQL exclusion constraint, and provides atomic `create_booking` and owner status-transition RPCs. The existing public demo checkout still does not submit reservations or payments.

The `.env.example` is for documenting deployment settings and a future server-side endpoint; it is not loaded by the static browser app. The Supabase anon key is public; never put a service role key or OpenAI key in client code. The OpenAI endpoint is not implemented in this demo.

## Implemented demo flows

- Search by name, category, area; sort by price.
- Product detail, pickup/return dates, instant integer-satang pricing, protection toggle, and clear demo checkout summary.
- Checkout is display-only and does not submit a booking or take payment.
- AI matcher uses deterministic fallback categories matched to actual demo products; it does not call OpenAI.
- Business calculator estimates commission only, with illustrative values.
- Email/password signup and login, including renter registration and pending owner applications (requires Supabase config and enabled email provider).
- Owner dashboard with first-shop setup and create, edit, show/hide product listings (requires `schema.sql` and `owner_portal.sql`).

## Pricing tests

Requires Node.js 18+: `node --test tests/pricing.test.js`. The JS pricing API accepts baht and converts to satang; SQL amounts are satang. Return date is exclusive. Commission is 12% of rent; community fund is 2% of commission and not additional renter revenue.

## Magnetic button motion

`js/magnetic-buttons.js` adds spring-based cursor follow and click bounce to every `<button>` and `.btn` link except `.menu-btn`. It also observes newly rendered buttons, such as product cards and modal actions. The cursor pull is capped at 7px; touch uses click bounce only. Users who prefer reduced motion do not receive either animation.

Tune the constants near the top of that module:

- Raise `POSITION_STIFFNESS` for a quicker, firmer cursor pull; lower it for a softer pull.
- Raise `POSITION_DAMPING` to stop wobble sooner; lower it for a more elastic follow.
- Raise `SCALE_STIFFNESS` for a faster click rebound; lower it for a softer bounce.
- Raise `SCALE_DAMPING` to reduce bounce oscillation; lower it to make the rebound springier.

## Two-minute demo

1. Explain local rental and community benefit.
2. Search for a Khao Yai tent, filter and sort.
3. Open detail, choose dates, toggle damage protection, inspect estimate.
4. Show the checkout disclaimer: no real reservation/payment yet.
5. Show AI fallback and commission estimate.

## Remaining before launch

Connect booking submission and renter dashboard, implement a validated/rate-limited server-side AI endpoint, verify terms/prices with partner shops, use licensed product imagery, configure Supabase credentials, test configured integrations and deploy. No public URL or demo accounts are configured.
