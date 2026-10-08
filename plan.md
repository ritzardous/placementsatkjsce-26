# Placement Stats KJSCE — Landing Page and Community Archive Plan

- **Purpose:** Build on the deployed React + Firebase dashboard with a public landing page, Google-only access, and a community archive of company recruitment experiences.
- **Audience:** The agent implementing the next release and the owner reviewing each milestone.
- **Execution:** Follow the phases in order, check off verified work, and record decisions and unresolved dependencies at the end of this document.
- **Current request:** Update the plan only. This document does not authorize immediate implementation, production changes, or contacting alumni.
- **Architecture:** React + TypeScript + Vite on Vercel; Firebase Authentication and cloud Firestore. Keep normal dashboard reads independent of an Express/Render backend. Use managed Firebase services for privileged community actions where required.
- **Latest product decision:** The landing page is public. Google sign-in is required to enter the statistics, company procedures, and alumni contact areas. This replaces the previous plan for free anonymous dashboard browsing and optional email/password login.

## 1. Completed baseline to preserve

- [x] Original single-file application migrated to React and cloud Firebase.
- [x] Graduation year **2026 / AY 2025–26** implemented with the original dashboard functionality.
- [x] Graduation year **2025 / AY 2024–25** added from the college report and two supplied email threads.
- [x] Graduation year **2027 / AY 2026–27** added from the supplied ongoing email thread, with explicit LIVE/ongoing status, source date, and reviewed-update messaging. Preserve this behavior when adding the landing page and login flow.
- [x] Both datasets published to Firestore with source references, validation, and reconciliation.
- [x] Company logos added with uniform square containers, readable backgrounds, and initials fallbacks.
- [x] New application deployed, as reported by the owner. Record the actual production hostname during implementation; do not assume the suggested Vercel project name was used.
- Preserve existing search, filters, charts, sorting, company details, branches, candidate rosters, timelines, insights, and mobile layouts.
- Preserve the statistical definitions in `shared/statistics.ts` and the publication safeguards in the existing scripts.
- Preserve the baseline data:
  - **2026:** 100 announcements, 311 candidate selections, 299 unique students, 82 companies; latest sourced TPO counter 310. These are different measures.
  - **2025:** 360 selections, 323 unique students, 129 normalized companies; 331 on-campus and 29 off-campus selections.
  - The sourced 2026 B.Tech registration denominator is 524. Do not reuse it for 2025 or invent a missing denominator.
  - Keep missing dates, roles, compensation, and other unsupported fields missing.
- Repository starting points:
  - `src/App.tsx`: existing dashboard and hash routing.
  - `src/AuthControls.tsx`: current optional Google and email/password authentication.
  - `src/firebase.ts` and `src/repository.ts`: Firebase initialization and published dataset reads.
  - `firestore.rules` and `storage.rules`: current access rules; community collections remain closed.
  - `docs/2025-data-audit.md`: 2025 provenance and unresolved source gaps.
  - `deployment guide.md` and `4amchanges.md`: deployment and setup/testing guidance.

## 2. Product structure and navigation

- **Public landing page:** Explain the product and invite users to continue with Google.
- **Authenticated home:** Present two clearly separate destinations:
  - **Placement Statistics:** Choose a graduation year before entering its dashboard.
  - **Company Procedures:** Two main views: **Browse** for students researching companies with approved procedures or recruitment information, and **Contribute** for submitting information about any sourced campus recruiter.
- **Alumni Contacts:** A separate authenticated destination, also linked from company pages, showing verified, consented LinkedIn profiles.
- **My Contributions:** Drafts, submitted experiences, review feedback, and published contributions belonging to the signed-in user.
- **Admin:** Restricted review queue, company identity management, and alumni verification.
- Use consistent labels throughout: **Class of 2025 · AY 2024–25** and **Class of 2026 · AY 2025–26**.
- A selected statistics year must not silently filter the entire company procedures archive. Give procedures their own explicit year and role filters.
- Preserve links between areas:
  - A year-specific company statistics page links to that company's procedures and alumni contacts.
  - A procedure links back to the relevant year's company statistics when a sourced match exists.
