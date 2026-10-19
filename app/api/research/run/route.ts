import { NextResponse } from 'next/server';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';
import { profileSchema } from '@/lib/contracts';
export async function POST(req: Request) {
  const session = await requireAAL2(); if (!session) return NextResponse.json({ error: 'Two-factor authentication required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (![body.sector, body.geography, body.engagement].every((x) => typeof x === 'string' && x.trim().length > 0)) return NextResponse.json({ error: 'Sector, geography and engagement are required.' }, { status: 400 });
  return withUser(session.user_id, async (c) => {
    const p = await c.query("select data from business_profiles where owner_id=$1 and confirmed_at is not null order by version desc limit 1", [session.user_id]);
    if (!p.rows[0]) return NextResponse.json({ error: 'Confirm your business profile before research.' }, { status: 409 });
    const profile = profileSchema.parse(p.rows[0].data);
    const r = await c.query("insert into research_runs(owner_id,profile_snapshot,sector,geography,engagement) values($1,$2,$3,$4,$5) returning id,stage,status", [session.user_id, profile, body.sector.trim(), body.geography.trim(), body.engagement.trim()]);
    return NextResponse.json({ run: r.rows[0] }, { status: 201 });
  });
}
