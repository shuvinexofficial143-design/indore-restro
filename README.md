# The Royal Table — Shuvi 360
Fictional restaurant management system for live client demonstrations in Indore, India. Mobile-first web/PWA, not a native APK.

## Development
Node 22.13+ and npm. Run `npm install`, `npm run dev`, then open http://localhost:3000.
Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
Dependency ranges are provisional until a successful install generates a reviewed lockfile. Commit that lockfile before production.

## Architecture
Next.js App Router, React, TypeScript, Tailwind CSS, Zod. Drizzle ORM + Neon PostgreSQL planned for Phase 2; Auth.js planned subject to compatibility. Server-side role and restaurant isolation. Vercel planned in Phase 1. Cashfree sandbox in Phase 7 only. Asia/Kolkata and INR; integer paise. Reliable polling for live operational data before introducing realtime services.
`src/app` routes, `src/lib` domain modules, `tests` tests. No database or payments are connected in Phase 0.
See PROJECT_SPEC.md, DATABASE_SCHEMA.md, DEVELOPMENT_STATUS.md, TEST_REPORT.md and .env.example.