- Include Class of 2027 / AY 2026–27 as an ongoing season alongside the historical years. Preserve its live notice and source freshness details; future years require supplied data and an implementation request.

## 3. Phase 1 — Public landing page and Google-only access

### Landing page

- [ ] Build a distinct landing layout outside the dashboard shell.
- [ ] Lead with a clear benefit, such as: **Know the numbers. Understand the rounds. Learn from alumni.**
- [ ] Explain the three product pillars in simple language:
  - Clear, unbiased placement statistics with source references, calculation methods, and visible data gaps.
  - Verified alumni LinkedIn profiles, organized by company, to help students find relevant people.
  - Reviewed recruitment experiences describing tests, interviews, preparation, and outcomes from people who participated.
- [ ] Explain that statistics are organized by graduating batch while company procedures form a separate archive across years.
- [ ] Include a prominent **Continue with Google** button near the top and after the feature explanation.
- [ ] Include truthful product previews, coverage information, and a short explanation of how verification works.
- [ ] Label alumni contacts and procedures as **Coming soon** until usable verified content exists. Do not advertise access to all alumni or all procedures unless that coverage has actually been established.
- [ ] Distinguish moderated experiences from official company instructions. A reviewed account of a past drive is not a guarantee of the next drive's process.
- [ ] Use the existing visual identity and company assets; support mobile, keyboard navigation, readable contrast, and reduced-motion preferences.
- [ ] Include concise privacy and contribution guidelines covering Google identity, public attribution choices, and private verification evidence.

### Authentication and access enforcement

- [ ] Introduce one shared authentication state used by routing, navigation, data fetching, and account controls.
- [ ] Replace password registration, password login, and reset-password UI with Google sign-in.
- [ ] Audit existing email/password users before disabling that provider. Provide a safe Google linking/migration path for affected accounts; preserve their user IDs and roles where applicable.
- [ ] Require an authenticated Google identity for protected data and actions. Enforce the policy in Firestore rules and trusted server actions, not just route guards.
- [ ] Update the currently public batch/version/chunk reads to the intended authenticated access policy while preserving active-version restrictions and client write denial.
- [ ] Keep private imports, source records, drafts, and moderation records inaccessible to ordinary readers.
- [ ] During authentication initialization, show a neutral loading state; do not briefly display protected content or start its reads.
- [ ] Signed-out users opening a protected link see the landing/sign-in flow and return to the intended internal route after success.
- [ ] Handle popup cancellation, blocked popups, account conflicts, expired sessions, and provider failures with useful messages. Prevent duplicate login attempts.
- [ ] On logout, unsubscribe from protected reads and clear protected application state and any app-controlled caches. Do not introduce persistent offline caching of protected data without an explicit access design.
- [ ] Confirm the actual production hostname is authorized in Firebase Authentication; keep web SDK configuration separate from Admin SDK credentials.

### Acceptance checks

- [ ] An incognito visitor sees the landing page and cannot load protected Firestore documents through a direct SDK request.
- [ ] Google login, reload persistence, logout, and protected deep-link return work on desktop and mobile.
- [ ] Email/password login is no longer offered; existing-account handling is documented and verified before provider changes.
- [ ] Existing year-specific dashboards still render and calculate identically after login.
- [ ] No new public response exposes private source data or verification evidence.

## 4. Phase 2 — Authenticated home and year distinction

- [ ] Add an authenticated home with year cards for 2025, 2026, and the ongoing 2027 season, plus a visually separate **Company Procedures** entry.
- [ ] Each year card shows graduation year, academic-year label, and sourced coverage/status; do not assume every dataset is complete or final.
- [ ] Keep the existing dashboard layout inside the selected year for familiarity.
- [ ] Show the selected year prominently in the statistics header and provide an easy way to switch.
- [ ] Scope statistics filters and data to the selected year; reset incompatible filters when switching.
- [ ] Keep hash routing initially unless a deliberate route migration is needed. Define landing/home/procedures/contact/contribution/admin routes centrally.
- [ ] Preserve existing `#2025/...` and legacy 2026 links, routing them through authentication when necessary. Verify that new route names do not collide with the existing statistics `#companies` route.
- [ ] Give the main navigation clear entries for Home, Placement Statistics, Company Procedures, Alumni Contacts, and My Contributions; show Admin only to authorized users.
- [ ] Test reload, browser back/forward, invalid routes, and mobile navigation.

