# 2024–25 data reconciliation and missing inputs

## Source and scope

- Final UG report: 8 pages, 360 selection rows, 323 distinct roll numbers. Every row is retained exactly in `data/sources-2025/report-rows.json`.
- Email parts: 49 and 5 pages, 111 messages. Image-only PDFs were rendered and read using Windows OCR; layout-sensitive cells, split rows, mixed-degree CTC, and discrepancies were visually reviewed.
- 284 report rows matched emails by exact roll and a reviewed employer alias. These enrich existing report rows rather than add duplicate offers.
- 12 email-only candidate rows are absent from the UG report and are excluded from this UG view. Some tables explicitly identify M.Tech; degree is not guessed for other unmatched rows.
- Campus status follows the explicit report column: 331 on campus, 29 off campus. Parenthetical PPO/O labels are retained and contradictory labels flagged.
- CTC follows the final report; email disagreements are displayed rather than overwritten. Average/median are selection-weighted over 353 known report values, not a claimed official college average.
- Registered-student total is absent. No placement rate or unplaced count is invented. Source cumulative counters are absent.
- Dates come only from matched result-declared fields. Email send dates, season boundaries, and PDF print dates are never substituted.
- Report-only rows are grouped by company/campus/exact CTC for display; 167 groups are not presented as 167 email announcements.

## Missing result dates

77 selections are undated (76 report-only rows plus the Holcim email, which has no declared-date field). These rows remain in every roster/total but not dated charts. Please supply original result announcements or another dated source to fill them.

| Employer | Report row(s) | Report page(s) |
|---|---|---|
| 360 ONE | 244 | 5 |
| Accelya Group | 204, 213, 206 | 5 |
| Accenture | 293 | 6 |
| Aegis Graham Bell Awards | 311, 312 | 7 |
| Affix Centre | 347 | 8 |
| Amazon India | 97, 98 | 2 |
| Arora Technologies (P) Limited | 344 | 8 |
| Astrico AI | 253 | 6 |
| Bajao international | 138 | 3 |
| Beyond Automation Pvt. Ltd. | 352, 353 | 8 |
| Bharat Fritz Werner Limited | 320 | 7 |
| Brokentusk Technologies pvt Ltd. | 64 | 2 |
| Browserstack | 5, 6 | 1 |
| C-Prav Labs pvt. ltd. | 294 | 6 |
| CCS INC | 65 | 2 |
| CRISIL | 354 | 8 |
| Capgemini | 224, 238 | 5 |
| Cisco Systems (India) Private Limited | 45, 46 | 1 |
| Cityflo | 144 | 3 |
| Cogitate Technology | 146 | 3 |
| Colgate | 137 | 3 |
| CrackedDevs | 4 | 1 |
| Crisil Intelligence | 215 | 5 |
| Deloitte India | 360 | 8 |
| Emergence | 61 | 2 |
| Framatome Pvt. Ltd. | 305 | 7 |
| Goldman Sachs | 2, 3 | 1 |
| HSBC | 107 | 3 |
| Hansa Customer Equity Pvt. LTD. | 348 | 8 |
| Holcim Global Digital Hub | 255 | 6 |
| Hyperverge | 20, 26, 42 | 1 |
| ImpactGuru | 321 | 7 |
| Infytrix Ecom Pvt. Ltd | 340 | 7 |
| Intrade | 355, 356 | 8 |
| Investec Global Services (India) Private Limited | 67 | 2 |
| Jeavio India Pvt. Ltd. | 129 | 3 |
| KPMG | 296 | 7 |
| Kalki Fashion | 358, 359 | 8 |
| Mahindra & Mahindra | 335, 336 | 7 |
| Matrix Medicals | 309, 310 | 7 |
| NCSI Technologies (India) Private Limited | 223 | 5 |
| Nagarro Software | 315 | 7 |
| Pay Nearby | 191 | 4 |
| Pravaayu | 256, 260, 272, 276 | 6 |
| Reliance Industries Limited. | 186 | 4 |
| RippleHire | 343 | 7 |
| Senergy Intellution Pvt. Ltd. | 345 | 8 |
| Spay Fintech Pvt.Ltd. | 351 | 8 |
| Sunjewels Private Limited | 304 | 7 |
| Sutherland | 349 | 8 |
| Synergetics Information Technology Services India Pvt. Ltd. | 317 | 7 |
| TCS Ninja | 346 | 8 |
| Tata trent | 314 | 7 |
| Tekgeminus Solutions Ltd | 52 | 2 |
| Toshniwal Industries PVT ltd. | 350 | 8 |
| Transpure Solutions Pvt. Ltd. | 131 | 3 |
| nStore Retech Pvt Ltd | 187, 188 | 4 |
| watsun Infrabuild Pvt. Ltd. | 357 | 8 |

## Compensation marked ND

