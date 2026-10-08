# React + Firebase architecture

- React/Vite preserves all dashboard routes for each selected graduation year. `src/repository.ts` reads the year's cloud manifest, active version metadata, and immutable Firestore chunks (four for 2026, six for 2025). It verifies SHA-256 and validates the complete schema before rendering.
- Trusted scripts calculate metrics, preserve private original records under `imports`, reconcile the public snapshot under `batches/{year}/versions`, then activate it. The year selector and hash routes keep links and browser history scoped to that dataset.
- Batch 2025 (AY 2024–25) uses the final UG report's 360 rows, enriched by exact roll/employer matches to the two email PDFs. Campus status and source discrepancies are visible. Unknown dates are excluded from time charts, unknown compensation from CTC metrics, and no registration denominator is guessed. Its overall CTC metrics are selection-weighted; legacy 2026 calculations remain unchanged. See `2025-data-audit.md`.
- Firebase Auth supplies optional Google/email accounts, verification, password reset, persisted sessions, and sign-out. Public browsing remains ungated.
- Security rules permit reads of the active public snapshot, deny collection listing and browser publication writes, keep imports private, and allow only owner display-name profile writes. Other collections and unused Storage are denied.
- Admin credentials are used only in trusted setup scripts, outside Git and frontend bundles. No Express, MongoDB, Render service, or Firebase Functions serves the dashboard.
- Local development uses real cloud Firebase. Isolated emulators are test infrastructure only.
- Missing compensation, corrections, source references, and other extraction anomalies remain documented. Original HTML and JSON are preserved.
- Static hosting configuration exists, but GitHub/Vercel and future community features are deferred.
