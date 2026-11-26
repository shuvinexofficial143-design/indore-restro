# The Royal Table — Shuvi 360
Fictional restaurant management demonstration for Indore, India. Mobile-first web/PWA, not a native APK or a production restaurant. 44 fictional sample dishes.
## Run locally
Node 22.13+ and npm. Install with `npm ci`; copy .env.example to .env.local for Next.js server settings (do not commit credentials). Run `npm run dev` and open http://localhost:3000. The public preview works without a database.
For a private, dedicated PostgreSQL demo database, export DATABASE_URL_UNPOOLED, DATABASE_URL and private BOOTSTRAP_OWNER_EMAIL / BOOTSTRAP_OWNER_PASSWORD in the process environment before running:
- `npm run db:migrate` — checksum-verified versioned migrations.
- `npm run db:seed` — one-time fictional restaurant and owner; refuses overwrite.
- `npm run db:seed-menu` — insert missing fictional dishes.
Use `ENABLE_DEMO_ORDERS=1` only for the dedicated demo database. Set APP_URL to the actual HTTPS origin for deployment. Isolated invite demos require ENABLE_ISOLATED_DEMO and DEMO_ACCESS_CODE; keep disabled until reviewed. Cashfree sandbox is disabled by default; never use production credentials.
## Interfaces
- Public: /, /menu, /reserve, /events
- Customer: /app, /cart, /checkout, /account, /orders, /track/[token], /table/[token]
- Staff: /login, /staff, /admin, /kitchen, /waiter
- Admin: orders and manual orders, billing, tables, reservations, menu, pricing, inventory, staff, customers, website, audit and reports
- Demo: /demo and /assistant (rule-based catalog assistant)
## Checks
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. GitHub Actions uses Chromium and temporary PostgreSQL 17 for browser and transaction integration tests. See TEST_REPORT.md for verified commits and latest pending changes.
## Architecture
Next.js App Router, React, TypeScript, Tailwind CSS, Zod, Drizzle ORM and PostgreSQL. Server-side RBAC and restaurant scoping, hashed session/QR tokens, transactional order/payment/inventory operations, INR integer paise, Asia/Kolkata report ranges.
Read PROJECT_SPEC.md, DATABASE_SCHEMA.md, DEVELOPMENT_STATUS.md, CLIENT_DEMO_GUIDE.md, API_DOCUMENTATION.md, CASHFREE_SANDBOX.md and AI_INTEGRATION.md. Live deployment, payment provider exercise and production security/privacy/media review remain outstanding.
