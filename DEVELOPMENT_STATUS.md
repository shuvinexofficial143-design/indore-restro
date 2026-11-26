# Development status
Updated: 2026-11-26
Current phase: 1 — source and production build verified, deployment and browser QA incomplete.
Phase 0: verified CI run 45809312810. Phase 1 production build, lint, typecheck, unit tests and HTTP smoke passed on runs 45810931405 and 45815642054. Original browser install failed because ubuntu-latest resolved to Ubuntu 26.04; pinned Ubuntu 24.04 and browser install passed. Browser run then failed at reservation Time label; explicit accessible labels added. Re-run pending. Lockfile capture pending successful browser CI.
Vercel project creation blocked by 403; no project found in Avanti Verse, no verified deployment URL. Import the repo in Vercel manually. No paid services activated.
Phase 2 draft on feature/phase-2-auth (PR #1, source commit d529b47): Drizzle schema, SQL migration, secure owner bootstrap, staff login with scrypt, opaque hashed DB sessions, role-gated admin/staff, integration test CI. Neon list_organizations/list_projects/search returned Tool not found; no live project, credentials or migration applied. Phase 2 not merged or verified.
NEXT: verify Phase 1 browser/lockfile and deploy if access is restored, verify Phase 2 draft CI and dedicated Neon setup before merge. Do not claim working auth until actual database integration tested.
