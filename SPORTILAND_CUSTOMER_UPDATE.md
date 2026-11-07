# SportiLand Customer Web Update

## Navigation
- Removed the separate Home button from the top controls.
- Kept Back.
- Renamed the Discover navigation item to Home.

## Account and policy
- Added Terms & Conditions to the signed-in account dropdown, mobile navigation, and footer.
- Added the full seven-part Rain & Weather Refund Policy page.
- Added roof classification and rain-refund information to venue details, checkout, My Bookings, WhatsApp details, and the QR booking payload.
- If a venue has no roof data, the interface clearly shows Not confirmed / Pending venue confirmation. The current venue catalogue does not contain confirmed roof classifications for all venues.

## Shop
- Replaced catalogue and cart placeholder icons with product-specific product photography.
- Photo URLs and source information are listed in `SHOP_PRODUCT_IMAGE_SOURCES.md`.

## Run locally
```bash
npm install
npm run dev
```
