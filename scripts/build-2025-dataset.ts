import { readFile, writeFile } from 'node:fs/promises';
import { datasetSchema } from '../shared/dataset.js';

// Input tables and reviewed OCR fields retain original file/page references.
// Regeneration uses only committed source transcriptions, with no external lookup.
const base = new URL('../data/sources-2025/', import.meta.url);
const read = async (name: string) => JSON.parse(await readFile(new URL(name, base), 'utf8'));
interface ReportRow { serial: number; name: string; roll: string; discipline: string; year: string; campus: string; employer: string; ctc: string; page: number; }
interface EmailEvent { id: number; company: string; company_key: string; source_file: string; pages: number[]; declared_date: string | null; date_text: string; ctc_value_lpa: number | null; ctc_text: string; type: string; roll_numbers: string[]; role: string; candidate_roles: Record<string, string>; }
const rows: ReportRow[] = await read('report-rows.json');
const events: EmailEvent[] = await read('reviewed-email-events.json');
const sourceManifest = await read('source-manifest.json');
if (rows.length !== 360 || rows.some((r, i) => r.serial !== i + 1 || r.year !== '2025')) throw new Error('Official report completeness/year reconciliation failed.');
const aliases: Record<string, string> = {
  'Edelweiss � Global Markets': 'Edelweiss Global Markets', 'Logistics Now': 'LogisticsNow',
  'Mahindra and Mahindra': 'Mahindra & Mahindra', 'Reliance': 'Reliance Industries Limited.', 'Toyo': 'Toyo Engineering',
};
function cleanCompany(name: string) {
  if (name.startsWith('Oracle - Phase II')) return 'Oracle Financial Software Services Ltd.';
  const plain = name.replace(/\s*\((PPO|O)\)/gi, '').replace(/\s*[- ]*phase\s+(II|IV)\b/gi, '').replace(/\s+PPO$/i, '').trim();
  return aliases[plain] ?? plain;
}
const companyKey = (name: string) => cleanCompany(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const branches: Record<string, string> = { 'Computer Engineering': 'COMP', 'Information Technology': 'IT', 'Electronics Engineering': 'ETRX', 'Electronics and Telecommunication': 'EXTC', 'Mechanical Engineering': 'MECH' };
const groups = new Map<string, { rows: ReportRow[]; email: EmailEvent | undefined }>();
const conflicts: { serial: number; reportCtc: string; emailCtc: number; sourceFile: string; pages: number[] }[] = [];
const unmatched = events.flatMap(e => e.roll_numbers.filter(roll => !rows.some(r => r.roll === roll && companyKey(r.employer) === e.company_key)).map(roll => ({ event: e.id, company: e.company, roll, source_file: e.source_file, pages: e.pages })));
for (const r of rows) {
  if (!branches[r.discipline] || !['On Campus Placement', 'Off Campus Placement'].includes(r.campus)) throw new Error(`Unknown report field in row ${r.serial}.`);
  const matches = events.filter(e => e.roll_numbers.includes(r.roll) && e.company_key === companyKey(r.employer));
  if (matches.length > 1) throw new Error(`Ambiguous email match for report row ${r.serial}; review rather than guess.`);
  const email = matches[0];
  const groupKey = JSON.stringify([companyKey(r.employer), r.campus, r.ctc, email?.id ?? null]);
  const group = groups.get(groupKey) ?? { rows: [], email };
  group.rows.push(r); groups.set(groupKey, group);
  if (email?.ctc_value_lpa !== null && email?.ctc_value_lpa !== undefined && r.ctc !== 'ND' && Number(r.ctc) !== email.ctc_value_lpa) conflicts.push({ serial: r.serial, reportCtc: r.ctc, emailCtc: email.ctc_value_lpa, sourceFile: email.source_file, pages: email.pages });
}
const placements = [...groups.values()].map(({ rows: records, email }, i) => {
  const first = records[0];
  const ctc = first.ctc === 'ND' ? null : Number(first.ctc);
  if (ctc !== null && !Number.isFinite(ctc)) throw new Error('Invalid report compensation.');
  const pages = [...new Set(records.map(r => r.page))].sort((a, b) => a - b);
  const issues = [];
  if (!email) issues.push('No matching email result found by roll number and employer. Date and role remain unavailable.');
  else if (!email.declared_date) issues.push('The matched email does not state a result date. The send date is not substituted.');
  if (ctc === null) issues.push('The final report marks CTC as ND; numerical CTC remains missing.');
  const changed = conflicts.filter(c => records.some(r => r.serial === c.serial));
  if (changed.length) issues.push(`Compensation disagreement: final report ${first.ctc} LPA; matched email ${email?.ctc_value_lpa} LPA. Displayed compensation follows the final report; both source values are retained.`);
  if (records.some(r => r.campus === 'On Campus Placement' && /\(O\)/i.test(r.employer))) issues.push('The report says On Campus Placement, but the employer label contains (O). Campus status follows the explicit column; this discrepancy is unresolved.');
  if (email?.company === 'Google' && first.campus === 'Off Campus Placement') issues.push('The email labels Google as PPO; the final report labels this selection Off Campus Placement. Campus status follows the final report.');
  return {
    placement_id: `Y25-${String(i + 1).padStart(4, '0')}`,
    company: { name: cleanCompany(first.employer), normalized_name: companyKey(first.employer), type: email?.type ?? 'Not provided' },
    result: { declared_date: email?.declared_date ?? null, original_date_text: email?.date_text ?? '' },
    compensation: { ctc_text: ctc === null ? 'ND (not disclosed in report)' : `${first.ctc} LPA`, ctc_value_lpa: ctc, currency: 'INR', period: 'year' },
    roles: [...new Set(records.map(r => email?.candidate_roles[r.roll] ?? email?.role ?? '').filter(Boolean))],
    hiring: { students_hired: records.length, placement_count: null },
    candidates: records.map(r => ({ name: r.name, roll_number: r.roll, branch: branches[r.discipline], role: email?.candidate_roles[r.roll] ?? email?.role ?? '', report_serial: r.serial, original_discipline: r.discipline })),
    campus: first.campus === 'On Campus Placement' ? 'On campus' : 'Off campus',
    source: { source_file: '24-25+Students+List.pdf', page: pages[0], pages, raw_announcement_text: null, report_rows: records, ...(email ? { email: { ...email, role: email.role } } : {}) },
    record_kind: email ? 'report rows with matched email' : 'report-only grouped rows',
    notes: issues.length ? issues.join(' ') : null,
  };
});
const datedRows = placements.filter(p => p.result.declared_date).reduce((n, p) => n + p.candidates.length, 0);
const unknownRoles = placements.reduce((n, p) => n + p.candidates.filter(c => !c.role).length, 0);
const dataset = datasetSchema.parse({ metadata: {
  academic_year: '2024–25', graduation_year: 2025, degree_scope: 'UG',
  source_manifest: sourceManifest, authoritative_roster: '24-25+Students+List.pdf',
  source_report_rows: 360, source_unique_students: 323, on_campus_selections: 331, off_campus_selections: 29,
  dated_selections: datedRows, undated_selections: 360 - datedRows, missing_role_selections: unknownRoles,
  compensation_conflicts: conflicts, excluded_email_rows: unmatched,
  extraction_notes: [
    'The final UG report is the authoritative roster: 360 selection rows, 323 unique roll numbers, 331 on-campus and 29 off-campus rows. Multiple offers are retained; email matches do not add duplicate selections.',
    'Both image-based email PDFs were OCR-extracted. Matches require an exact roll number and a reviewed employer alias; ambiguous cells were checked visually. Original report fields and email references are retained on each placement record.',
    'The emails include postgraduate selections. Email-only rows not found in this UG report are excluded from this UG view and retained in the reconciliation log; no degree or candidate is invented.',
    `${360 - datedRows} selections have no confirmed result date; they remain in the roster and totals but are excluded from timeline and monthly charts. Email send dates are never substituted.`,
    `${unknownRoles} selections have no confirmed role. Missing roles and employer types are not inferred from other hires or external websites.`,
    'Seven report rows mark CTC ND and remain numerically missing. Compensation follows the final report; differing email values are flagged on the affected company records.',
    'Average, median, and overall CTC distribution are calculated per report selection row with known compensation (not unique-student highest offers or a college-published average). Unlike 2026, this report includes off-campus offers; compare years with that coverage difference in mind.',
    'Registration total and source cumulative placement counter are absent. Placement rate, unplaced count, and TPO cumulative counter remain unavailable.',
    'Report-only rows are grouped by employer, campus status, and exact reported CTC for display. These are placement records, not invented dated hiring announcements. Phase/PPO/O labels are retained in the original report rows; reviewed aliases support company navigation.',
  ],
}, placements });
await writeFile(new URL('../data/placements-2025.json', import.meta.url), JSON.stringify(dataset, null, 2) + '\n');
console.log({ reportRows: rows.length, publishedSelections: placements.reduce((n, p) => n + p.candidates.length, 0), records: placements.length, datedRows, unknownRoles, conflicts: conflicts.length, excludedEmailRows: unmatched.length });
