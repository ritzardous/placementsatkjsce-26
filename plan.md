# Placement Stats KJSCE — Firebase Migration and Community Archive Plan

- **Purpose:** Turn `placementstats2026kjsce` into a reliable, multi-batch placement dashboard and a community-maintained archive of company hiring experiences.
- **Audience:** The implementation agent building this repository, and the owner reviewing each milestone.
- **Execution rule:** Work through the phases in order. Complete and verify each phase before starting dependent work. Update this file's checkboxes and record decisions as implementation progresses.
- **Scope of this document:** Planning only. Do not interpret this file as authorization to contact students, connect personal accounts, scrape external services, or deploy to production.
- **Current architecture decision:** React + Vite, Firebase Authentication, and Cloud Firestore. Replace the MongoDB/Express serving path through a separately verified migration; retain the existing React UI and tested calculation logic.
- **Current implementation scope:** Migrate the existing 2026 dashboard to Firebase first. Additional batches, public account/contribution flows, and community features remain later phases.

## 1. Product goals and boundaries

- Preserve the value that already attracted campus usage:
  - Clean, fast, unbiased placement statistics.
  - Familiar navigation, visual style, filters, charts, and mobile experience.
  - Free browsing without requiring an account.
  - Clear explanations of data coverage, sources, uncertainty, and calculation methods.
- Support graduating batches **2025, 2026, and 2027**, with future batches added through configuration rather than code changes.
  - Graduation year and placement season are different fields: the 2026 batch includes announcements from 2025 and 2026.
  - Treat 2027 as ongoing; determine completeness of 2025 and 2026 from available sources rather than assuming they are final.
- Establish two distinct product areas:
  - **Placement Statistics:** Batch-specific results, candidates, compensation, companies, branches, and timelines.
  - **Company Processes:** Persistent company pages containing moderated firsthand experiences, organized by batch, role, and recruitment drive.
- Make repeated recruiters easy to research across years without presenting an old procedure as a guaranteed current procedure.
- Build a complete contribution loop:
  - A senior or student signs in, finds a company, writes an experience, submits it, receives review feedback, and sees the approved contribution published.
  - An admin can import placement data, resolve corrections, review insights, and maintain company identities.
- Use reported traction as motivation, not as a reason to overbuild:
  - Owner-reported baseline: 1K+ active users, 2.3K+ page views, and 31% returning users.
  - Keep infrastructure simple until measured demand justifies additional services.
- Defer from the first release:
  - Multi-college tenancy, social feeds, chat, job boards, referral marketplaces, and recommendation engines.
  - Public ratings of individual students or interviewers.
  - Automatic publication of scraped profiles or unreviewed experiences.
  - AI-generated hiring guides that silently substitute for firsthand contributions.

## 2. Existing repository findings

- The original application was a single HTML file containing CSS, embedded `RAW_DATA`, aggregation logic, routing, and rendering. It is preserved at `legacy/index.html`.
- The repository now contains the React/Firebase implementation: `src/`, `shared/`, trusted Admin SDK scripts, Firestore rules, and tests. The historical Express/MongoDB runtime and Vercel API function have been removed; existing external MongoDB data has not been deleted.
- `data/placements-2026.json` preserves the original dataset; `shared/statistics.ts` contains tested canonical calculations. Prefer migrating from this fixture and reconciling it against the existing MongoDB copy rather than making Firestore dependent on MongoDB at runtime.
- Existing routes use URL hashes:
  - `#overview`, `#companies`, `#company/<normalized_name>`.
  - `#branches`, `#branches/<branch>`, `#candidates`, `#timeline`, `#insights`.
- Existing capabilities include company and candidate search, company type and CTC filters, sorting, branch breakdowns, SVG charts, candidate rosters, and responsive layouts.
- Embedded metadata reports **100 announcements and 311 candidate selections**. These are migration reconciliation targets, not a count of unique students.
- Verified migration baseline: **299 unique students, 82 companies, and latest confirmed TPO counter 310**. Existing metric/API tests and desktop/mobile browser tests provide regression coverage.
- Existing records preserve company names, roles, candidates, roll numbers, result dates, CTC text and values, source-file/page references, correction notes, and college-wide cumulative counters.
- The sourced B.Tech registration denominator is **524** for the 2026 batch, now held in batch configuration. Do not reuse it for another batch.
- Important existing calculation behavior to audit:
  - Unique students are deduplicated by roll number.
  - Overview CTC averages use announcement values, while branch CTC averages use candidate selections; these weightings differ.
  - Some announcements contain multiple compensation bands or missing compensation.
  - The legacy HTML inferred missing timeline counters; the React migration already separates source-reported counters from calculated selections/unique students. Preserve this improvement in Firebase.
- Source PDFs are referenced by metadata but are not present in this checkout. Preserve those references and request source material when auditing requires it.
- The owner reports an earlier Vercel deployment. Current `vercel.json` serves a static React SPA; GitHub/Vercel setup and remote cutover are deferred by the latest request.

## 3. Agent workflow and implementation conventions

- [ ] Read applicable repository instructions and inspect Git status before editing.
- [ ] Preserve the original HTML and extracted dataset as migration reference artifacts; avoid overwriting the only source copy.
- [ ] Work in small, reviewable milestones and keep the dashboard usable throughout migration.
- [ ] Use TypeScript for React, shared validation/calculations, Firebase adapters, trusted Firebase Functions, and migration scripts.
- [ ] Resolve runtime versions and library APIs against official documentation at implementation time; pin dependencies and commit a lockfile.
- [ ] Maintain these supporting documents as work progresses:
  - `docs/architecture.md`: module boundaries and deployment choices.
  - `docs/data-dictionary.md`: field meanings and calculation definitions.
  - `docs/migration-report.md`: reconciliation results and unresolved anomalies.
  - `docs/moderation.md`: review rubric, anonymity, correction, and removal handling.
  - `docs/operations.md`: import, backup, restore, rollout, and rollback procedures.
