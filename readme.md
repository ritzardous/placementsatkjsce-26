# Placement Stats KJSCE

Original 2026 dashboard migrated to React + TypeScript, cloud Firebase Authentication, and Cloud Firestore. Public statistics require no login or Express server.

Preserves overview, company/branch views, candidate search, timeline, insights, source notes, styling, and hash navigation. Baseline: 100 announcements, 311 selections, 299 unique students, 82 companies. Source counters remain separate from calculated totals.

Follow [4amchanges.md](4amchanges.md) for cloud permissions, import, React startup, and testing. Use `npm install`, configure `.env` from `.env.example`, publish rules, seed/verify, then `npm run dev`.

```powershell
npm test
npm run build
npm audit
```

`npm run test:firebase` uses isolated test-only emulators, Java 21, and Chromium. These are not required for normal cloud runtime. Private service-account files stay outside Git and the frontend.

AY 2024–25 (class of 2025) is also available through the year selector: 360 report selections, 323 students, with on/off-campus status and matched email dates/roles. Read [the source audit and missing-data checklist](docs/2025-data-audit.md). `npm run data:build-2025` reproduces the dataset from committed source transcriptions; import/verify commands accept `--year 2025` (default remains 2026).

Follow [the deployment guide](<deployment guide.md>) to publish this React + Firebase app through GitHub and a new Vercel project. Deployment has not been performed yet. 2027 data and community features are deferred. See [architecture](docs/architecture.md), [operations](docs/operations.md), [migration report](docs/migration-report.md), and [future plan](plan.md).
