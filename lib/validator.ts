import { weightedFit, type FitScores } from './matching';

export type EvidenceRec = { id: string; runId: string; employer: string | null; publisher: string | null; pageType: string | null; publishedAt: Date | string | null; accessStatus: string };
export type Dimension = { score: number | null; evidenceIds: string[]; note: string };
export type Dimensions = Record<keyof FitScores, Dimension>;
export type Eligibility = 'recommended' | 'discovery_lead' | 'insufficient_evidence';
const DAY = 86_400_000;

/** Only IDs that exist, belong to this run and were actually inspected may be cited. */
export function validateCitations(ids: string[], evidence: Map<string, EvidenceRec>, runId: string) {
  const valid: string[] = []; const rejected: string[] = [];
  for (const id of new Set(ids)) { const e = evidence.get(id); (e && e.runId === runId && e.accessStatus === 'inspected' ? valid : rejected).push(id); }
  return { valid, rejected };
}
export function isRecent(publishedAt: Date | string | null, now = new Date(), days = 30) {
  if (!publishedAt) return false; const t = new Date(publishedAt).getTime();
  return !Number.isNaN(t) && t <= now.getTime() + DAY && now.getTime() - t <= days * DAY;
}
const employerKey = (e: EvidenceRec) => (e.employer || '').trim().toLowerCase();
/** >=2 distinct employers with dated work in last 30 days + >=1 inspected context page; one cited page = discovery lead. */
export function eligibility(cited: EvidenceRec[], allInspected: EvidenceRec[], now = new Date()): Eligibility {
  const dated = new Set(cited.filter((e) => e.pageType === 'job_posting' && employerKey(e) && isRecent(e.publishedAt, now)).map(employerKey));
  const context = allInspected.some((e) => e.pageType === 'company_context' || e.pageType === 'vendor_docs');
  if (dated.size >= 2 && context) return 'recommended';
  return cited.length ? 'discovery_lead' : 'insufficient_evidence';
}
export function scoreDimensions(d: Dimensions) {
  const unknown = (Object.keys(d) as (keyof FitScores)[]).filter((k) => d[k].score === null || d[k].score === undefined);
  const scores = Object.fromEntries((Object.keys(d) as (keyof FitScores)[]).map((k) => [k, d[k].score ?? 0])) as FitScores;
  return { total: weightedFit(scores), unknown };
}
/** "strong" is unreachable while any dimension is unknown or a hard constraint conflicts. */
export function fitLabel(total: number, unknown: string[], conflicts: string[]) {
  if (conflicts.length) return 'conditional';
  if (total >= 75 && !unknown.length) return 'strong';
  return total >= 50 ? 'moderate' : 'weak';
}
