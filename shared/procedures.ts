import { z } from 'zod';

export const procedureStarter = `## Rounds I appeared for
<!-- List the stages you personally experienced. -->

## Questions and experience
<!-- What happened? Mention the test/interview format. -->

## Preparation tips
<!-- What helped, and what would you do differently? -->
`;
export const procedureDraftSchema = z.object({
  companyKey: z.string().max(120),
  appearanceYear: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  graduationYear: z.number().int().min(2000).max(2100).nullable(),
  coverage: z.enum(['Full', 'Partial']),
  outcome: z.enum(['Selected', 'Not selected', 'Result pending']),
  role: z.string().trim().max(100),
  attribution: z.enum(['anonymous', 'name']),
  body: z.string().max(20_000),
}).strict();
export type ProcedureDraft = z.infer<typeof procedureDraftSchema>;
export const submissionSchema = procedureDraftSchema.refine(d => d.companyKey.length > 0, 'Choose a company.').refine(d => meaningfulBody(d.body).length >= 60, 'Write at least 60 characters about your experience beyond the starter headings.');
export function meaningfulBody(body: string) { return body.replace(/<!--[\s\S]*?-->/g, '').replace(/^#{1,6}.*$/gm, '').replace(/\s+/g, ' ').trim(); }
export type ProcedureStatus = 'draft' | 'pending' | 'approved' | 'changes_requested' | 'rejected';
export type ProcedureCompany = { key: string; name: string; years: number[] };
export type ProcedureSubmission = { id: string; ownerUid: string; draft: ProcedureDraft; draftVersion: number; revision: number; status: ProcedureStatus; feedback: string; updatedAt: number; companyName?: string; hasPublished?: boolean };
export type ProcedurePost = ProcedureDraft & { id: string; companyName: string; authorName: string; authorUid: string; revision: number; published: boolean; publishedAt: number; score: number; upvotes: number; downvotes: number };
export const statusLabels: Record<ProcedureStatus, string> = { draft: 'Draft', pending: 'Pending approval', approved: 'Approved', changes_requested: 'Changes requested', rejected: 'Rejected' };
export function initialProcedureDraft(): ProcedureDraft { return { companyKey: '', appearanceYear: new Date().getFullYear(), graduationYear: null, coverage: 'Partial', outcome: 'Result pending', role: '', attribution: 'anonymous', body: procedureStarter }; }
