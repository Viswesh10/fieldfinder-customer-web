# SportiLand Customer V7 — Vercel deployment

This is a Vite + React single-page application. Deploy the contents of `customer-web/` at the GitHub repository root.

## Vercel settings

- Framework preset: Vite
- Root directory: `./`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` includes an SPA rewrite to `index.html`.

## Backend configuration

The frontend can be deployed as a public static site. Customer login and owner-published turf/media require the shared Spring Boot API. Before enabling those live features, deploy the backend to a public HTTPS URL and set this Vercel environment variable for Production and Preview:

`VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN`

Do not put database passwords, JWT signing secrets or other private credentials in `VITE_` variables; Vite exposes them to the browser.

Without `VITE_API_BASE_URL`, API clients fall back to the current website host on port `8080`. A static Vercel deployment still serves the frontend, but backend-dependent login and owner-published content need the hosted API, correct CORS and cookie settings.

## Shop prototype

The Shop page currently uses a sample catalogue and browser-local cart/order state. It is not a live commerce service. Before real sales, connect a backend product catalogue, stock validation, server-side order creation, a verified payment gateway, tax/shipping calculation and fulfilment. See `SHOP_BACKEND_HANDOFF.md`.

## Deploy or update from GitHub

1. Create or open the `SportiLand-customer-web` repository.
2. Upload the *contents* of the `customer-web/` folder to the repository root (do not upload it as an extra nested directory).
3. Commit changes to the production branch (usually `main`).
4. In Vercel, import the repository if it is not already linked. Existing linked projects deploy automatically after a new commit.
5. Use the settings above. The production deployment should build after the commit is pushed.

## Project notes

- Venue directory: `public/venues.json` (49 Madurai-region records)
- Venue, sports category and event images: `public/assets/`
- Event marquee: endless duplicated card track; cards navigate to the selected event or sport
- Venue pagination: 9 listings per page segment with `Show more venues`
- Storefront: 12 sample sports products, search, categories, cart and demo checkout
- Photo provenance and generated illustrative image notes: `VENUE_PHOTO_ATTRIBUTION.md`
- Event source notes: `EVENT_DATA_SOURCES.md`
- Venue source notes: `MADURAI_SPORT_VENUE_SOURCES.md`