## 5. Phase 3 — Company directory across both years

- [ ] Build a canonical company registry from the union of the two sourced datasets.
- [ ] Assign stable company IDs and maintain a reviewed alias map connecting each year's existing company keys to those IDs.
- [ ] Preserve original source names alongside display names. Do not automatically merge similarly named subsidiaries or unrelated companies.
- [ ] Reuse verified logos and the uniform square presentation; keep initials for unavailable assets.
- [ ] Record each source-backed association with graduation year, source company key, and campus status where known.
- [ ] Separate **on-campus recruiters** from companies known only through off-campus results. Do not describe every 2025 company as having visited campus.
- [ ] Mark unknown campus status as unknown; never infer a visit date from a result announcement.
- [ ] Split the Company Procedures directory into two clearly labeled main views: **Browse** and **Contribute**.
- [ ] Make **Browse** the default student-facing view. List only companies with at least one admin-approved, currently published procedure or recruitment information entry. Alumni contacts alone do not qualify a company for this list.
- [ ] Do not show companies with only drafts, pending submissions, rejected submissions, or no approved recruitment information in Browse. Provide search and year/role filters over eligible companies only.
- [ ] In **Contribute**, list all companies with a sourced campus recruitment association across the available years, including those with no published information. Grow this list as verified historical campus records are added; do not imply that the current two-year sources cover every campus visit ever.
- [ ] Give each Contribute company a **Share your experience** action and show whether approved information already exists. Clearly explain that every submission requires admin approval before it appears to other students.
- [ ] Keep off-campus-only and unknown-status records in the underlying registry, but exclude them from the campus-recruiter contribution list until a campus association is verified. Support requests to add a missing campus recruiter for admin review.
- [ ] Both views use the same canonical company IDs and company pages; the split controls discovery, not duplicate company records.
- [ ] On each company page show its sourced year associations, links to annual statistics, published experiences, verified alumni contacts, and a contribution action.
- [ ] Keep procedure counts and verified contact counts derived from accessible published records.
- [ ] Support an admin-reviewed request to add a missing company; users cannot manufacture a verified campus history.

### Acceptance checks

- [ ] Every company in both datasets maps to a registry entry or an explicitly recorded unresolved identity.
- [ ] Cross-year aliases retain source attribution and avoid double-counting the same recruiter.
- [ ] Off-campus records are clearly distinguished from campus visits.
- [ ] Browse contains only companies with approved, published recruitment information; Contribute includes every sourced campus recruiter, even with zero approved entries.
- [ ] Pending submissions never make a company appear in Browse. Publishing its first approved entry adds it; unpublishing its last approved entry removes it from Browse while retaining it in Contribute.
- [ ] Existing statistics records and totals remain unchanged.

## 6. Phase 4 — Structured community submissions

- [ ] Let any signed-in Google user submit a firsthand experience, including a current student who took a test but was not selected.
- [ ] Let users save drafts, preview the article, submit for review, read feedback, revise, and track status in My Contributions.
- [ ] Use a structured form with these sections:
  - **Context:** Company, role, graduation year, recruitment season/drive if known, campus/off-campus/unknown, participation stage, and outcome.
  - **Overview:** Short title, summary, eligibility information if known, and overall experience.
  - **Rounds:** Ordered entries with round type (test, coding, technical interview, HR, group discussion, other), mode, known duration, topics, difficulty as the author's opinion, and what happened.
  - **Preparation:** Resources, preparation strategy, mistakes, and practical advice.
  - **Outcome:** Selected/not selected/awaiting result/withdrew/prefer not to disclose; do not require selection to contribute.
  - **Attribution:** Display name or public anonymity, with a private authenticated author identity for moderation.
  - **Verification:** Optional private evidence/reference and confirmation that the account is firsthand and safe to share.
