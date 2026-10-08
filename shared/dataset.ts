import { z } from 'zod';

export const candidateSchema = z.object({
  name: z.string().min(1), roll_number: z.string().min(1), branch: z.string().min(1), role: z.string(),
}).passthrough();
export const announcementSchema = z.object({
  placement_id: z.string().min(1),
  company: z.object({ name: z.string(), normalized_name: z.string().min(1), type: z.string() }).passthrough(),
  result: z.object({ declared_date: z.iso.date().nullable(), original_date_text: z.string() }).passthrough(),
  compensation: z.object({ ctc_text: z.string().nullable(), ctc_value_lpa: z.number().nonnegative().nullable(), currency: z.string(), period: z.string() }).passthrough(),
  roles: z.array(z.string()),
  hiring: z.object({ students_hired: z.number().int().nonnegative(), placement_count: z.number().int().nonnegative().nullable() }).passthrough(),
  candidates: z.array(candidateSchema),
  source: z.object({ source_file: z.string(), page: z.number().nullable(), pages: z.array(z.number()), raw_announcement_text: z.string().nullable() }).passthrough(),
  notes: z.string().nullable(),
  campus: z.enum(['On campus', 'Off campus']).optional(),
}).passthrough();
export const datasetSchema = z.object({
  metadata: z.record(z.string(), z.unknown()), placements: z.array(announcementSchema),
}).superRefine((data, ctx) => {
  const ids = new Set<string>();
  data.placements.forEach((p, index) => {
    if (ids.has(p.placement_id)) ctx.addIssue({ code: 'custom', path: ['placements', index, 'placement_id'], message: 'Duplicate announcement ID' });
    ids.add(p.placement_id);
  });
});
export type Announcement = z.infer<typeof announcementSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export interface BatchConfig {
  year: number; registeredStudents: number | null; registrationSource: string; degreeScope: string;
  ctcWeighting?: 'selection';
}
export const batch2026: BatchConfig = {
  year: 2026, registeredStudents: 524, degreeScope: 'B.Tech',
  registrationSource: "T&PO director's mail, 19 September 2025: 524 B.Tech registrants (605 total including 81 M.Tech).",
};
export const batch2025: BatchConfig = {
  year: 2025, registeredStudents: null, degreeScope: 'UG', ctcWeighting: 'selection',
  registrationSource: 'The supplied 2024–25 UG selected-students report does not state the number registered for placements. No denominator is assumed.',
};
export const batches: Record<number, BatchConfig> = { 2025: batch2025, 2026: batch2026 };
