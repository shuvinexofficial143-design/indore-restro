# Development status
Updated: 2026-11-26
Current phase: 1 — public site source implemented; verification and deployment incomplete.
Phase 0 verified in CI run 45809312810: lint, four unit tests, build, typecheck, HTTP smoke.
Phase 1: premium responsive home, sample menu with ten dishes and interactive search/category/veg filters, reservation/event local previews (not submitted), gallery, concept offer, footer, photo credits and mobile navigation. Licensed illustrative Unsplash photography via Next Image optimization. No fake reviews, phone numbers, bookings or orders.
CI: browser verification now covers five viewport widths, five routes, overflow, menu interactions, reservation preview, and browser errors. The lockfile job commits the artifact only if the tested source remains main HEAD. Results pending.
Deployment BLOCKED: Vercel refused creation of indore-restro in Avanti Verse with HTTP 403. No verified deployment URL. Project owner must import this repository into Vercel or grant project creation access. No paid service activated.
Pending: CI results, Vercel deployment, image load/visual QA, genuine owner-configured contact/location/branding, order and reservation backend at planned phases. Neon/auth Phase 2.
NEXT: finish Phase 1 verification/deployment, then Phase 2 Neon, ORM, migrations, authentication, roles and basic admin layout.
