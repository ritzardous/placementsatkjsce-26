# React + Firebase migration: setup and testing

- Scope: original 2026 dashboard in React, with real cloud Firestore and Firebase Authentication. GitHub/Vercel, extra batches, and community features are deferred.
- The React development server runs on your laptop. Data and authentication run in Firebase. No local Express server, MongoDB, Functions, or database emulator is required to use the app.
- Project: `placement-stats-kjsce`. Supplied public web configuration is already in ignored `.env`. `GOOGLE_APPLICATION_CREDENTIALS` points to the private JSON in Downloads, outside the repository.
- Never put a private key into `VITE_*`: those variables become browser-visible. Public Firebase web configuration is expected to be browser-visible; security rules protect data.

## 1. Finish cloud setup

1. Firebase Console → Firestore Database: create the **default** database using Standard edition if absent. Choose the region carefully. Start in production mode; publish the repository rules below.
2. Authentication → Sign-in method: enable **Email/Password** and **Google**, selecting a support email for Google.
3. Authentication → Settings → Authorized domains: add `localhost` and `127.0.0.1` if absent. Add the deployed hostname later. Browsing statistics requires no account.
4. Google Cloud Console → same project → IAM & Admin → IAM: find the principal matching the JSON's `client_email`. Grant **Cloud Datastore User** (`roles/datastore.user`) for import and **Firebase Rules Admin** (`roles/firebaserules.admin`) for rules. CLI deployment additionally needs **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`). Do not send the private key in chat. Allow time for IAM propagation.
5. If an operation reports a disabled API, enable that reported API for this project. The app uses Firestore, Firebase Auth, and Firebase Rules.

## 2. Publish and verify cloud data

Run from the repository folder with Node.js 22.12 or newer:

```powershell
npm install
npm run db:seed -- --dry-run
npm run db:rules -- --project placement-stats-kjsce --allow-production
npm run db:seed -- --project placement-stats-kjsce --allow-production
npm run db:verify -- --project placement-stats-kjsce --allow-production
```

- Rules publication uses the Admin SDK, backs up existing rules in ignored `artifacts/rules-backups`, and verifies the active rules. No Firebase CLI login is required for this command.
- Import preserves private originals, stages checksummed public chunks, verifies every field, and activates the snapshot. Identical imports are safe to repeat. Changed records or a conflicting active version fail rather than being overwritten.
- Expected: **100 announcements, 311 selections, 299 unique students, 82 companies**. Source-reported cumulative counter **310** remains separate from calculated selections.
- Firestore should show `batches/2026`, a version with four public chunks, and a private `imports` snapshot. Browser writes to published statistics and reads of private originals are denied.
- The dashboard uses document reads and needs no composite index. Index exemptions in `firestore.indexes.json` can be deployed later through the authenticated CLI.

## 3. Run and manually test

```powershell
npm run dev
```

Open http://localhost:5173 and keep the terminal running.

1. Overview: confirm counts above, highest CTC **54.88 LPA**, average approximately **9.31 LPA**, median **8 LPA**.
2. Companies: search/sort, open Barclays, inspect history, candidates, roles, compensation, and source notes.
3. Branches: compare branches, open detail, check links and filters.
4. Candidates: search by name/roll/company/role, paginate, clear filters; all 311 selections must be reachable.
5. Timeline/insights: distinguish source counters from calculated selections and unique students.
6. Refresh company and branch hash URLs, test Back/Forward, repeat at mobile width.
7. Auth: sign up with your real test email, verify email, sign out/in, reset password, and test Google. These create real Firebase accounts. Also confirm signed-out browsing works.
8. Disconnect network and reload: check error and Retry. Reconnect and retry.
9. DevTools Network: confirm Firebase requests and no Express `/api/v1` or port 3001 requests.

Optional browser smoke check while dev server runs:

```powershell
npx playwright install chromium
node scripts/preview.mjs
```

Screenshots go to ignored `artifacts/`. This check needs the cloud import and rules working.

## 4. Automated checks

