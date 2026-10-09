> Live architecture update: Firebase stays on Spark. Trusted mutations run in `/api/procedures` on the app server (Vercel in production), reusing the transaction service described below. Firebase Functions are retained for emulator testing only. See `4amchanges.md` for current setup.

# Company Procedures — working beta plan

## 1. Scope and access

- **Students:** browse approved experiences, filter by company/year/coverage/outcome, and upvote or downvote.
- **Contributors (students or alumni):** share experiences for any companies they appeared for, including unsuccessful attempts; manage drafts and review feedback under My Account.
- **Admins:** review submissions, approve, request changes, reject, or unpublish; see a pending-count badge and notification inbox.
- Keep the app's existing verified Google sign-in requirement. “Published” means visible to all signed-in readers. Student/alumni labels and selection outcomes are self-reported, not verified credentials; either group can contribute.

## 2. Low-hassle contribution flow

**Choose company → write and preview → submit for review.** Reuse the existing campus recruiter directory and stable company keys across batches.

Small metadata strip: appearance year, Full/Partial coverage, and Selected/Not selected/Result pending. Graduation year and role are optional; remember graduation year privately for future submissions. Google supplies identity, so no separate registration form. Default public attribution to “Community contributor”; offer an explicit choice to display the Google profile name. Never publish email addresses.

Prefill an editable Markdown starter; sections are suggestions, not required answers:

```md
## Rounds I appeared for
<!-- List the stages you personally experienced. -->

## Questions and experience
<!-- What happened? Mention the test/interview format. -->

## Preparation tips
<!-- What helped, and what would you do differently? -->
```

Autosave drafts to the owner's private Firestore document with a visible save indicator. Require metadata and meaningful content beyond the boilerplate, cap body size at 20,000 characters, and show safe Markdown preview. Button: **Submit for review**; confirmation: **Pending approval**. Partial posts clearly identify which rounds were covered. One person can create separate experiences for multiple companies/attempts.

## 3. Architecture and data

Keep **React + TypeScript + Vite + Firebase Auth/Firestore**. Add Firebase Functions (TypeScript) for trusted mutations and email delivery, plus `react-markdown`/`remark-gfm` for rendering with raw HTML disabled and safe link protocols.

| Collection | Purpose / access |
| --- | --- |
| `procedureCompanies/{companyKey}` | Readable company catalog seeded from the existing campus directory; trusted writes only. |
| `procedureSubmissions/{id}` | Private owner draft, metadata, state, review feedback and latest revision number; owner/admin reads. |
| `procedureSubmissions/{id}/revisions/{revision}` | Immutable submitted snapshots; owner/admin reads. |
| `procedurePosts/{id}` | Approved snapshot and vote totals only; signed-in reads, server writes. |
| `procedurePosts/{id}/votes/{uid}` | One vote per reader (`-1` or `+1`); owner/admin reads, server writes. |
| `procedureModeration/{eventId}` | Audit trail and admin inbox; admin reads, server writes. |
| `procedureEmailOutbox/{eventId}` | Private delivery status, retries and deduplication for admin emails. |
| `procedurePreferences/{uid}` | Owner-only remembered graduation year; server writes. |

Callable functions: `saveProcedureDraft`, `submitProcedure`, `reviewProcedure`, `unpublishProcedure`, `setProcedureVote`. Validate verified Google identity, ownership/admin claims, schema and company key on the server. Enforce draft/submission/vote throttles and prevent self-votes. Draft saves also use version checks through Functions; rules deny all direct client mutations to community collections.

**Lifecycle:** Draft → Pending → Approved / Changes requested / Rejected. Feedback enables revision and resubmission. Pending revisions are locked; review targets an exact revision. Editing an approved post creates a new draft revision while readers retain the last approved snapshot. Approval transactionally replaces that snapshot and records the review. Unpublishing removes reader access immediately. Retry-safe submissions/reviews create one event per revision/action.

**Voting:** a transaction reads the reader's previous vote and updates vote/totals together. Clicking the same vote removes it; switching changes it. Preserve votes across approved edits; display that approval is content review, not factual verification. Sort by Newest or Helpful (net votes), with cursor pagination and matching Firestore indexes.

## 4. Admin email and dashboard

- Extend `scripts/set-role.ts` to resolve an existing, verified Google account by `--email`, then assign the existing `role: admin` custom claim using trusted Admin SDK credentials. First sign-in must happen before assignment; refresh the token afterward. Support revocation. No frontend email allowlist or self-service promotion.
- Store notification recipients in private server configuration (`PROCEDURE_ADMIN_EMAILS`); keep the mail-provider API key in Secret Manager. Recipients and admin permissions are separate settings.
- Submission creates the admin inbox event and email-outbox entry atomically. A Functions worker sends email through Resend with retry/deduplication and an authenticated dashboard link. Email failure never loses the submission; the queue and unread badge remain available. Configure sender-domain verification before enabling real emails.
- Add `#admin/procedures`: Pending / Reviewed tabs, full Markdown preview, metadata, review history, feedback box and action buttons. Server authorization applies even when someone bypasses the route guard.

## 5. Implementation order and release gate

1. Add shared Zod schemas, company-catalog seed, Functions package, private draft rules, indexes and role/email setup.
2. Build trusted submission, moderation, voting and notification functions; test authorization and lifecycle using isolated emulators.
3. Replace `Procedures` placeholders with browse/detail/editor views; wire My Account contributions and the admin dashboard into `App.tsx`/routing. Use `#procedures/<postId>` for details and reserved `#procedures/contribute` for the editor.
4. Add desktop/mobile browser coverage: draft recovery, submit → approve → visible, requested changes/resubmission, safe Markdown, vote toggle/switch and unauthorized access. Verify concurrent votes, stale reviews, private-field isolation, email retries and unpublishing in backend/rules tests. Run build and existing regression suites.
5. Deploy Functions, rules/indexes and frontend; seed the catalog, assign the chosen admin, configure email and smoke-test with separate contributor/admin accounts. Functions/email need deployment credentials, an eligible billing plan and a verified sender. Supply these once before the implementation run; document exact setup commands and rollback.

**Beta complete:** a contributor submits with minimal friction; an admin is notified and reviews it; only approved content reaches readers; votes persist correctly; revisions stay private until approved. Empty/loading/error states and keyboard/mobile access work. Comments, attachments, alumni verification and off-campus company additions are deferred.