- [ ] At each milestone, report what changed, checks performed, unresolved dependencies, and the next step.
- [ ] Never fabricate 2025/2027 records, candidate identities, missing CTC values, verified links, or company procedures.
- [ ] Build and verify local functionality while production credentials or source datasets are unavailable. Mark missing inputs explicitly rather than blocking unrelated work.

## 4. Target architecture

- Use **React + Firebase managed services**:
  - **React + Vite:** Retain the existing dashboard; later add the company process archive, contributor workspace, and admin workspace.
  - **Firebase Authentication:** Google and verified-email sign-in, account recovery, user identity, and trusted role claims. Do not store passwords in Firestore.
  - **Cloud Firestore:** Canonical batch/company/placement data, contribution revisions, moderation, audit history, and precomputed public views. Use Firestore rather than Firebase Realtime Database for this plan.
  - **Cloud Storage for Firebase:** Private source documents and supporting evidence when those features are introduced.
  - **Cloud Functions for Firebase:** Trusted moderation/publication, role assignment, import activation, and external integrations when needed. Initial 2026 publication can use an authorized Admin SDK CLI without a deployed function.
  - **Firebase Security Rules:** Enforce client authorization and ownership for Firestore/Storage; trusted Admin SDK operations require their own permission checks because server SDKs bypass these rules. [Official rules documentation](https://firebase.google.com/docs/firestore/security/get-started).
- Keep routine dashboard reads off a separately hosted Express server:
  - React reads a small public batch manifest and immutable, precomputed Firestore views directly using the Firebase Web SDK.
  - Generate statistics with the existing shared calculation module during trusted import/publication; do not recompute all metrics through a callable function on every page load.
  - Publish paginated/chunked views and lightweight search/filter indexes; avoid a database read for every search keystroke and an unbounded listener on all records.
  - Use listeners only where freshness is useful, such as the active dataset manifest and the contributor's own submission status.
- Availability rationale:
  - This removes the ordinary dashboard's dependency on a sleeping Render-hosted Node/Express service.
  - Do not claim guaranteed zero downtime: Firebase service availability, networking, quotas, and configuration still matter.
  - Firebase Functions can cold-start; keep them out of the ordinary public read path. Evaluate paid minimum instances only if measured latency for trusted mutations warrants them. [Function instance guidance](https://firebase.google.com/docs/functions/manage-functions).
- Adapt the existing repository structure instead of reorganizing it unnecessarily:
  - `src/`: React UI, Firebase Web SDK initialization, typed repositories, and auth state.
  - `shared/`: DTOs, Zod validation, enums, and the existing canonical statistics module.
  - `functions/`: TypeScript Firebase Functions for privileged operations introduced in later phases.
  - `scripts/`: Extraction, Admin SDK migration, view publication, and reconciliation utilities.
  - `data/` and `legacy/`: Preserved fixtures/reference artifacts; do not commit new private documents.
  - `firestore.rules`, `firestore.indexes.json`, `storage.rules`, and `firebase.json`: Versioned rules, indexes, emulators, and deployment configuration.
  - `docs/`: Architecture, methodology, operations, and moderation policy.
- Keep Firebase repository interfaces separate from UI components so SDK reads and emulator fixtures are interchangeable in tests.
- Start with Firestore indexes, precomputed views, and bounded client caching. Add an external full-text search provider only when measured needs exceed local search over a small published index.
- Implement discovery/invitations behind adapters, keep provider credentials in trusted execution, and process slow jobs in bounded, resumable batches with idempotency keys.
- Monitor document reads/writes, listener usage, storage, and function invocations; validate billing requirements before enabling paid capabilities and set budgets/alerts.

## 5. Core data model

- [ ] Map the logical entities below to Firestore collections/document references; Firestore does not provide relational joins or SQL-style unique constraints.
- [ ] Use deterministic IDs or transactional reservation documents for required uniqueness, including company aliases, batch/student identity, and import keys.
- [ ] Separate public documents from private originals, author identities, emails, roll-number mappings, evidence, and reviewer notes. Firestore reads return entire documents; hiding a field in React does not protect it.
- [ ] Keep public experience projections separate from internal revision documents so anonymous attribution cannot leak an author UID or private evidence path.
- [ ] Keep large candidate lists, revision histories, and audit events in separate documents/subcollections rather than indefinitely growing arrays. Respect current Firestore document/write limits. [Firestore limits](https://firebase.google.com/docs/firestore/quotas).

- [ ] **Batch**
  - `graduationYear`, `label`, `seasonStart`, `seasonEnd`, `status` (`ongoing`, `archived`).
  - Separate `coverageStatus` (`missing`, `partial`, `reviewed`) from lifecycle status.
  - Registration denominator, degree scope, branch denominators when available, source references, and last publication timestamp.
  - Unknown denominators are `null`; never imply that missing data means zero placements.
- [ ] **Company**
  - Stable ID, canonical name, slug, aliases, optional website, and display metadata.
  - Preserve source-reported company type on announcements because categorization can vary across years.
  - Explicit alias mapping and an audited merge workflow; do not automatically merge subsidiaries or similarly named employers.
  - Company IDs remain stable across all graduating batches and process pages.
- [ ] **RecruitmentDrive**
  - Company, batch, role(s), recruitment mode, optional dates, eligibility, and provenance.
  - Can exist before any placement result, allowing 2027 students to document tests they attended without being selected.
  - Multiple announcements and experiences can refer to the same drive; association is reviewed when ambiguous.
- [ ] **SourceDocument / ImportJob**
  - Source identifier, private storage reference where available, checksum, uploader, batch, parser version, and import status.
  - Row-level validation results, warnings, duplicate/correction matches, review decisions, and publication version.
  - Raw PDFs, email threads, and identity evidence remain private; public references disclose only appropriate provenance.
- [ ] **PlacementAnnouncement**
  - Batch, company, optional drive, original legacy ID, result date, original date text, roles, and source-reported type.
  - Reported hires, reported cumulative placement counter, source-file/page references, and correction notes.
  - Preserve original CTC text and typed values; represent mixed or unknown bands explicitly.
  - Publication status, revision history, superseded record reference, and import lineage.
- [ ] **StudentRecord**
  - Batch-scoped student identity, name, branch, private normalized roll number, optional linked account, and visibility settings.
  - Enforce uniqueness for `(batchId, normalizedRollNumber)` through a trusted deterministic opaque ID/reservation transaction when a reliable roll number exists; do not expose raw roll numbers as document paths.
  - Missing or inconsistent identities enter review; matching by name alone is insufficient.
- [ ] **Selection**
  - Announcement, student, role, and known candidate-specific compensation/band.
  - Distinguish candidate-level values from inherited announcement values and preserve their provenance.
  - Prevent exact duplicate imports without discarding legitimate multiple roles/offers; review ambiguous duplicate tuples.
  - A selection records a reported result, not necessarily an accepted offer or joining outcome.
- [ ] **User**
  - Firebase Auth UID, private email, display name, optional branch and graduation year. Auth remains the source of truth for sign-in identity.
  - Roles (`contributor`, `moderator`, `admin`), account status, and scoped verification state.
  - Identity verification and participation/selection verification are separate attributes.
- [ ] **Experience / ExperienceRevision**
  - Company, batch, drive if known, role, author, participation date, outcome, and publication attribution preference.
  - Structured rounds, preparation advice, overall notes, and optional private supporting evidence.
  - Draft, submitted, and published revision references; retain the author's original text alongside reviewed edits.
  - Verification scope, moderation status, reviewer notes, timestamps, and publication history.
- [ ] **CompanyGuideRevision**
  - Optional admin-curated summary of approved experiences, scoped to batch/role/drive where needed.
  - Link every summarized claim to published experience revisions; preserve disagreements and dates.
  - Do not replace individual experiences with an apparently authoritative generic procedure.
- [ ] **ProfileLink**
  - Student, normalized LinkedIn URL, submission/discovery source, review state, identity-confirmation state, and consent state.
  - Separate private match suggestions from approved public links; support revocation and correction.
- [ ] **ModerationAction / AuditEvent**
  - Actor, entity, action, before/after revision references, reason, and timestamp.
  - Track placement corrections, company merges, experience decisions, role changes, and profile-link publication/removal.
  - Avoid storing secrets or complete sensitive document contents in audit events.
- [ ] **Invitation**
  - Private recipient reference, intended company/batch, token hash, expiry, consent/unsubscribe state, and delivery status.
  - Claiming an invitation supplies context; it does not automatically verify placement or elevate permissions.
- [ ] Commit Firestore composite indexes for supported company/batch filters, chronology, moderation queues, and author drafts. Enforce unique import keys with document IDs/transactions, not an index declaration.
- [ ] Add versioned public view documents containing overview metrics, company/branch summaries, timeline data, and bounded candidate/search pages; maintain one `activeVersion` manifest per batch.

## 6. Statistics methodology and trust rules

- [ ] Define and test these metrics before the React migration is considered complete:
  - **Selections:** Published, non-superseded candidate selection records.
  - **Unique placed students:** Distinct reviewed student identities within the selected batch and degree scope.
  - **Placement rate:** Unique confirmed placed students divided by a sourced, matching registration denominator.
  - **Not confirmed placed:** Denominator minus unique confirmed placements; do not label this as proven unemployment.
  - **Company counts:** Canonical companies with published placement results in the selected batch.
  - **CTC:** Annual compensation in INR LPA, clearly distinguished from take-home pay, base salary, or stipend.
- [ ] Keep source-reported hires, observed candidate rows, and college cumulative counters separate; show discrepancies rather than silently forcing agreement.
- [ ] Publish explicit CTC weighting:
  - Preserve legacy announcement-weighted metrics during parity verification.
  - Label announcement-weighted and selection-weighted results wherever they appear.
  - Any new default must have a documented method, coverage count, and visible explanation.
  - Do not invent a unique-student salary metric without a rule for multiple offers and known accepted outcomes.
- [ ] Exclude unknown compensation from numerical aggregates and show how many records have usable values.
- [ ] Do not assign a mixed announcement CTC to every candidate without source-backed role/band mapping.
- [ ] Provide distinct timeline series for calculated selections/unique students and reported cumulative counters; label any estimate.
- [ ] Include dataset version, latest result date, last publication time, coverage status, and methodology links in the public experience.
- [ ] Year comparisons must disclose ongoing versus archived seasons, source coverage, denominators, and metric weighting.
- [ ] When privacy removal or corrections affect identity records, reconcile derived aggregates and cached responses rather than leaving stale counts.

## 7. Phase 0 — Baseline audit and migration fixtures

- [ ] Reuse the existing baseline report, fixture, tests, and preserved `legacy/index.html`; do not repeat completed extraction work unless a discrepancy is found.
- [ ] Inventory the React routes, filters, charts, and data-loading path that currently depends on `/api/v1/batches/2026/dashboard`.
- [ ] Capture representative desktop and mobile screenshots and a feature-parity checklist.
- [ ] Extract `RAW_DATA` using a bounded parser; never execute untrusted imported content to obtain JSON.
- [ ] Save a lossless migration fixture and checksum; preserve nested metadata, notes, nulls, and source references.
- [ ] Generate a baseline report of announcement count, selection count, unique roll numbers, companies, branches, dates, missing CTC, and duplicate identities.
- [ ] Audit the already-flagged incomplete Barclays candidate table, corrected announcements, mixed KPMG CTC, and missing HSBC counter.
- [ ] Document which findings can be resolved from this repository and which need original source documents.
- **Exit criteria:** Original data is preserved, baseline counts are reproducible, and all existing behavior has a written migration checklist.

## 8. Phase 1 — Firebase foundation and migration preparation

- [ ] Retain the existing React/Vite/TypeScript setup and shared calculations; add Firebase SDK initialization and typed data repositories.
- [ ] Register a Firebase web app, enable Firestore, and initialize Firebase Authentication. Enable the chosen sign-in providers and public account flows when Phase 4 is authorized.
- [ ] Confirm the project/region choice, authorized auth domains, current service limits, and any billing requirements before provisioning production resources.
- [ ] Add public web configuration placeholders to `.env.example`: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID` as applicable.
  - Firebase web configuration identifies the project and is expected in the browser; access is protected by rules and identity, not by hiding the web API key. [Firebase configuration guidance](https://firebase.google.com/docs/projects/api-keys).
  - Keep Admin SDK credentials/service-account material out of Git and all `VITE_` variables; use trusted local credentials or managed application credentials.
- [ ] Configure Auth/Firestore emulators and Storage/Functions emulators when applicable; use emulator-only project IDs in tests and explicit production opt-in for migration writes.
- [ ] Create deny-by-default Firestore rules with explicit read access for published views and owner-only draft access when introduced. Keep source/import collections inaccessible to public clients.
- [ ] Version Firestore indexes and Storage rules; add emulator rule tests and retain type/build/metric/browser checks in CI.
- [ ] Implement typed SDK error handling for permission denied, unavailable data, failed reads, and invalid Firebase configuration.
- [ ] Create an Admin SDK seed/publish command with dry-run mode, deterministic IDs, bounded writes, explicit target confirmation in the CLI, and full-record reconciliation.
- [ ] Plan initial admin bootstrap through trusted Admin SDK custom claims; never permit browser self-promotion. [Custom claims guidance](https://firebase.google.com/docs/auth/admin/custom-claims).
- **Exit criteria:** React can read emulator-backed published data without Express; private collections are denied to public clients, and migration tooling can validate/write a clearly selected target without exposing credentials.

## 9. Phase 2 — Migrate the 2026 dashboard with feature parity

- [ ] Import `data/placements-2026.json` into Firestore through an idempotent Admin SDK migration script; preserve original private records and generate approved public projections separately.
- [ ] Use deterministic announcement IDs and source checksums; do not overwrite differing existing records without a reviewed correction decision.
- [ ] Write a new immutable dataset version in bounded batches, verify records and precomputed views, then atomically switch the batch's `activeVersion` manifest. Do not attempt one oversized transaction for the whole archive.
- [ ] Capture the selected version once per load so one UI render cannot mix summary/candidate pages from different imports. Restart or offer refresh if the manifest changes.
- [ ] Retain legacy IDs and normalized company aliases so existing links can resolve.
- [ ] Reuse `shared/statistics.ts` during trusted publication to generate public statistics views; replace the Express fetch with Firebase repository reads, without duplicating calculations in React.
- [ ] Keep dashboard pages functional using precomputed Firestore documents even when Firebase Functions are idle or not yet deployed.
- [ ] Port the existing design tokens and styles into React components before introducing visual changes.
- [ ] Rebuild overview, companies, company result detail, branches, candidates, timeline, and statistical insights.
- [ ] Preserve search, filters, sort behavior, tooltips, mobile tables/cards, and width-only resize behavior that avoids scroll resets.
- [ ] Add loading, error, retry, no-result, and incomplete-data states.
- [ ] Store batch, filters, and sorting in URLs where useful; maintain browser back/forward behavior.
- [ ] Add a legacy hash-link adapter for old company and branch links; verify direct loading and refresh behavior on the deployment host.
- [ ] Retain analytics intentionally and track any route changes without logging candidate searches or private identities.
- [ ] Reconcile all migrated data against the baseline; classify intentional methodology changes separately from migration defects.
- [ ] Verify all 100 announcements, 311 selections, 299 unique students, 82 companies, source notes/nulls, compensation calculations, and confirmed counter 310 against the preserved fixture.
- [ ] After Firebase parity passes, retire the Express/Mongoose runtime, MongoDB-only dependencies/scripts, Vercel API function/rewrites, and frontend `VITE_API_URL` dependency; update README, CI, and operational documentation together.
- [ ] Preserve the previous implementation and existing MongoDB data as recoverable references through cutover; do not delete the cluster or unrelated records as part of migration.
- **Exit criteria:** The 2026 React dashboard retains its functionality and visual parity, reads Firestore without an Express backend, reconciles with the baseline, and can roll back to a known dataset/deployment.

## 10. Phase 3 — Add 2025, 2027, and sustainable data operations

- [ ] Add a prominent batch selector with consistent placement across statistics pages.
- [ ] Keep 2026 as the initial default through migration; make the default configurable and switch to 2027 when useful published coverage exists.
- [ ] Make all metrics, filters, candidate identities, and result queries batch-scoped.
- [ ] Implement an admin import pipeline:
  - Upload JSON/CSV or register a privately stored source document.
  - Parse into staging records; PDF/OCR extraction suggestions require human review.
  - Validate fields and show errors, unknown branches, alias conflicts, duplicates, missing source references, and compensation ambiguity.
  - Preview additions, updates, supersessions, and resulting aggregate changes before publication.
  - Generate immutable Firestore source/projection/view documents in bounded batches; validate counts and checksums before atomically activating the version manifest.
  - Record audit history and support rollback to the preceding published version.
- [ ] Use source checksums and stable record identifiers so retries do not duplicate data; corrections require explicit supersession decisions.
- [ ] Gather actual 2025/2027 sources and denominators from the owner. Until available, show honest missing-data states rather than sample statistics.
- [ ] Allow small manual admin corrections through the same validation and audit rules.
- [ ] Establish an operating cadence for the 2027 batch: incoming source review, staged import, discrepancy checks, publication, and freshness update.
- [ ] Add year comparisons after independent batch views are correct; show comparable definitions and season-progress caveats.
- **Exit criteria:** Every batch is independently queryable, imports are repeatable and reviewable, and new batches require configuration/data rather than duplicated code.

## 11. Phase 4 — Accounts and company process contributions

- [ ] Keep public statistics and approved process guides readable without login.
- [ ] Implement Firebase Authentication sign-in using Google and/or verified email as selected by the owner, account recovery, auth-state loading/error handling, and sign-out. Confirm actual college email domains before applying college-only contribution restrictions.
- [ ] Use the Auth UID as author identity, and check verified-email/provider state where required. Email verification does not prove college affiliation, participation, or selection.
- [ ] Support seniors who no longer have college email through manual verification or reviewed contextual evidence.
- [ ] Enforce author ownership and permitted draft fields with Firestore Rules; verify Firebase ID tokens and authorization inside trusted callable functions. Use Firebase Auth persistence deliberately and clear private local state on sign-out.
- [ ] Store privileged roles in trusted custom claims; handle token refresh after role changes and check current account/role state for sensitive functions so revocations are not silently ignored until token expiry.
- [ ] Add a contributor profile with optional year/branch and explicit public display-name preferences.
- [ ] Make **Company Processes** a separate navigation area; rename legacy statistical `Insights` to **Statistical Insights** to avoid ambiguity.
- [ ] Build a persistent company directory and company archive page:
  - Overview, approved experience count, available batches, roles, and latest contribution date.
  - Batch/role/drive filters, published individual experiences, and an optional curated guide.
  - Links to that company's placement statistics without forcing archive browsing into a single stats batch.
  - A clear contribution call to action and empty state for companies with no experience yet.
- [ ] Build a structured contribution form:
  - Company, graduating batch, role, approximate recruitment date, and optional known drive.
  - Participation stage and outcome: attended assessment, interviewed, selected, not selected, withdrew, or awaiting result.
  - Eligibility as experienced: branch, CGPA, backlog rules, with unknown values allowed.
  - Repeatable rounds: assessment/interview type, order, duration, topics, difficulty as subjective feedback, and preparation advice.
  - Distinguish personally attended rounds from secondhand information; publish clear provenance labels.
  - Overall notes, helpful resources, and optional private evidence.
  - Public attribution choice: named or anonymous to readers. Admins retain author accountability.
  - Disclosure acknowledgement covering others' personal information, confidential material, and verbatim proprietary test content.
- [ ] Offer a quick initial submission path and optional detailed rounds; avoid requiring a long form before students can contribute anything useful.
- [ ] Add autosaved drafts, preview, explicit submission, status tracking, reviewer feedback, and resubmission.
- [ ] Save edits to a published experience as a new pending revision; the previous approved revision remains public until a replacement is approved.
- [ ] Allow reported errors, author withdrawal/removal requests, and correction handling.
- **Exit criteria:** A contributor can complete the whole submission loop, and only approved revisions appear in public responses.

## 12. Phase 5 — Admin moderation and editorial guides

- [ ] Build an admin workspace with separate queues for imports, experiences, profile links, corrections, and reports.
- [ ] Separate permissions:
  - Contributor: own drafts, submissions, and profile requests.
  - Moderator: review experiences/reports, with only necessary private evidence access.
  - Admin: imports, company merges, account roles, profile publication, and operational configuration.
- [ ] Enforce the experience state machine through Security Rules for allowed contributor edits and trusted Firebase Functions for reviewed publication/moderation:
  - `draft → pending_review → approved | changes_requested | rejected`.
  - `changes_requested → pending_review` on resubmission.
  - Approved content can be unpublished/withdrawn with a recorded reason and a reviewable history.
- [ ] Provide reviewer tools for original-versus-edited text, structured rounds, evidence, duplicate detection, requested changes, and reasoned decisions.
- [ ] Prevent stale concurrent moderation decisions using revision/version checks.
- [ ] Use a Firestore transaction for each decision to check the expected revision, record the moderation event, and update the public projection/published pointer together; make callable retries idempotent.
- [ ] Do not allow contributors to write approved status, public projections, reviewer fields, or role claims directly; a hidden admin button is not authorization.
- [ ] Apply a quality rubric:
  - Relevant firsthand participation, enough specificity to help, clear batch/role/date context.
  - No fabricated verification, personal attacks, private contact details, or unsupported allegations presented as facts.
  - Preserve critical or negative experiences that meet the same evidence standard as positive ones.
  - Do not treat selection as a requirement for contributing useful test/interview experience.
- [ ] Distinguish verified identity, verified participation, verified selection, and editorial approval in public labels.
- [ ] Create curated company guides from approved contributions:
  - Group matching drive/batch/role experiences and cite source contributions.
  - Show variation and disagreement instead of flattening all years into one procedure.
  - Track guide revisions; flag guides for review when referenced content is withdrawn or materially corrected.
- [ ] Add internal moderation turnaround and coverage views so the owner can see queue age and under-covered companies.
- **Exit criteria:** Unauthorized users cannot moderate, approved content is revision-safe, and publication/edit/removal actions are auditable.

## 13. Phase 6 — Company-wise LinkedIn profiles

- Treat this as **identity discovery and confirmation**, not simply URL scraping. A wrong profile match is worse than a missing link.
- [ ] First ship a reliable profile-link workflow:
  - Candidates can claim their record and submit their own LinkedIn URL.
  - Contributors/admins can suggest a link into a private review queue.
  - Confirm ownership through independent account verification/review; possession of a public name, roll number, or LinkedIn URL alone is insufficient.
  - Publish only after identity confirmation and recorded permission from the candidate.
  - Allow revocation, URL updates, incorrect-match reports, and removal.
- [ ] Then evaluate automated discovery as an optional enhancement:
  - Verify provider capabilities and applicable platform requirements against current official documentation before implementation.
  - Use an authorized search/API provider or permitted public discovery method; do not bypass login, access restrictions, CAPTCHAs, or provider limits.
  - Query using available context such as name, KJSCE, batch, and company; roll numbers remain internal.
  - Store potential URLs, supporting match context, discovery date, and ambiguity state privately.
  - Do not infer a current employer from an old selection announcement or a name match.
  - Never automatically publish matches based on a confidence score alone.
  - Respect provider retention rules, bounded requests, retry/backoff, and an admin stop control.
  - If permitted automated discovery is unavailable, complete the feature with self-submitted and manually reviewed links.
- [ ] Display approved links beside selected candidates in company result views, grouped by batch; use a clear “Shared by candidate”/confirmation label where accurate.
- [ ] Store links and necessary confirmation metadata, not copied LinkedIn profiles, photos, contact details, or resumes.
- **Exit criteria:** Company pages expose useful confirmed links, uncertain suggestions stay private, and candidates can correct or remove their links.

## 14. Phase 7 — Senior onboarding and ongoing community participation

- [ ] Prepare a coverage matrix of company × batch × role/drive, showing gaps in approved firsthand contributions.
- [ ] Prioritize repeat recruiters and companies attracting significant student interest; measure coverage rather than raw submission volume alone.
- [ ] Add shareable contribution URLs with company/batch preselected. Use private expiring invitation tokens only when recipient identity needs to be bound.
- [ ] Build onboarding flows for:
  - 2025/2026 seniors sharing completed experiences.
  - 2027 students contributing immediately after an assessment and updating later outcomes.
  - Volunteers helping identify gaps without gaining moderation authority.
- [ ] Create outreach templates for alumni, current students, and campus community organizers; prepare copy and recipient suggestions for owner review.
- [ ] Let the owner manage an imported/private outreach list, deduplicate recipients, record consent/preferences, and track invitations.
- [ ] Implement any delivery integration behind a preview step. Contacting people or sending campaigns requires explicit owner authorization at execution time.
- [ ] Provide reminders only to opted-in recipients; enforce frequency limits, unsubscribe, expiry, and delivery audit records.
- [ ] Use contribution prompts in company pages and post-submission flows; avoid repeated prompts that disrupt students reading stats.
- [ ] Offer optional recognition for approved helpful contributions without exposing anonymous authors or gamifying spam.
- [ ] Measure the funnel: invitation opened → account created → draft started → submitted → approved.
- [ ] Monitor repeat contributors, company/batch coverage, current-season freshness, and moderation turnaround.
- **Exit criteria:** Seniors have a low-friction path to contribute, current students can add and update experiences, and outreach respects recorded preferences.

## 15. Suggested routes, Firestore reads, and trusted function contracts

- Frontend routes:
  - `/stats/:batchYear/overview`, `/companies`, `/branches`, `/candidates`, `/timeline`, `/insights` beneath the batch prefix.
  - `/stats/:batchYear/companies/:companySlug` and `/stats/:batchYear/branches/:branch`.
  - `/companies` and `/companies/:companySlug`: cross-year company process archive.
  - `/companies/:companySlug/contribute`, `/me/contributions`, `/me/contributions/:id`.
  - `/admin/imports`, `/admin/moderation`, `/admin/companies`, `/admin/profiles`, `/admin/invitations`.
- Firestore read model; finalize paths before implementing rules:
  - `batches/{year}`: Public batch metadata, coverage, and active dataset version.
  - `batches/{year}/versions/{version}/views/{viewId}`: Published overview, company/branch summaries, timeline, and bounded search/candidate chunks.
  - `companies/{companyId}` and `companies/{companyId}/publishedExperiences/{experienceId}`: Public company metadata and approved, sanitized experiences/guides; no private author/evidence fields.
  - `users/{uid}` and `users/{uid}/drafts/{draftId}`: Private profile/draft data with explicit owner-only access and permitted-field validation.
  - Separate restricted collections for source records, submissions/revisions, student identity mappings, imports, profile suggestions, audit events, and invitations. Add owner/moderator access only where needed.
- Trusted callable function contracts for later phases:
  - `submitExperience`, `reviewExperience`, `withdrawExperience`, `publishCompanyGuide`.
  - `validateImport`, `activateImportVersion`, `rollbackDatasetVersion`, `mergeCompany`.
  - `suggestProfileLink`, `confirmProfileLink`, `revokeProfileLink`.
  - `setUserRole` for authorized admins; `previewInvitations` and explicitly authorized delivery functions.
  - Implement only the functions needed for the current milestone; initial migration can publish through the trusted CLI.
- [ ] Specify input/output schemas, allowed document paths, pagination, filters/sorts, error codes, role/ownership checks, revision preconditions, and idempotency keys for each repository/function operation.
- [ ] Public queries read only published projections. Private submissions and public content must not share a readable document.
- [ ] Align queries with rules and committed indexes; Security Rules are not result filters, so queries must satisfy the allowed constraints. [Secure query guidance](https://firebase.google.com/docs/firestore/security/rules-query).
- [ ] Use cursor pagination, bounded page sizes, deterministic sorting, and published totals/filter metadata. Preserve substring search over a bounded public search index initially; Firestore is not a drop-in full-text search engine.
- [ ] Public statistics/profile DTOs omit raw roll numbers by default. Keep identity matching and old roll-search requirements internal unless an explicit visibility decision is documented.

## 16. Security, privacy, accessibility, and reliability

- [ ] Validate inputs at every trust boundary, including direct client writes through Rules; whitelist fields and reject changes to ownership, publication, and privilege fields.
- [ ] Enforce Firebase Auth identity, role checks, and ownership through Firestore/Storage Rules and explicit authorization in Admin SDK/callable operations.
- [ ] Separate public/private documents because Firestore Rules cannot redact fields from a readable document. Keep raw source data and anonymous-author mappings private.
- [ ] Configure authorized auth domains, persistence/sign-out behavior, function request limits, and token verification. Add Firebase App Check as an abuse-control layer when deploying; it does not replace authorization.
- [ ] Render user submissions as safe text or sanitized supported markup; never inject unsanitized HTML.
- [ ] Bound reads/listeners and enforce quotas/rate limits for sensitive callable operations. Do not assume direct Firestore access inherits Express middleware protections.
- [ ] Restrict private evidence uploads with Storage Rules by identity, type, and size; validate actual content in trusted processing and avoid permanent public evidence URLs.
- [ ] Treat submitted links as links; avoid arbitrary server-side URL fetching. Restrict URLs and protect any later fetcher from SSRF.
- [ ] Add retention and deletion handling for accounts, evidence, invitation contacts, and profile suggestions; document how deletions affect attribution and aggregates.
- [ ] Keep public aggregate caches separate from private contributor/admin responses and invalidate them after publication, corrections, or removals.
- [ ] Disable inappropriate persistent caching of private evidence/submission data on shared devices, and clear private in-memory state at sign-out.
- [ ] Versioned snapshots must honor removals too: restrict reads to active versions or purge affected old public projections, and do not roll back to a version that republishes removed personal data.
- [ ] Provide keyboard navigation, accessible form labels, focus management, clear validation messages, and chart summaries.
- [ ] Preserve useful mobile layouts and provide visible pagination instead of silently truncating candidate results.
- [ ] Back up data before production migrations and test restoration into a separate environment.
- [ ] Log operational failures with correlation IDs while redacting emails, tokens, roll numbers, evidence, and candidate search terms.

## 17. Verification and release gates

- [ ] **Data tests:** Migration counts, repeated imports, corrections, duplicate students, multi-offer students, alias resolution, and branch/batch isolation.
- [ ] **Metric tests:** Unknown/zero denominators, unknown/mixed CTC, odd/even medians, empty batches, mismatched reported counts, and incomplete timelines.
- [ ] **Firebase Rules tests:** Emulator checks for unauthenticated public reads, denied private reads, owner-only drafts, forbidden self-promotion, illegal state changes, and unauthorized evidence access.
- [ ] **Repository/function tests:** Public/private projections, supported queries/indexes, cursor pagination, auth/role denial, moderation transitions, stale revisions, retry idempotency, and Admin SDK authorization.
- [ ] **Auth tests:** Verified-email requirements, alumni path, sign-out cleanup, refreshed custom claims, and role/account revocation.
- [ ] **Community tests:** Draft → review feedback → resubmission → approval; published edit remains pending; withdrawal/report handling.
- [ ] **Profile tests:** Ambiguous matches cannot publish, claimed identities require verification, revocation hides public links, and discovery retries do not duplicate suggestions.
- [ ] **End-to-end tests:** Batch switching, legacy hash links, filters/back navigation, student submission, and admin approval.
- [ ] **Visual review:** Compare React against baseline at representative mobile and desktop widths; inspect empty/loading/error states as well as populated data.
- [ ] **Performance/cost check:** Measure dashboard latency and Firestore reads per visit with multi-year fixtures; verify index coverage, view/document sizes, listener teardown, bounded search, and absence of a function dependency on normal reads.
- [ ] **Operational checks:** CI and emulator checks pass, privileged credentials are absent from source/builds, export/restore succeeds, static hosting/Auth/Firestore smoke checks work, and rollback is rehearsed.

## 18. Deployment and rollout

- [ ] Use real cloud Firebase for application runtime and separate projects for staging/production. Emulators are isolated test infrastructure only; do not require a local database or backend to use the application.
- [ ] Keep React as a static Vercel deployment initially; Firebase Hosting is an alternative if the owner requests it. Firebase Auth/Firestore do not require moving the frontend host.
- [ ] Choose Firestore and any Function/Storage locations deliberately, verify current availability/billing constraints, and keep trusted services near their data where practical.
- [ ] Configure Firebase web settings, authorized auth/preview domains, Google sign-in redirects, App Check, deployed Rules/indexes, and SPA/hash-link behavior.
- [ ] Publish and verify Firestore data/views and Security Rules before releasing the frontend read-path switch. Do not deploy permissive test rules as a shortcut.
- [ ] Remove the sleeping-server dependency and obsolete Vercel Express function/rewrites after the Firebase preview passes; do not replace Render with another always-running Node host.
- [ ] Deploy Firebase Functions only for required trusted actions/integrations. Verify cold-start behavior and execution limits there; normal stats browsing must remain direct to published Firestore views.
- [ ] Verify budgets, quota alerts, backup/export/restore capabilities, and any required billing plan; do not assume all Firebase capabilities or minimum function instances are free.
- [ ] Deploy staging first; reconcile its 2026 metrics against the legacy site before any cutover.
- [ ] Release in stages:
  - Firebase 2026 dashboard parity and removal of the Express/MongoDB runtime dependency.
  - Firebase Auth foundation, followed by public account flows when contributions are introduced.
  - Reviewed 2025/2027 data and admin import workflow.
  - Company process archive with a small invited contributor cohort.
  - Public contribution intake and admin moderation.
  - Confirmed profile links, optional discovery, and controlled outreach.
- [ ] Prepare the production build, backup, migration report, smoke checks, and rollback procedure before requesting deployment approval.
- [ ] Retain a recoverable legacy/React deployment, original JSON fixture, and existing MongoDB snapshot through cutover; monitor Firebase access errors, latency, read costs, and data discrepancies after release.
- [ ] Use feature flags for contribution intake, profile publication, discovery, and invitation delivery so operational problems can be contained independently.
- **Exit criteria:** Public users retain the original dashboard value while each new capability can be independently monitored and rolled back.

## 19. Owner inputs and external dependencies

- Resolve these when the relevant phase needs them; continue independent implementation meanwhile:
  - Actual 2025 and 2027 placement sources and any original 2026 PDFs needed for anomaly review.
  - Batch/branch registration denominators and their degree scope/source.
  - Existing production URL, Vercel project access, and analytics configuration.
  - Firebase project access, registered web-app configuration, Firestore region, Auth providers, production domain, and operating budget/billing approval for services that require it.
  - Trusted migration credential access through a local credential file/application credentials or managed identity; do not ask the owner to paste a service-account private key into chat.
  - Actual college email domains, alumni verification route, and initial admin/moderator identities.
  - Candidate-name/roster visibility expectations and handling of removal requests.
  - Outreach channel, authorized recipient lists, campaign approval, and reminder preferences.
  - Whether an approved external discovery provider is available; this must not block self-submitted profile links.

## 20. Overall definition of done

- [ ] The application uses React, Firebase Authentication, and Cloud Firestore with reproducible emulator setup and passing CI; Firebase Functions/Storage support only the privileged features that need them.
- [ ] Public dashboard reads have no dependency on a Render/Express server or a cold-starting statistics function.
- [ ] Firestore/Storage Rules and trusted action authorization protect private records, anonymous author mappings, and moderation; budget/read monitoring and rollback procedures are documented.
- [ ] The existing 2026 dashboard is preserved in functionality, usability, and reconciled data.
- [ ] 2025, 2026, and 2027 are supported independently, with real datasets when supplied and honest coverage states otherwise.
- [ ] Placement statistics and company process research are separate, connected product areas.
- [ ] Students and seniors can submit, revise, and track company experiences; admins can review and publish them fairly.
- [ ] Current students can contribute firsthand process insights without needing to be selected.
- [ ] Company identities persist across years, and guides retain year/role/drive context and traceable sources.
- [ ] Company-wise confirmed LinkedIn links support correction and removal; uncertain discoveries remain private.
- [ ] Senior onboarding and opted-in ongoing participation have working flows and measurable coverage.
- [ ] Imports, corrections, moderation, visibility, backups, and rollback have documented operational procedures.
- [ ] Remaining missing source data or external service access is explicitly recorded; never claim full dataset or production completion while those dependencies remain unmet.

## 21. Implementation log

- **Planning baseline:** Written against the repository on 8 October 2026; no migration or application changes performed as part of this planning task.
- **Historical migration — 8 October 2026:** React/Express/MongoDB implementation, original 2026 data import, legacy parity tests, and local verification were completed. `docs/migration-report.md` and `readme.md` describe that implementation; they will need revision during Firebase implementation.
- **Architecture revision — 8 October 2026:** The owner selected Firebase Authentication and Cloud Firestore to remove the ordinary dashboard's dependency on a separately hosted Node/Express service. This plan supersedes the previous MERN target; existing MongoDB code/data is a migration reference, not the future serving architecture.
- **Implementation — 8 October 2026:** React now reads checksummed, schema-validated cloud Firestore snapshots directly; optional Firebase Auth, trusted idempotent import/reconciliation, and restrictive rules are implemented. Express/Mongoose serving code has been removed and documentation updated.
- **Latest scope:** Run the React UI locally against real cloud Firebase. No local database/server is required. GitHub/Vercel, additional batches, and community features remain deferred. Test-only emulators verify security without touching real accounts or data.
- **Cloud migration completed — 8 October 2026:** After the owner's IAM correction, security rules were published and verified, original 2026 data imported and fully reconciled, and all routes checked against real cloud Firestore at desktop/mobile widths. Cloud email/password sign-in, reload persistence, sign-out, and public browsing passed; the temporary test user was removed. Google provider is enabled; interactive owner login and real email delivery are manual checks.
- **Verification:** All 31 unit, publication, import, rules, and desktop/mobile browser checks pass, as do TypeScript, production build, and dependency audit. Tests use an isolated demo project and do not imply live-cloud access.
- **AY 2024–25 addition — 8 October 2026:** Added graduation year 2025 after the owner's explicit request and source PDFs. The final UG report's 360 selections/323 students are preserved, with exact roll/employer email matching, separate campus status, visible missing fields and source disagreements, and a year selector with scoped navigation. Both cloud datasets reconcile; 38 automated checks and live desktop/mobile checks pass. See `docs/2025-data-audit.md` for missing inputs and source methodology.
- **Next agent action:** Both requested years are implemented and published to cloud Firebase. Follow `4amchanges.md` for startup and owner testing. Wait for a new request before GitHub/Vercel setup, 2027 data, or community features.
- **Decision log:** Append dated choices, their rationale, and any resulting scope changes here.
- **Open issues:** Append source anomalies, unresolved owner inputs, and release blockers here as discovered.
