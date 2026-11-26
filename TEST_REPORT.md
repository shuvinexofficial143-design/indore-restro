# Test report — 2026-11-26
Phase 0: verified CI 45809312810.
Phase 1: final CI 45815965901 passed all automated checks, including browser interactions and no horizontal overflow at 375, 390, 430, 768, 1440 px. Verified dependency lockfile committed to main. No independent visual image QA or Vercel deployment.
Phase 2: isolated PostgreSQL 17 CI 45815915339 passed migration, repeat migration, bootstrap seed and production build, then failed browser invalid-login assertion. Fix commit 795cd45 pending CI 45816433911 (database/auth) and 45816433935 (application). No live Neon test, no production login claim.