```powershell
npm test
npm run build
npm audit
```

- Unit checks compare metrics against preserved legacy code and validate publication chunks.
- `npm run test:firebase` runs isolated import, rules, and desktop/mobile browser integration tests with **test-only** emulators and a `demo-` project. It requires Java 21, Playwright Chromium, and free port 5173. This infrastructure is not the application's data source or a prerequisite for using cloud Firebase. CI is prepared for future GitHub setup.
- Normal `.env` has `VITE_USE_FIREBASE_EMULATORS=false`. Never substitute a real project for the isolated demo project.

## Troubleshooting

- Import **missing/insufficient permissions**: correct the service account's IAM roles in the correct project. Opening browser rules cannot fix trusted Admin permission failures.
- Dashboard **permission-denied**: ensure rules publication succeeded and an active snapshot exists. Do not enable blanket public writes.
- **Database not found**: create the default Firestore database.
- Auth **operation-not-allowed**: enable the provider. **Unauthorized-domain**: add the browser hostname to Auth authorized domains.
- **Port 5173 in use**: close the previous dev-server terminal.
- Firebase CLI **401**: use `db:rules` for rules; configure CLI login for future index/hosting deployments separately.

## Current live-project status

- React, Firebase configuration, trusted import/verification, security rules, optional Auth, and original dashboard routes are implemented.
- TypeScript, all 38 unit/import/rules/browser checks, production build, and zero-vulnerability dependency audit pass. Integration tests use an isolated demo project; separate live-cloud smoke checks verify real-project operation.
- IAM correction completed. Rules publication, cloud import, and full field/metric reconciliation succeeded against `placement-stats-kjsce`.
- Every dashboard route passed live-cloud browser checks at desktop and mobile widths, without exceptions, Express requests, or horizontal overflow. Screenshots were reviewed.
- Email/password sign-in was enabled and verified against cloud Auth, including persisted login after reload, sign-out, and signed-out statistics. The temporary test account was deleted. Google is enabled; complete an interactive Google login with your own account as part of the manual checklist.
- `localhost` and `127.0.0.1` are authorized for local Auth. Optional repeat cloud Auth smoke test: `npm run auth:verify -- --project placement-stats-kjsce --allow-production` while the dev server runs. It creates and deletes its own temporary account and sends no email.
- GitHub, Vercel, hosted deployment, and production login domains are deferred by request.

## 5. AY 2024–25 / class of 2025

- Use **Placement year** in the header, or open http://localhost:5173/#2025/overview. All company, branch, candidate, timeline, and insight links stay within the selected year. Original 2026 hash links continue to work.
- Verified baseline: 360 final-report selections, 323 unique students, 129 normalized employer groups, 331 on-campus and 29 off-campus rows. Highest CTC is 51.72 LPA including off-campus; selection-weighted mean is approximately 8.63 LPA and median 7.50 LPA over 353 known compensation rows.
- No registration total or source cumulative counter was supplied; placement rate and unplaced count remain unavailable. 77 selections are undated, 76 have no confirmed role, and seven have CTC marked ND. These are listed with report rows/pages in `docs/2025-data-audit.md`.
- Test switching to 2025, selecting Candidates & Roles, and using **Campus status**: Off campus yields 29 rows, On campus yields 331. Search within that filter, follow a company link, refresh, and verify the year persists. Switch back to 2026 and confirm 311 selections and 299 students.
- Check Barclays for conflicting report/email CTC, Google for the report's off-campus classification/PPO discrepancy, and Goldman Sachs for missing role/date. These disagreements/missing fields must remain visible.
- Timeline and monthly charts include only confirmed dates; the cumulative dated series reaches 283 selections rather than inventing dates for all 360. Overall report CTC metrics use selection weighting; legacy 2026 remains announcement-weighted, so year comparisons need that context.
- `npm run data:build-2025` regenerates the dataset from committed transcriptions. `db:seed` and `db:verify` accept `--year 2025`; omit the flag for 2026. Each year has its own immutable publication and activation manifest. Both are imported and verified in the cloud project.
