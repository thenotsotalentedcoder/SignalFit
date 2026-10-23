import { NextResponse } from 'next/server';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';

export async function GET() {
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  return withUser(s.user_id, async (c) => NextResponse.json({ saved: (await c.query('select sv.status,sv.note,sv.dismiss_reason,sv.updated_at,o.id as opportunity_id,o.title,o.eligibility,o.computed_score,o.run_id from saved_opportunities sv join opportunities o on o.id=sv.opportunity_id where sv.owner_id=$1 order by sv.updated_at desc', [s.user_id])).rows }));
}
