# PostgreSQL architecture — implementation
The Drizzle schema is src/lib/db/schema.ts. Ordered SQL migrations live in migrations/ (0001–0015). The migration runner uses one advisory lock, transactional execution and a recorded SHA-256 checksum; it refuses altered applied migrations. Dedicated test PostgreSQL only; live Neon has not been verified.
| Migration | Domain |
|---|---|
| 0001 | restaurants, settings, users, staff, sessions, authentication |
| 0002 | menu and orders, order line price snapshots, status history |
| 0003 | restaurant tables, hashed QR sessions, waiter requests |
| 0004 | invoices, invoice-order links, fictional manual payments |
| 0005 | reservations and event enquiries |
| 0006 | inventory items, recipes, stock transaction history |
| 0007 | website content |
| 0008 | isolated demo sessions and role boundaries |
| 0009 | coupon limits, coupon use, tax and discount snapshots |
| 0010 | fictional customer accounts, saved addresses, order ownership |
| 0011 | Cashfree sandbox gateway records |
| 0012 | table operations, suppliers and purchase costs |
| 0013 | favorites and private consented customer feedback |
| 0014 | menu sort/specials and per-item kitchen readiness |
| 0015 | tenant-scoped admin audit history |
## Integrity
Tenant-owned operations explicitly scope restaurant_id; compound keys and foreign keys guard references where defined. Server role checks precede protected actions. Order pricing is computed from current database prices and saved in immutable snapshots; order retry keys prevent duplicate creation. Table sessions use expiring hashed tokens; rotation/transfer invalidates the old token. Table reservation overlap checks serialize mutations. Invoice creation is transactional and repeat-safe, inventory consumption is recorded once per order, and payments are fictional unless a separately configured sandbox is used.
Admin audit logs for menu changes, website edits, staff access and table transfers are written in the same transaction as their corresponding mutation. No credentials or token values are recorded. This is not an exhaustive compliance audit or a claim of database-level RLS; production hardening, backup and retention review remain required.
