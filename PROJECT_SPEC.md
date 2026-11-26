# Shuvi 360 restaurant project — implementation checklist
The Royal Table is fictional. Target: Indore. English primary, Hindi secondary, INR, Asia/Kolkata. This is a condensed implementation reference to the master specification supplied 2026-11-26, not a claim that all requirements are built.

## Interfaces
Public /, /menu, /reserve, /events; customer /app, /cart, /checkout, /orders, /track, /table/[token]; auth /login; owner /admin; kitchen /kitchen; waiter /waiter; demo /demo.
Premium black/cream/gold design with licensed food photography, responsive layouts 375/390/430/768px and desktop, accessible dialogs, loading/error/empty states, bottom navigation, sticky cart, safe areas. No fictitious ratings presented as real.

## End-to-end
QR -> active table session -> guest menu -> order -> owner accepts -> kitchen prepares -> waiter serves -> bill request -> invoice -> verified/recorded payment -> sales report. Multiple orders per session; secure tokens, expiry, waiter calls, additional orders, QR PNG/print/regenerate/deactivate. Dine-in/takeaway/delivery. Order history, idempotency, backend prices/tax/discounts and historical snapshots. Customer app search/filter, categories, 40–50 labelled demo dishes, variants/add-ons/half/full, cooking instructions, cart, login, addresses/history. Staff manual orders and table transfers, cleaning/reserved/occupied statuses.

## Admin
Live order and sales metrics from real DB; menu CRUD, images, bulk availability, sort, best seller, specials, variants/add-ons; tables/capacity/floor/session/waiter/bill; staff roles owner/manager/kitchen/waiter/cashier with server-enforced permissions; kitchen item/order ready, elapsed times, opt-in sound; waiter assigned tables, customer requests, served/payment collection; customers/history/spend/favorites/feedback with privacy and consent.
Reservations with capacity, conflict-safe time slots, calendar, assign/confirm/reject/check-in/no-show; events enquiry only with type/date/time/guest count/budget/requirements. Billing itemized receipt/PDF, tax, coupons, discounts, cash/manual UPI/card; Cashfree sandbox verified server-side with signed idempotent webhooks/refunds/reconciliation; no real charges without approval. Coupons limits/date/items/minimum/max discount. Reports daily/weekly/monthly/custom, revenue/payment/order/table/dish/reservation/inventory, CSV/print. Website editor brand/logo/banner/colors/contact/hours/maps/social/gallery/offers/sections. Inventory raw materials/units/suppliers/purchases/recipes/waste/stock history and exactly-once deduction.

## PWA, AI and demo
Installable app, icons, service worker, safe public-menu cache/offline fallback and update handling; no sensitive offline data or fake success. AI grounded in actual restaurant data, confirmation and backend validation for orders/bookings; Instagram, WhatsApp, calling only with approved credentials and permissions, otherwise labelled simulations. Demo center links to all interfaces, isolated session tenant, QR/order/kitchen/waiter/bill/sales demo, safe reset, never expose production admin credentials.
Security: RBAC, restaurant scope, validation, SQLi/XSS/CSRF defenses, rate limiting, secure cookies/uploads, verified webhooks, audit, no secrets, no cross-tenant access. Paid/destructive actions require approval.

## Roadmap
0 foundation; 1 premium public website + initial Vercel deployment; 2 Neon/ORM/auth/roles; 3 customer app; 4 ordering; 5 QR/table sessions; 6 kitchen/waiter; 7 billing/payments; 8 reservations/events; 9 advanced admin/reports/editor; 10 inventory; 11 PWA/AI; 12 isolated demo/security/accessibility/performance/full production verification.
NEXT: inspect latest branch/tracker, verify previous work, implement next incomplete phase, test/build, commit/push, update tracker and test report; no fake success.
