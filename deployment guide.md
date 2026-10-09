# Deploy Placement Stats KJSCE

Use [4amchanges.md](4amchanges.md) for the current, ordered production setup and testing checklist.

The Company Procedures release uses Vercel for the frontend and `/api/procedures`, with Firebase Authentication and Firestore on the existing Spark project `placement-stats-kjsce`.

Configure both the public Firebase web variables and the private, server-only `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT_JSON` variables described in that checklist. Keep private keys outside Git and never prefix server credentials with `VITE_`.

Push the updated code to the Vercel production branch, then wait for its deployment to show **Ready**. If variables change afterward, redeploy the latest commit. No Firebase billing upgrade or Cloud Functions deployment is required.