- [ ] Require company, title, participation context, and meaningful experience content. Allow unknown dates, compensation, durations, and eligibility rather than forcing invented answers.
- [ ] Apply reasonable length limits and validated structured fields; establish the exact limits in the shared schema before building the form.
- [ ] Support safe plain text or a restricted Markdown format. Never render arbitrary submitted HTML.
- [ ] Ask contributors to exclude other people's private details, confidential material, and leaked assessments; allow topic descriptions and preparation advice.
- [ ] Label the form's verification requirements clearly. Google login confirms account access, not alumni status, company selection, or the truth of every statement.
- [ ] Keep author identity, evidence, and review notes separate from the public article projection.
- [ ] Add duplicate-submit protection and trusted submission limits; preserve drafts when validation or network failures occur.

### Contribution lifecycle

- [ ] Implement: **Draft → Pending review → Changes requested / Approved and published / Rejected**.
- [ ] Allow the author to revise a changes-requested submission and resubmit it.
- [ ] Allow draft deletion and pending-submission withdrawal; define published withdrawal/unpublishing behavior explicitly.
- [ ] Editing a published article creates a pending revision. The last approved version remains visible until the replacement is approved or the article is withdrawn.
- [ ] Preserve the submitted text, approved version, and review history so changes can be explained and audited.
- [ ] Communicate review status and feedback inside the app. Email notifications are optional later work.

## 7. Phase 5 — Admin moderation and verification

- [ ] Build a protected review queue with company, year, status, and evidence-availability filters.
- [ ] Let reviewers inspect structured rounds, source references, evidence, and prior revisions.
- [ ] Support approve, request changes, reject with a reason, and unpublish with a reason.
- [ ] Review for firsthand context, useful detail, appropriate content, internal consistency, and unsupported claims. Preserve respectful negative experiences; moderation should not become company promotion.
- [ ] Allow formatting and structure corrections with an audit trail. Ask the author before changes that alter the meaning or add factual claims.
- [ ] Publish only the sanitized approved projection, including reviewer timestamps and the scope of verification.
- [ ] Use scoped labels such as **Reviewed experience** and **Selection verified**; do not give every approved article a generic alumni/selection-verification badge.
- [ ] Keep an auditable record of decisions, revisions, reviewer identity, and timestamps.
- [ ] Reuse trusted role assignment; only trusted administration can grant admin/moderator claims. User-editable profile fields must never grant privileges.
- [ ] Implement privileged publication and moderation transitions through authenticated managed server actions where cross-document consistency is required. Verify claims there because Admin SDK access bypasses Firestore rules.
- [ ] If adding Firebase Functions or Storage, confirm current billing and service setup with the owner before enabling paid infrastructure. Normal statistics reads must remain direct Firestore reads.
- [ ] Create Firestore indexes from actual queue queries and check in the configuration.

## 8. Phase 6 — Company procedure articles and discovery

- [ ] Display approved experiences as readable community articles, with cards leading to a dedicated article view.
- [ ] Derive Browse eligibility from currently approved, published procedures or recruitment information. Keep eligibility and published counts consistent with admin approval, revision, and unpublishing actions.
- [ ] If a statistics company has no approved procedure information, its procedures link opens the Contribute view for that company with an honest empty state; it must not create an empty Browse listing.
- [ ] Cards show company/logo, title, role, year/drive context, summary, author attribution, publication date, and precisely scoped review badges.
- [ ] Article pages show context, ordered rounds, preparation, outcome, and last approved update date.
- [ ] Provide filters for company, year, role, round type, and outcome where populated.
- [ ] Make the difference between one person's experience and a company-wide process explicit. Preserve multiple experiences rather than collapsing disagreements into an invented definitive guide.
- [ ] Provide clear empty/loading/error states and paginated queries. Start with simple supported discovery; do not add an external search service without a demonstrated need.
- [ ] Add an authenticated report/correction action connected to the review queue.
- [ ] Show pending articles only to their authors and authorized reviewers. Ordinary readers must not be able to query drafts or review notes.
- [ ] Defer ratings, comments, votes, follower feeds, and direct messaging until the core contribution loop works.