| Row | Employer | Candidate | Report page |
|---|---|---|---|
| 354 | CRISIL(O) | Ishita Bhatia | 8 |
| 355 | Intrade (O) | Kunal Neeraj Chaturvedi | 8 |
| 356 | Intrade (O) | Aryan Manish Parmar | 8 |
| 357 | watsun Infrabuild Pvt. Ltd.(O) | Karan Vikas Kapadia | 8 |
| 358 | Kalki Fashion (PPO) | Amar Kunvarji Shah | 8 |
| 359 | Kalki Fashion (PPO) | Sejal Sanjay Patil | 8 |
| 360 | Deloitte India(PPO) | Annambhotla Harsheeth Srinivas Bharadwaj | 8 |

## Report/email compensation disagreements

The final report value is displayed. Both values remain in source records and company notes.

| Report row | Employer | Report LPA | Email LPA | Email source and pages |
|---|---|---|---|---|
| 27 | Nouryon Chemicals(PPO) | 15.51 | 15.5 | 25batchemailthread-2.pdf: 2, 3 |
| 35 | Browserstack (PPO) | 14.52 | 14.56 | 25batchemailthread.pdf: 42, 43 |
| 36 | Barclays (PPO) | 14 | 12.67 | 25batchemailthread.pdf: 4 |
| 37 | Barclays (PPO) | 14 | 12.67 | 25batchemailthread.pdf: 4 |
| 39 | Barclays(PPO) | 14 | 12.67 | 25batchemailthread.pdf: 4 |
| 50 | Sharekhan limited | 12 | 10 | 25batchemailthread.pdf: 9 |
| 51 | Sharekhan limited | 12 | 10 | 25batchemailthread.pdf: 9 |
| 62 | Sharekhan limited | 12 | 10 | 25batchemailthread.pdf: 9 |
| 133 | Jaro Education | 8.96 | 8.48 | 25batchemailthread.pdf: 9, 10 |
| 134 | Jaro Education | 8.96 | 8.48 | 25batchemailthread.pdf: 9, 10 |
| 135 | Jaro Education | 8.96 | 8.48 | 25batchemailthread.pdf: 9, 10 |
| 136 | Jaro Education | 8.96 | 8.48 | 25batchemailthread.pdf: 9, 10 |

## Email-only rows excluded from UG report totals

These remain in the reconciliation log. Do not add them to the UG roster without degree/scope evidence.

| Email event | Employer | Roll | Source and pages |
|---|---|---|---|
| 34 | Accenture | 16030723012 | 25batchemailthread.pdf: 18 |
| 46 | Hike Education | 16031223003 | 25batchemailthread.pdf: 23, 24 |
| 46 | Hike Education | 16030723009 | 25batchemailthread.pdf: 23, 24 |
| 60 | Toyo Engineering | 16031223006 | 25batchemailthread.pdf: 30 |
| 71 | K 12 Techno Pvt. Ltd | 16031223011 | 25batchemailthread.pdf: 35 |
| 74 | Sequretek | 16031023005 | 25batchemailthread.pdf: 36, 37 |
| 74 | Sequretek | 16031023011 | 25batchemailthread.pdf: 36, 37 |
| 75 | Bandhan Asset Management Company | 16034423012 | 25batchemailthread.pdf: 37, 38 |
| 78 | Indospace | 16034423006 | 25batchemailthread.pdf: 38, 39 |
| 79 | Quantum Data Engines | 16030723018 | 25batchemailthread.pdf: 39 |
| 83 | Colgate | 16034423002 | 25batchemailthread.pdf: 41 |
| 93 | HSBC | 16034423007 | 25batchemailthread.pdf: 46 |

## Naming and branch normalization

- Original employer labels, disciplines, names, campus columns, and compensation strings are retained.
- Explicit disciplines map to COMP, IT, ETRX, EXTC, MECH. No branch is derived from a roll number.
- Phase/PPO/O annotations are removed from navigation keys; original labels remain visible on company records. Reviewed spelling aliases combine Logistics Now/LogisticsNow, Mahindra and Mahindra/Mahindra & Mahindra, Reliance/its full label, and Toyo phase II/Toyo Engineering.
- Email JP Morgan matches report JPMC; StoneX matches Stonex; OFSS emails match report Oracle - Phase II, kept separate from Oracle Corporation. Employer identity requires matching source context and roll numbers, not fuzzy student-name matching.
- Report-only employer classification and role remain missing. Roles from merged email cells are assigned only to the rows enclosed by that cell.

## Reproduction and checks

```powershell
npm run data:build-2025
npm test
npm run db:seed -- --year 2025 --dry-run
npm run db:seed -- --year 2025 --project placement-stats-kjsce --allow-production
npm run db:verify -- --year 2025 --project placement-stats-kjsce --allow-production
```

Source PDF filenames/page counts/SHA-256 hashes are recorded in `data/sources-2025/source-manifest.json`. Original PDFs remain in the provided `ps-data` folder; they are not copied into the public frontend.

## Publication and verification

- Published to the real cloud project `placement-stats-kjsce`, independently of the unchanged 2026 snapshot. Full records, metadata, chunks, checksums, metrics, and active version reconciled successfully.
- 38 automated checks pass: 16 unit/source/publication checks, eight import/security checks, and 14 desktop/mobile browser checks including year switching, deep-link refresh, campus filtering, and missing data.
- All routes for both years passed live cloud browser smoke checks at desktop and mobile widths, without browser exceptions, Express requests, or horizontal overflow. Screenshots were reviewed.
