# Development status — 2026-11-26
Draft PR #1: feature/phase-2-auth. Main remains the stable website. No live deployment or production service.
## Implemented on development branch
- Public responsive website, managed menu, 44 sample dishes, reservations and events; database website editor.
- PostgreSQL authentication, owner/manager/kitchen/waiter/cashier roles, isolated invite-only demos with expiry/revocation.
- Customer account, fictional saved addresses, order history, favorites and consented private feedback; customer directory.
- QR table ordering, server-side prices, idempotency, tracking, waiter/bill calls, manual counter order entry.
- Kitchen item/order readiness, opt-in sound, elapsed time, waiter service; table floor/cleaning/status, QR regeneration, session transfer and waiter reassignment.
- Combined invoices and receipt, fictional cash/UPI/card records, coupons/tax, reservation collision checks and lifecycle.
- Stock and recipe consumption, suppliers, purchase costs, inventory history; menu bulk availability, sorting, specials.
- Database reports with custom IST date ranges, order/table/reservation/inventory breakdown, CSV. Transactional audit records for selected admin actions.
- PWA manifest/icons/offline fallback, deterministic menu assistant (not an external AI service).
- Disabled-by-default Cashfree sandbox code; provider exercise is not verified.
## Verification
Core plus extended admin/customer integration passed at c5d3fa4: application https://github.com/shuvinexofficial143-design/indore-restro/actions/runs/45824890432 and database https://github.com/shuvinexofficial143-design/indore-restro/actions/runs/45824890524.
Application checks passed for the subsequent item-ready and transfer/report code at ce2abfd: https://github.com/shuvinexofficial143-design/indore-restro/actions/runs/45825289106. The first newer integration run reached six passed scripts then failed at an ambiguous menu-test selector. Corrected selectors and expanded transfer/manual-order/audit/item-ready tests at 0388b03. Fresh test status: see GitHub Actions; no claim that the newest changes have passed until results are recorded.
## Still outstanding
Neon live database access unavailable; Vercel project creation returned 403. Cashfree sandbox credentials, external provider exercise/refunds/reconciliation remain unverified; no real payments. Complete licensed dish photos, Hindi UI localization, expanded media/contact/social editor, reservation calendar and event requirement notes, external AI/messaging/calling, production security/accessibility/performance, compliance and deployment review are not fully delivered. Keep opt-in modes disabled until reviewed.
