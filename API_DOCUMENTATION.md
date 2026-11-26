# Restaurant demo API
All monetary values are integer INR paise. This application is fictional. Runtime access is gated by tenant and server-side permissions. Public mutations require matching Origin/Host and JSON; the Cashfree webhook instead requires provider HMAC over the exact raw body.
| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | Process status and database configuration status |
| POST | /api/orders | Create idempotent fictional order; 64-hex token, kind, lines with id/variant/addon/quantity; optional table token, coupon, saved address and instructions |
| GET | /api/orders/[token] | Track one demo order by unguessable token; rejects revoked/expired tenant |
| POST | /api/table-requests | Request waiter or bill against valid table token |
| POST | /api/bookings | Fictional reservation or event; token, date/time in Asia/Kolkata, guests, occasion; optional budget |
| GET | /admin/reports/export?period=today | Owner/manager-only CSV; today/week/month |
| POST | /api/payments/cashfree/checkout | Disabled-by-default, authenticated base-demo staff sandbox checkout; invoice ID only |
| POST | /api/payments/cashfree/webhook | Disabled-by-default, signed sandbox callback; verifies Get Order independently |
Staff and customer pages use server actions for login, catalog, orders, inventory, pricing, reservations and website edits. They are not stable public REST endpoints. No payment or order is accepted for a real restaurant. No external integration credentials appear in repository.
