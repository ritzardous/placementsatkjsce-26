# Deploy Placement Stats KJSCE

**Already done:** the repository is disconnected from the old Vercel project. Leave that project as it is.

Follow these steps in order. Reuse Firebase project **`placement-stats-kjsce`** and its imported data.

## 1. Push the React app to GitHub

Open a terminal in this repository:

```powershell
npm run build
git add .
git diff --cached --name-only
```

Check the filenames: **do not commit `.env` or Firebase Admin/service-account JSON**. The existing `.gitignore` excludes them. You should see the new source, logo, configuration, and package files.

If the build passed and the staged files look correct:

```powershell
git commit -m "Migrate placement dashboard to React and Firebase"
git push origin main
```

## 2. Create the new Vercel project

Open [Vercel](https://vercel.com/new) → import this GitHub repository.

| Setting | Enter |
| --- | --- |
| Project name | `placements-kjsce` — choose another if unavailable |
| Framework preset | **Vite** |
| Root directory | Leave the repository-root default |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

The checked-in `vercel.json` already contains the Vite build/output settings.

## 3. Add environment variables and deploy

Before clicking **Deploy**, expand **Environment Variables**:

| Name | Value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Copy your Firebase **web** API key from local `.env` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `placement-stats-kjsce.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `placement-stats-kjsce` |
| `VITE_FIREBASE_APP_ID` | `1:1025550734268:web:e5887fd8d7e1123a2dd1b9` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `placement-stats-kjsce.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1025550734268` |
| `VITE_USE_FIREBASE_EMULATORS` | `false` |

Use raw values without quotation marks. Set these for **Production and Preview** if environment selection is offered.

**Do not copy `GOOGLE_APPLICATION_CREDENTIALS`, Admin JSON, or MongoDB credentials into Vercel.** Only Firebase's web configuration is needed.

Click **Deploy**. Once the project exists, confirm **Settings → Build and Deployment → Node.js Version = `22.x`**. If you change this or any environment variable after the build, open **Deployments → latest deployment → Redeploy**.

Optional: add `VITE_GA_ID=G-QK3FD7FTJC` for **Production only**, then redeploy to enable analytics.

## 4. Allow the new URL in Firebase

In Vercel, open **Settings → Domains** and copy the actual production hostname. Ideally it is `placements-kjsce.vercel.app`; use whichever address Vercel assigned.

Open [Firebase Console](https://console.firebase.google.com/project/placement-stats-kjsce/overview):

1. **Authentication → Settings → Authorized domains → Add domain**.
2. Paste the hostname only, e.g. `placements-kjsce.vercel.app` — no `https://` or `/`.
3. Save. Keep `VITE_FIREBASE_AUTH_DOMAIN` as `placement-stats-kjsce.firebaseapp.com`.

Email/Password and Google should already be enabled. If a provider is disabled, enable it under **Authentication → Sign-in method**.

## 5. Test and share

Open the new production URL in an incognito window:

- [ ] It opens publicly without a Vercel login screen.
- [ ] Both years load: **2025 = 360 selections / 323 students**; **2026 = 311 selections / 299 students**.
- [ ] Company logos, search, company details, and mobile layout work.
- [ ] Google sign-in and sign-out work.
- [ ] Refreshing `/#2025/companies` works.

If those pass, share the new URL. **No Firestore re-import, Firebase Hosting deployment, or GitHub Firebase secrets are needed for this website release.**

## Quick fixes

| Problem | Fix |
| --- | --- |
| Missing Firebase configuration / blank page | Check **Production** environment variables, then redeploy |
| `auth/unauthorized-domain` | Add the exact live hostname in Firebase Auth |
| Firestore permission error | Confirm project ID is `placement-stats-kjsce`; retain the reviewed rules |
| Old HTML appears | Check Vite preset, repository root, latest commit, and output `dist` |
| Build fails | Read the first actual build error; confirm Node `22.x` |

Future pushes to `main` deploy automatically to the new project. Keep the old URL unchanged until you decide to redirect it.
