# 2026 Firebase migration report

> Historical report for the original migration. Current Google-only access and community navigation are described in [access-structure.md](access-structure.md).

- Preserved source: `legacy/index.html`; fixture: `data/placements-2026.json`; baseline: `legacy-baseline.json`.
- Baseline: 100 announcements, 311 selections, 299 unique students, 82 companies, five branches, 99 announcements with numeric CTC, latest confirmed source counter 310.
- Firebase replaces the historical Express/Mongo serving implementation. Existing external Mongo data has not been deleted.
- Scope: original dashboard plus optional Firebase Auth. Additional batches, community, outreach, and hosted deployment remain deferred.

## Behavior

- Preserves overview, searchable/sortable companies, announcement/candidate details, branches, candidate/role search, timeline, insights, styling, hash links, attribution, and analytics configuration.
- Retains original calculations, independently tested against legacy code, and all source anomalies including Barclays/KPMG/HSBC notes.
- Separates calculated timeline totals from source counters, offers all candidate rows through pagination, and adds schema/checksum validation and loading/error/retry states.
- Optional Google/email sign-in, verification, reset, and sign-out use Firebase Auth.
- Trusted imports preserve private originals and publish immutable snapshots. Browser rules prevent private import reads and statistics writes.
- No Express or statistics Function serves the dashboard.

## Verification

- TypeScript, 12 unit/publication checks, production build, and zero-vulnerability dependency audit pass.
- All 31 automated checks pass: 12 unit/publication checks, seven import/security-rules checks, and 12 desktop/mobile browser checks including search/filter/navigation, retry recovery, account creation, persisted sign-in, and sign-out. Integration tests use an isolated demo project, not the real cloud database.
- After IAM correction, live rules publication, cloud import, and complete record/metadata/chunk/metric verification succeeded in `placement-stats-kjsce`.
- All dashboard routes passed live desktop/mobile browser checks; screenshots were reviewed. No browser exceptions, Express requests, or horizontal overflow were detected.
- Real Firebase email/password sign-in, persisted session after reload, sign-out, and signed-out dashboard browsing passed. Temporary test account was deleted. Google provider is enabled; the owner's interactive Google sign-in and real email delivery checks remain manual.
- Original PDFs are unavailable; anomalies remain documented rather than guessed.
- GitHub/Vercel and hosted deployment remain deferred.