## 9. Phase 7 — Verified alumni LinkedIn contacts

- [ ] Add a consent-based profile submission/claim flow with name, batch, company, role if known, LinkedIn profile URL, and a visibility preference.
- [ ] Verify the person's identity, the profile match, and the company association through documented evidence or owner-reviewed source records.
- [ ] Keep uncertain matches private. Never guess a LinkedIn URL from a name, treat a search result as verification, or publish every candidate automatically.
- [ ] Publish only approved, consented fields. Do not publish emails, phone numbers, or private evidence.
- [ ] Link verified profiles to canonical companies and relevant year associations; distinguish selection from current employment if that is all the source establishes.
- [ ] Let profile owners request correction, removal, or visibility changes.
- [ ] Provide an explanation of what was verified and when; do not imply that a LinkedIn link guarantees a referral or reply.
- [ ] Keep missing profiles missing and report actual coverage. The goal of finding all alumni must not become a claim of complete coverage before it exists.
- [ ] Do not make bulk scraping or LinkedIn sign-in automation a dependency for launch.

## 10. Phase 8 — Senior onboarding and ongoing contributions

- [ ] Create shareable company-specific contribution links that survive the Google sign-in flow.
- [ ] Provide a short contributor onboarding page explaining the format, review process, attribution choices, and how experiences help students.
- [ ] Let seniors claim a verified profile and contribute to companies they actually participated in.
- [ ] Let current students contribute after tests/interviews and update their outcomes later through the revision flow.
- [ ] Track coverage by company and year: published experiences, pending submissions, and verified contacts. Use these counts to prioritize gaps.
- [ ] Draft outreach copy and a company coverage checklist for the owner. Sending messages to alumni requires a separate explicit instruction.
- [ ] Keep all accepted participation experiences useful, regardless of selection outcome; reserve selection badges for verified selections.

## 11. Suggested Firestore model and access boundaries

- [ ] Finalize shared schemas and access rules before building submission/admin screens. Suggested collections are a starting design, not existing implementation:
  - `batches/{year}/versions/...`: Preserve the existing validated statistics publication model; authenticated Google reads of active publications only.
  - `companies/{companyId}`: Canonical company metadata, reviewed aliases, and sourced year associations; authenticated reads, trusted management writes.
  - `experienceSubmissions/{submissionId}`: Private author draft/review data and revision references; owner/reviewer access with controlled transitions.
  - `publishedExperiences/{experienceId}`: Approved reader-safe article projection; authenticated reads, trusted publication writes.
  - `experienceReviews/{reviewId}`: Private decisions and audit events; reviewer access and trusted append-only writes.
  - `alumniSubmissions/{submissionId}`: Private identity, consent, and verification information; owner/reviewer access.
  - `alumniProfiles/{profileId}`: Approved, consented profile projection; authenticated reads and controlled publication/visibility changes.
  - `reports/{reportId}`: Reader reports and review status; controlled creation and restricted review access.
  - `users/{uid}`: Minimal account/profile settings; owner updates to allowlisted fields only, no client-controlled privileges.
- [ ] Do not rely on Firestore rules to hide individual fields within a readable document. Private fields belong in separate private documents.
- [ ] Enforce ownership, field allowlists, valid references, length limits, and allowed state transitions in both client validation and authoritative rules/server validation.
- [ ] Keep source imports, evidence, anonymous-author mappings, and moderation notes outside reader-visible documents.
- [ ] Only add evidence uploads if needed. Store them privately with access limited to the owner and authorized reviewers; do not distribute public download URLs.
- [ ] Use server timestamps and stable IDs; prevent stale moderation decisions from overwriting newer revisions.
- [ ] Maintain deny-by-default rules and publish explicit indexes alongside code.

## 12. Testing, rollout, and operational checks

