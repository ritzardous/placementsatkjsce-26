# Landing, Google login and navigation

Implemented flow: **public landing → Google login → Home → placement year or community section**.

- `#landing`: public product introduction; Google sign-in is the only offered login method.
- `#login`: Google login. Opening a protected deep link while signed out displays this screen without changing that link; after authentication the original destination opens.
- `#home`: year choices and a separate Company Procedures entry.
- `#statistics`: dedicated year chooser. Existing `#overview`, `#2025/...` and `#2027/...` routes remain supported after login.
- `#procedures`: Browse. It stays empty until approved content exists.
- `#procedures/contribute`: searchable directory of source-backed campus recruiters from all three batches, including the live season. Off-campus-only employers are excluded. Companies are joined only by their normalized source keys; shared logos do not merge subsidiaries. Forms and publication are upcoming.
- `#alumni` and `#contributions`: explicit upcoming destinations; no fabricated profiles, procedures or submissions.

## Access policy

The shared Auth provider checks the Firebase session before protected pages mount. Only verified Google sessions qualify. Firebase browser session persistence handles reloads; logout unmounts protected pages and clears their React state. The repository also checks the session before its first Firestore read. No persistent offline dataset cache is introduced.

The updated `firestore.rules` requires a verified Google sign-in token for active batch manifests, versions, chunks and owner profiles. Inactive versions, private imports, future community collections and client publication writes remain denied. A client route guard alone is insufficient: these rules must also be published.

Read-only Firebase account audit on 8 October 2026 found **2 accounts, both with Google, 0 password-only accounts**. No users, roles, or provider settings were changed. Password UI has been removed. If a future account conflict occurs, link the Google credential to the existing account through an authenticated migration flow; do not delete the user or replace their UID. See [Firebase account linking](https://firebase.google.com/docs/auth/web/account-linking). Keep Email/Password provider changes separate from this release unless a fresh audit confirms no affected users.

## Activate on the deployed app

1. Push the tested frontend and let Vercel redeploy. The existing Firebase web environment variables stay the same.
2. Firebase Console → Authentication → Sign-in method: confirm **Google** is enabled. Under Settings → Authorized domains, confirm your actual Vercel hostname and development hostnames are listed.
3. Sign in with Google on the new deployment and confirm the three year choices work.
4. Publish the new access rules: Firebase Console → Firestore Database → Rules → replace the editor with this repository's `firestore.rules` → **Publish**. Alternatively run GitHub Actions → **Firebase cloud data and rules** → action **rules**. This updates rules without reimporting batches.
5. In a fresh incognito window, confirm the landing opens, `#2027/overview` asks for Google login, and after login it returns to that live year. Confirm sign-out prevents access again.

The frontend and rules have been changed in this checkout. This task does not publish the frontend or change the live project's rules. Until step 4, the live Firestore rules still permit the previous public data access policy.

## Test checklist

1. Visit `/` signed out: landing, available stats, upcoming community content and privacy note are visible; no batch documents are requested.
2. Continue with Google: choose your account; Home appears. Cancel the popup: useful feedback appears and retry stays available.
3. Open each year card: original search, filtering, detail pages, charts, candidates and timelines remain available. Class of 2027 retains LIVE and source freshness notices.
4. From a dashboard, use the App navigation to return to Home or Company Procedures. Browse contains no unapproved entries. Contribute lists campus recruiters and supports company search.
5. Reload a protected company page: the Google session persists. Test browser back/forward and year changes.
6. Account → Sign out: landing appears; protected links ask for login and protected content is removed.
7. Test phone and desktop widths with keyboard navigation.

Automated checks: `npm test`, `npm run build`, and `npm run test:firebase`. The last command uses isolated, seeded test emulators only; the actual application continues using cloud Firebase. Set `E2E_PORT=5174` if the normal development server already occupies 5173. `npm run auth:verify -- --project placement-stats-kjsce --allow-production` checks public routing and anonymous Firestore denial against the cloud project after the new rules are published; actual Google OAuth is checked with your own account manually.

Verified for this release: production build, **20 unit checks**, **9 Firestore access/import checks**, and **20 browser checks across desktop and mobile**. Reviewed landing, login, Home and Contribute screenshots. Public-page checks also ran against the real cloud configuration and confirmed zero placement reads before login.
