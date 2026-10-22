import { NextResponse } from 'next/server';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';
import { checkOrigin } from '@/lib/guard';

/** Confirms the latest generated/edited version. A profile with open unknowns needs explicit acknowledgement. */
export async function POST(req: Request) {
  const bad = checkOrigin(req); if (bad) return bad;
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Two-factor authentication required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  return withUser(s.user_id, async (c) => {
    const p = await c.query("select version,data from business_profiles where owner_id=$1 and data ? 'summary' order by version desc limit 1", [s.user_id]);
    if (!p.rows[0]) return NextResponse.json({ error: 'Generate a profile from your interview before confirming.' }, { status: 409 });
    const unknowns: unknown[] = p.rows[0].data.unknowns ?? [];
    if (unknowns.length && body.acknowledgeUnknowns !== true) return NextResponse.json({ error: 'Acknowledge the remaining unknowns to confirm an incomplete profile.', unknowns }, { status: 409 });
    await c.query('update business_profiles set confirmed_at=now(),updated_at=now() where owner_id=$1 and version=$2', [s.user_id, p.rows[0].version]);
    return NextResponse.json({ ok: true, version: p.rows[0].version });
  });
}
