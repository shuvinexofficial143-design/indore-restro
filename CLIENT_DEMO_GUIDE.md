# Client demo guide
The Royal Table is a fictional Indore restaurant. Use a dedicated test database only.
1. Install dependencies with npm ci; configure DATABASE_URL and DATABASE_URL_UNPOOLED privately. Run npm run db:migrate, configure owner bootstrap credentials and run npm run db:seed followed by npm run db:seed-menu.
2. Start npm run dev; use / for public site and /app for catalog. Shared demo ordering is disabled unless ENABLE_DEMO_ORDERS=1.
3. For isolated demos, set ENABLE_ISOLATED_DEMO=1 and a long private DEMO_ACCESS_CODE; visit /demo, enter the code, switch between roles within the same demo tenant. Session expiry is two hours. Do not share owner bootstrap credentials.
4. As owner open /admin/tables, create a table and session, open its QR menu. Place fictional dishes, then process the order in admin/kitchen/waiter views. Close the session after completing orders and generate a combined invoice. Record a fictional payment; inspect the sales report.
5. Try menu editing, inventory purchase/recipe setup, sample reservation, customer account and coupon. Never enter real guest information; customer demo emails end in example.invalid.
6. Revoke demo access when finished. Old order/table tokens are no longer usable after tenant revocation. Revocation does not erase historical test records. A separately authorized cleanup policy is needed.
Cashfree is sandbox-only and disabled by default. Actual sandbox credentials and gateway exercise have not been verified. Do not use production payment credentials. See CASHFREE_SANDBOX.md.
