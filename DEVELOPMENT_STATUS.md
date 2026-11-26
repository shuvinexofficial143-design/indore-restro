# Development status — 2026-11-26
Branch feature/phase-2-auth, draft PR #1. Main remains unchanged. This is a fictional restaurant demonstration, not a production-ready business service.

## Implemented
- Responsive public restaurant website, menu search and diet/category filters, reservations and event previews; database-driven demo menu and website editor.
- PostgreSQL migrations, hashed staff sessions and role restrictions; tenant-scoped admin, kitchen, waiter and cashier interfaces.
- 44-dish sample catalog, customer cart, server-side price/availability validation, idempotent ordering and tracking, dine-in QR sessions and waiter/bill requests.
- Order transitions, combined invoices, manual fictional cash/UPI/card records, receipt printing, table reservations with collision checks, event bookings.
- Admin menu editing, staff management, sales summaries/CSV, inventory recipes, stock movements, coupons and fictional tax snapshots.
- Optional isolated invitation demos, two-hour expiry and revocation, separate tenants, role switching, order/booking caps. Demo customer accounts and sample saved addresses/order history.
- Installable PWA foundation, offline fallback and rule-based catalog assistant (not external AI).
- Disabled-by-default Cashfree sandbox checkout/webhook foundation, separate from manual demo payments.

## Verification
Both application and database CI passed at c198f9f: https://github.com/shuvinexofficial143-design/indore-restro/actions/runs/45823050806 and https://github.com/shuvinexofficial143-design/indore-restro/actions/runs/45823050698. All six integration scripts passed, including tenant isolation, customer accounts, coupon/tax and full QR/kitchen/waiter/invoice path. Subsequent sandbox and dynamic menu changes require their own CI results.
## Remaining
Live Neon connector unavailable; Vercel project creation previously forbidden (403); no deployed URL or live DB verified. Cashfree sandbox credentials, API exercise and gateway recovery/refunds not verified. Real business contact/address, complete licensed dish images, GST/invoicing compliance, production operational/security review, external AI and messaging integrations remain outstanding. No paid service activated. Do not enable public ordering or demo provisioning on a real tenant without review.
