import type { PoolClient } from 'pg';
import type { Question } from './interview';

/** Sentinel row: the model (or the user) closed the interview, so no more follow-ups are generated. */
export const CLOSED = '_closed';
export async function loadFollowups(c: PoolClient, owner: string) {
  const r = await c.query('select field,title,hint,choices,addresses from interview_followups where owner_id=$1 order by created_at', [owner]);
  const followups: Question[] = r.rows.filter((x: any) => x.field !== CLOSED).map((x: any) => ({ field: x.field, stage: 'Follow-up', title: x.title, hint: x.hint, choices: x.choices, addresses: x.addresses, optional: true }));
  return { followups, closed: r.rows.some((x: any) => x.field === CLOSED) };
}
