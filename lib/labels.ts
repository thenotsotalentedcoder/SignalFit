export const ELIGIBILITY: Record<string, { label: string; badge: string; help: string }> = {
  recommended: { label: 'Recommended', badge: 'badge-ok', help: 'Dated work from at least two employers plus an inspected context page.' },
  discovery_lead: { label: 'Single-company lead', badge: 'badge-warn', help: 'Only one employer, or undated evidence. Worth a look, not a recommendation.' },
  conditional: { label: 'Conditional', badge: 'badge-warn', help: 'A stated constraint conflicts with this work.' },
  excluded: { label: 'Excluded after critique', badge: 'badge-neutral', help: 'The critique pass found the evidence does not support it.' },
  insufficient_evidence: { label: 'Insufficient evidence', badge: 'badge-neutral', help: 'Not enough supported evidence to suggest anything.' }
};
export const DIMENSIONS: Record<string, string> = { capabilities: 'Match to confirmed capabilities (30%)', pastWork: 'Relevance of past work (20%)', capacity: 'Capacity and delivery fit (20%)', demand: 'Strength and recency of demand (20%)', market: 'Preferred market and engagement (10%)' };
export const day = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : 'date unknown');
export const STATUS_LABEL: Record<string, string> = { saved: 'Saved', worth_investigating: 'Worth investigating', dismissed: 'Dismissed' };
