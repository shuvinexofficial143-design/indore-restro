# Database architecture plan (Phase 0, not migrated)
Choose Drizzle ORM with Neon PostgreSQL. Version migrations in Phase 2+; no production data or connection exists yet. UUID primary keys; timestamptz created_at/updated_at; currency amounts integer paise (bigint, safe conversion at API edge), quantities validated. Each tenant-owned row includes restaurant_id; compound unique (restaurant_id,id) and tenant-scoped foreign keys, indexes for tenant/status/date. Demo tenants have explicit isolation and TTL, never share production credentials.

| Phase | Entities and relationships |
|---|---|
| 2 | restaurants -> restaurant_settings, users (identity), roles, permissions, staff (tenant user/role), customers, customer_addresses |
| 3 | menu_categories -> menu_items -> menu_variants, menu_addons; media_assets |
| 4 | orders -> order_items, order_status_history; snapshot price/name/variant/addons; unique restaurant + idempotency key |
| 5 | restaurant_tables -> table_qr_codes (hashed token, revoked/expiry), table_sessions (one active per table); orders reference session |
| 6 | kitchen_tickets, waiter_requests, notifications; restaurant-scoped staff/table assignment |
| 7 | invoices, payments, payment_events (unique gateway event), coupons, coupon_usage |
| 8 | reservations, event_bookings |
| 9 | website_content, audit_logs |
| 10 | inventory_items, inventory_transactions, recipes, suppliers |
| 12 | demo_sessions (isolated restaurant, expiry) |

Transactions: lock menu availability and price during checkout; enforce idempotency; lock table/session on mutation; only authorized transition events; invoice totals from immutable line snapshots; payment events unique and verified; reservation overlaps use exclusion constraint or serialized per-table transactions; inventory deduction unique per order/recipe movement. All tenant queries server-scoped; RLS defense in depth with constrained DB role evaluated in Phase 2. Demo reset scoped to explicit demo tenant only. No schema has been applied.
