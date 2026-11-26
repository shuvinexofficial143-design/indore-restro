# Test report — 2026-11-26
Phase 0 CI 45809312810 passed.
Phase 1 CI 45810931405 passed dependency install, lint, four unit tests, build, typecheck, homepage/health smoke.
CI 45811061123: browser install failed (Ubuntu 26.04 unsupported).
CI 45815642054: same build checks passed and Chromium installed on Ubuntu 24.04. Browser verification failed at Time dropdown accessible label. Added explicit labels; repeat CI pending. Lockfile job skipped due browser failure.
Phase 2 draft CI pending; live Neon and Vercel not configured. No successful end-to-end DB or auth claims.
