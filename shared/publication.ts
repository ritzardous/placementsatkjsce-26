import { z } from 'zod';
import { announcementSchema } from './dataset.js';
import type { DashboardResponse } from './statistics.js';

const rank = z.object({ label: z.string(), value: z.number().nonnegative() });
const nullableNumber = z.number().nullable();
const candidate = z.object({
  name: z.string(), roll: z.string(), branch: z.string(), role: z.string(), company: z.string(), companyKey: z.string(), companyType: z.string(),
  ctc: nullableNumber, ctcText: z.string().nullable(), date: z.iso.date().nullable(), placementId: z.string(), campus: z.enum(['On campus', 'Off campus']).optional(),
});
const batch = z.object({ year: z.number().int(), registeredStudents: nullableNumber, registrationSource: z.string(), degreeScope: z.string(), ctcWeighting: z.literal('selection').optional() });
const summary = z.object({
  announcements: z.number().int().nonnegative(), selections: z.number().int().nonnegative(), reportedHires: z.number().int().nonnegative(),
  uniqueStudents: z.number().int().nonnegative(), multiSelectedStudents: z.number().int().nonnegative(), companies: z.number().int().nonnegative(),
  highestCtc: nullableNumber, avgCtc: nullableNumber, medianCtc: nullableNumber, ctcCoverage: z.number().int().nonnegative(),
  reportedCounter: nullableNumber, placementRate: nullableNumber, notConfirmedPlaced: nullableNumber,
  firstDate: z.iso.date().nullable(), latestDate: z.iso.date().nullable(), multiBranchCompanies: z.number().int().nonnegative(), techCompanies: z.number().int().nonnegative(),
});
export const dashboardSchema = z.object({
  metadata: z.record(z.string(), z.unknown()),
  statistics: z.object({
    batch, summary, candidates: z.array(candidate), roles: z.array(rank), types: z.array(rank), branchRanking: z.array(rank), months: z.array(rank), histogram: z.array(rank),
    companies: z.array(z.object({
      key: z.string(), name: z.string(), type: z.string(), announcements: z.array(announcementSchema), totalHired: z.number(), highestCtc: nullableNumber,
      roles: z.array(z.string()), branches: z.array(z.string()), firstDate: z.iso.date().nullable(), lastDate: z.iso.date().nullable(),
    })),
    branches: z.array(z.object({
      branch: z.string(), candidates: z.array(candidate), selections: z.number(), uniqueStudents: z.number(), companiesCount: z.number(),
      avgCtc: nullableNumber, medianCtc: nullableNumber, highestCtc: nullableNumber, ctcCoverage: z.number(), companyRanking: z.array(rank), roleRanking: z.array(rank), histogram: z.array(rank), pctOfTotal: z.number(),
    })),
    timeline: z.array(z.object({ id: z.string(), date: z.iso.date(), company: z.string(), companyKey: z.string(), hired: z.number(), selections: z.number(), uniqueStudents: z.number(), reportedCumulative: nullableNumber, ctc: nullableNumber })),
  }),
});
export function parseDashboard(value: unknown): DashboardResponse { return dashboardSchema.parse(value); }
export const manifestSchema = z.object({ year: z.number().int(), activeVersion: z.string().regex(/^[a-f0-9]{64}$/) });
export const versionSchema = z.object({ schemaVersion: z.literal(1), chunkCount: z.number().int().min(1).max(128), payloadHash: z.string().regex(/^[a-f0-9]{64}$/) });
export function chunkId(index: number) { return `chunk-${String(index).padStart(4, '0')}`; }
