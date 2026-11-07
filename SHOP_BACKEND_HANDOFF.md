# FieldFinder Shop — backend handoff notes

## Current frontend behaviour

The Shop page is available from the desktop navigation, mobile menu, footer and homepage Shop Essentials callout.

It currently includes 12 sample products across Cricket, Football, Badminton, Pickleball, Boxing and Training. Customers can:

- Search the catalogue and filter by category.
- Add products to the cart, change quantities (frontend cap: 20 per SKU) and remove items.
- Review subtotal and an indicative total.
- Continue to checkout after customer sign-in/registration.
- Enter name, phone, delivery address, city and PIN code.
- Select a demo payment preference and save a local demo order.
- See recent demo orders in the Shop page.

All catalogue details and cart/order state are frontend prototype data. No live inventory, payment, shipping or fulfilment exists yet.

## Suggested API contract for backend integration

The backend developer can align endpoint names to the existing Spring conventions. Recommended contracts:

### Catalogue

`GET /api/store/products?category=&q=`

Returns active products with server-owned `id`, `sku`, `name`, `description`, `category`, `price`, `compareAtPrice`, `imageUrls`, `stockQuantity`, `isActive` and optional `badge`.

### Cart / checkout

Either persist cart records server-side or submit a checkout request:

`POST /api/store/orders`

Example request:

```json
{
  "items": [
    { "productId": "cricket-bat-pro", "quantity": 1 },
    { "productId": "cricket-tennis-ball", "quantity": 2 }
  ],
  "delivery": {
    "recipientName": "Customer Name",
    "phone": "+91XXXXXXXXXX",
    "addressLine": "Delivery address",
    "city": "Madurai",
    "pincode": "625001"
  },
  "paymentMethod": "COD"
}
```

The server must authenticate the customer, read product prices from the database (never trust prices from the browser), validate stock and delivery serviceability, calculate taxes/shipping, reserve inventory transactionally, and return an order ID and payment/fulfilment status.

### Customer order history

`GET /api/store/orders/me`

Returns only the authenticated customer's orders, line items, totals, payment state, delivery state and timestamps.

### Payment integration

For online payments, create the payment order on the server and verify the gateway callback/webhook server-side before marking the order paid. Do not trust a client-side success flag. Use idempotency for checkout retries and gateway callbacks.

## Production checks

- Store stock and price in the database; revalidate at order submission.
- Prevent overselling with transaction/locking or atomic stock decrement.
- Validate and normalize phone/address/PIN server-side.
- Enforce customer ownership on order read/cancel routes.
- Use HTTPS, secure session cookies/JWT controls, CSRF protection where applicable, rate limits and request validation.
- Add an admin/owner product-management path before treating the catalogue as live.
- Connect shipment tracking, refunds, cancellation policy, tax invoice generation and customer notifications.

The current Shop is a functional frontend prototype only; these server-side controls are required before real sales.
