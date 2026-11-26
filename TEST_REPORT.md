# Test report — 2026-11-26
Verified source c198f9f75eba86d0aa4cefd47a2e12e184343e5e:
- Application CI 45823050806: SUCCESS — lint, unit tests, production build, typecheck, HTTP smoke and Chromium checks at 375/390/430/768/1440px.
- Database CI 45823050698: SUCCESS — temporary PostgreSQL 17 with repeated migration execution, staff login/session security/role denial/disabled users, QR cart/idempotency/out-of-stock checks, owner→kitchen→waiter→tracking and inventory consumption, combined invoice/manual payment/receipt, reservation conflict, separate demo tenant/role/revocation, customer account/address/history/logout, coupon caps/usage/tax snapshot.
- Gateway foundation and dynamic menu changes after this verified source: fresh CI required. No external Cashfree API or real payment tested.
- No live Neon/Vercel deployment or exhaustive security/visual audit verified.
