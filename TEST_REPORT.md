# Test report — 2026-11-26
Phase 0 verified on source commit a07d14ac7884e30bb2f5951d7b441f738fda53a6.
CI: https://github.com/shuvinexofficial143-design/indore-restro/actions/runs/45809312810

| Check | Result |
|---|---|
| GitHub read/write and main push | Pass |
| npm install (CI) | Pass |
| ESLint | Pass |
| Unit tests: order lifecycle, order type, terminal states, integer paise | 4/4 pass, local and CI |
| Next.js production build | Pass |
| TypeScript typecheck | Pass |
| HTTP smoke: / and /api/health | Pass |
| Lockfile artifact upload | Pass; not yet committed |
| Browser visual/responsive QA | Not run |
| DB, auth, orders, QR, reservations, billing, demo isolation | Not implemented/tested |
| Vercel production deployment | Not performed |

No failures in executed CI steps. Local npm DNS was unavailable; CI installed dependencies successfully. No live deployment or complete restaurant functionality claimed. The next docs-only commit records results without modifying tested application source.
