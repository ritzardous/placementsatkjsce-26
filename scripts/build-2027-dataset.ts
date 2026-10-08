import { readFile, writeFile } from 'node:fs/promises';
import { datasetSchema } from '../shared/dataset.js';

const base = new URL('../data/sources-2027/', import.meta.url);
const placements = JSON.parse(await readFile(new URL('reviewed-announcements.json', base), 'utf8'));
const sourceManifest = JSON.parse(await readFile(new URL('source-manifest.json', base), 'utf8'));
const dataset = datasetSchema.parse({ metadata: {
  academic_year: '2026–27', graduation_year: 2027, degree_scope: 'UG', season_status: 'ongoing',
  source_manifest: sourceManifest, source_updated_at: sourceManifest.latest_email_at,
  extraction_notes: [
    'Ongoing placement season: this is the supplied email snapshot, not an automatic real-time email feed. Latest included email: 8 October 2026; latest declared result: 6 October 2026.',
    'All 22 announcements and 121 candidate rows were transcribed from the 16-page image-based PDF and checked visually. Source file and page references are retained for each announcement.',
    'The final sourced TPO counter is 121. Candidate selections and distinct roll numbers independently reconcile to 121; no milestone poster is counted as a separate result.',
    'Registration total is absent, so placement rate and unplaced count remain unavailable. Branch labels, including AI & DS, CCE, EXCP and RAI, follow the printed tables rather than older-batch branch assumptions.',
    'TCS Prime/Digital, KPMG, and Deloitte announcements contain mixed CTC bands and have no single numerical announcement CTC. Their source package text and role groups are preserved; these 52 selections are excluded from numerical compensation statistics.',
    'Average and median overview CTC remain announcement-weighted, consistent with the 2026 email dashboard. Branch CTC is selection-weighted; both exclude mixed/unknown numerical CTC. These are not official college averages.',
    'StoneX/Stonex and Tata Consultancy Services/TCS are reviewed aliases within this batch. Other source company labels are preserved. No company type, role, registration denominator, or individual package is inferred externally.',
    'Think 360 prints 09:50 LPA, Transbnk 10:00 LPA, and LogiNext 11:00 LPA. They are transcribed numerically as 9.50, 10.00, and 11.00 LPA, with the original strings and notes retained.',
    'Dates use the declared result date, not the later email send date or PDF export date. Future email updates must be reviewed, deduplicated, rebuilt, and published as a new immutable Firestore version.',
  ],
}, placements });
let cumulative = 0;
for (const p of dataset.placements) {
  cumulative += p.candidates.length;
  if (p.hiring.students_hired !== p.candidates.length || p.hiring.placement_count !== cumulative) throw new Error(`Source counter reconciliation failed at ${p.placement_id}`);
}
await writeFile(new URL('../data/placements-2027.json', import.meta.url), JSON.stringify(dataset, null, 2) + '\n');
console.log(`Built ${dataset.placements.length} reviewed announcements, ${cumulative} selections.`);
