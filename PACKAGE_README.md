# SportiLand — Customer Web V7

This is the standalone Customer website. It uses SportiLand's existing green, lime, white and charcoal palette. It is separate from the Owner frontend.

## V7 experience updates

- Continuous What's On marquee made from individual event/sport cards. It loops smoothly, pauses while hovered/focused, and every card remains clickable.
- Announcement clicks open the correct event or sport page, then smoothly scroll to the corresponding event/venue section.
- Venue directory initially displays 9 listings and adds 9 more each time `Show more venues` is pressed.
- The only venue search/filter area is the `Find a place to play` directory section (the duplicate hero search block is not used).
- Dedicated Shop page with a 12-item demo equipment catalogue, category filters, product search, cart quantity controls, demo checkout form and local order history.
- Homepage Shop Essentials promotional callout and desktop/mobile Shop navigation.

## Run alongside the original apps

```bash
npm install
npm run dev
```

Open `http://localhost:5176`. To test on another device on the same Wi-Fi, use `http://<computer-LAN-IP>:5176`.

## Important prototype notes

- Venue records: 49 Madurai-area entries.
- Shop products and displayed prices are samples. Cart/order state is saved in this browser only. No payment is collected and no delivery is created.
- Customer sign-in is requested for protected actions such as booking/account pages and Shop checkout; public venue browsing stays guest-first.
- Customer booking requests, tournament registrations and some event bookings remain demo/local unless connected to real APIs or external organisers.
- Owner-published games and media can sync only while the shared Spring Boot backend is running and configured.

See `SHOP_BACKEND_HANDOFF.md` and `VERCEL_DEPLOYMENT.md` before integrating real commerce or deploying the frontend for public use.
