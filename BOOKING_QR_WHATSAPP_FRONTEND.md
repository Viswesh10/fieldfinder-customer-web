# SportiLand booking QR + WhatsApp frontend

This V8 frontend update adds:

- A generated QR booking pass after a demo slot booking is created.
- A QR pass action in My bookings so a customer can reopen the pass later.
- Download QR as a PNG.
- Share booking details through a pre-filled WhatsApp message (`wa.me`). The customer chooses the destination chat and taps Send; the QR image can be attached after downloading.

## Important frontend-only limitation

This is a frontend prototype. WhatsApp is not sent automatically by the website. The current `wa.me` action only opens WhatsApp with pre-filled text. Automated delivery from the SportiLand business account needs a server-side integration with the WhatsApp Business Platform and an approved message template.

The QR currently contains a `SPORTILAND_BOOKING_PASS` JSON payload with booking facts and a random token. It is useful for demonstrating the customer and owner screens, but it is not cryptographically signed and is not proof of payment or a trustworthy booking record. A production system should put only an opaque, random booking-pass token in the QR and validate it with the server before check-in.

Install dependencies and run:

```bash
npm install
npm run dev
```


### Local customer test access
Use **Continue as demo customer** in the sign-in dialog to bypass backend authentication for UI testing. The demo customer is saved locally in this browser and can complete the simulated booking flow to display a QR pass. This is not production authentication or server-side booking verification.