- [ ] Add meaningful authentication, rule, workflow, and browser tests as each phase is implemented:
  - Signed-out reads are denied; authenticated Google access works; other-provider access follows the chosen migration policy.
  - Ordinary users cannot modify placement data, grant roles, approve articles, or read another author's private draft/evidence.
  - Public anonymity never exposes the author mapping in reader responses.
  - Submitted content is safely rendered; approved revisions and withdrawals follow the defined lifecycle.
  - Reviewers cannot publish stale revisions or bypass required validation.
  - Both years retain reconciled totals, filters, navigation, and desktop/mobile usability.
- [ ] Run `npm test`, `npm run build`, and relevant browser tests for implementation changes; run `npm run test:firebase` when access rules/workflows change.
- [ ] Test-only emulators are isolated fixtures, not the deployed data path. Actual application data and authentication remain cloud-based.
- [ ] Validate against cloud Firebase with controlled test accounts/documents and remove test artifacts after verification. Do not seed fake community content into production.
- [ ] Plan the auth cutover so the new client and rules are compatible. Document deployment order and rollback without silently restoring public reads against the owner's access decision.
- [ ] Release incrementally: landing/auth/home first, directory next, then submissions/moderation/articles, then verified contacts and onboarding.
- [ ] Feature-gate unfinished areas with accurate availability messaging; never route users into broken contribution flows.
- [ ] Update `4amchanges.md`, the deployment guide, and relevant README/setup notes when implementation changes their instructions.
- [ ] Document role setup, moderation procedures, correction/removal handling, exports/backups, and rollback.
- [ ] Monitor Firestore reads, pagination, query indexes, managed-function errors if added, and service usage/budget thresholds.

## 13. Definition of done for the next product release

- [ ] Public landing page explains the product accurately and offers Google-only entry.
- [ ] Protected areas and data require the intended Google-authenticated access, including direct backend requests.
- [ ] After login, users clearly choose their statistics year or enter the separate company procedures archive.
- [ ] Both existing dashboards retain their format, source transparency, and correct calculations.
- [ ] Company Procedures has a student-facing Browse view containing only companies with approved information and a Contribute view listing all sourced campus recruiters across the available years.
- [ ] Contributions appear to other students only after admin approval; companies without approved information remain discoverable through Contribute.
- [ ] A user can draft, submit, revise, and track a structured firsthand experience.
- [ ] An authorized reviewer can request changes, approve, reject, and unpublish with an audit trail.
- [ ] Readers see only approved articles, with context and honest verification labels.
- [ ] Verified, consented alumni LinkedIn profiles work company-wise with correction/removal flows; incomplete coverage is visible.
- [ ] Private evidence, author identities for anonymous posts, and review records are protected.
- [ ] Mobile/desktop checks, applicable security tests, production configuration, and operating instructions are complete.

## 14. Decisions, dependencies, and implementation log

- **8 October 2026 — Baseline:** React/Firebase migration, 2025 and 2026 data, uniform company logos, and deployment are complete. Deployment completion is owner-reported.
- **8 October 2026 — Product revision:** Public marketing landing; Google-only protected application; explicit year selection; independent cross-year company procedures; structured contributions and admin review; verified alumni contacts.
- **Directory refinement:** Company Procedures separates Browse (approved information available) from Contribute (all sourced campus recruiters). All contributions require admin approval before reader-visible publication.
- **Planning status:** This revision changes `plan.md` only. Landing/auth/community implementation has not started as part of this request.
- **First implementation action:** Audit current authentication identities and routing, then implement Phase 1 with access-rule tests before introducing community writes.
- **Inputs to confirm during relevant phases:** Actual production hostname; existing password-account migration needs; initial reviewer account IDs; billing readiness if privileged managed services require it; alumni consent and verification evidence.
- **Default choices:** Signed-in Google users can read and submit; college affiliation is not inferred from an email address; contributors need not have been selected; published anonymity is optional; roles remain trusted; no fabricated source data or testimonials.
- **Record here as work proceeds:** Completed checks, chosen route/schema names, alias decisions, unresolved source gaps, service dependencies, and rollout/rollback outcomes.
