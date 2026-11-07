# SportiLand Customer Web — V7

A separate Vite + React Customer experience for the Madurai region. It retains the SportiLand green, lime, white and charcoal colour system and is packaged independently from the Turf Owner frontend.

## Run locally

```bash
npm install
npm run dev
```

Default Vite port: `5176`. To use another port:

```bash
npm run dev -- --port 5177
```

## V7 changes

- **Endless What's On cards:** event, trek and new-sport announcement cards loop continuously across the homepage. The rail pauses on hover/focus so cards can be selected; selecting a card opens the matching event or sport with a smooth scroll to the target.
- **Nine venues at a time:** the directory initially shows 9 venues. `Show more venues` appends the next 9, then the next 9, until the filtered result set is complete. Changing search/sport/area resets the page to the first 9; background owner-content refreshes no longer collapse the list.
- **One directory search area:** the duplicated hero search treatment is not used. The homepage uses the single, full `Find a place to play` directory section with search, area and sport filters.
- **Shop storefront:** dedicated Shop navigation and page; 12 demo sports products; category filters; product search; quantity controls; cart totals; checkout details; and local demo order history. The homepage also has a Shop Essentials callout.
- Existing 49 Madurai-region venue records, venue photos/videos, sports discovery, daily tournament calendar, event/trek cards, player discovery, guest-first browsing and booking flows are retained.

## Shop and booking limitations

The Shop catalogue, prices, cart and demo orders are frontend sample data stored in this browser. No inventory is reserved, no real payment is taken, and no product is shipped. Connect the Store APIs and payment/shipping services before accepting real orders. See `SHOP_BACKEND_HANDOFF.md`.

Venue slot availability, booking confirmations, tournament registrations and several event request flows also remain demo/local unless connected to their backend or official provider. Do not treat a demo status as a confirmed real booking or payment.

## Backend integration

- Public venue browsing works without signing in.
- Customer registration/login uses the shared SportiLand Spring Boot API when available.
- Owner-published games, photos and videos require the shared backend; the Customer app reads the public turf feed and refreshes periodically.
- The API base defaults to the same host as the browser on port `8080`. To use a hosted backend, create `.env` from `.env.example` and set `VITE_API_BASE_URL`.

## Deployment

The project is a Vite static frontend. Use `npm install`, `npm run build` and `dist` as the output directory. `vercel.json` includes the SPA fallback rewrite. Shop orders and browser demo state do not become shared server data after deployment.


## Test a booking without a backend

Use the new **Continue as demo customer** option in the sign-in dialog. It creates a local demo customer session in this browser, then resumes the booking flow you started. Demo bookings and QR passes are saved in browser local storage. Sign out to clear the demo customer session. No real payment or WhatsApp notification is sent.

## V8 animation performance update

The event stack now uses cached scroll geometry, requestAnimationFrame-coalesced updates, a small nearby-image loading window, and limited compositor promotion. Reveal animations are one-shot to avoid replaying and janking on reverse scroll. See `../ANIMATION_PERFORMANCE_NOTES.md`.


## Latest customer UX updates

- The top navigation now uses **Home** instead of **Discover**. The separate Home control was removed; the Back control remains.
- The signed-in customer menu includes a **Terms & Conditions** entry with the complete Rain & Weather Refund Policy. The same policy is linked from venue and checkout details.
- Venue details, checkout, My Bookings, and the QR pass display roof status and the applicable rain-refund rule. The UI reads `roofType`, `roofStatus`, `roofingType`, `coverageType`, `shelterType`, `isRoofed`, `roofed`, or `isCovered` from venue data. It intentionally shows **Not confirmed / Pending venue confirmation** when no roofing field is present; it does not guess the venue's construction.
- Shop product cards and cart thumbnails now use product-specific photos. See `SHOP_PRODUCT_IMAGE_SOURCES.md` for the source links. Images load from their third-party source hosts, so an internet connection is needed to display them. Check image licensing before using the storefront for commercial sales.
