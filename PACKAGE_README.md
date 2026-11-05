# FieldFinder — Experimental Customer Web

This is a **separate design experiment** inspired by the editorial, image-led structure and navigation of the reference website `https://carnilove.ashfall.studio/`. It does not copy that site's branding, text, or imagery.

**The existing FieldFinder palette is retained**: white, pale green, lime accents, charcoal text and the same overall typography family. The experiment changes the layout and presentation only. It is intentionally packaged separately so the original Customer website remains untouched.

## What changed in this experiment

- Large editorial hero with layered FieldFinder venue photography and a prominent venue search.
- A top horizontal navigation with a click-to-open Sports mega-menu and a mobile navigation drawer.
- Clickable local event and new-sport cards instead of a plain text ticker.
- Sport discovery cards, image-led story sections, a community / find-players callout and an editorial venue directory.
- Scroll reveal using one-time `IntersectionObserver` behaviour, with reduced-motion support.
- Responsive layouts for laptops, tablets and Android / iOS screens.
- Retains Madurai-area venue listings, including pickleball, paintball and boxing, existing venue photos, event listings, galleries and booking/detail flows.
- Retains guest-first browsing: customers can browse without signing in. Customer registration/login is requested when a protected booking or account action begins.

## Run alongside the original app

This experiment uses **port 5176**, so the original Customer app can remain on port 5174 for side-by-side comparison.

```bash
npm install
npm run dev
```

Open `http://localhost:5176`. For another device on the same Wi-Fi, use `http://<computer-LAN-IP>:5176`.

## Backend notes

- Public venue browsing works without signing in.
- Customer registration/login uses the shared FieldFinder Spring Boot API on port `8080`. Start the existing `fieldfinder-backend` to test account creation and sign-in.
- Owner-published games, photos and videos also require the shared backend. The app reads `GET /api/public/turfs` and refreshes periodically.
- The API defaults to the same host as the browser on port 8080. To use another backend host, create `.env` from `.env.example` and set `VITE_API_BASE_URL`.
- Booking, payment, tournament registration and some event request flows remain demo/local data unless connected to their real services. Do not treat demo confirmation as a real booking or payment.
- Bootstrap dropdown support is loaded from jsDelivr, so an internet connection is needed for the Bootstrap account dropdown.

## Reference

Design inspiration: `https://carnilove.ashfall.studio/` — used as a reference for its editorial landing-page hierarchy, oversized hero, image layering, clear top navigation and story-led sections. FieldFinder content, name, colours, venue data and interactions remain FieldFinder-specific.
