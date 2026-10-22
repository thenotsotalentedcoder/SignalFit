import { NextResponse } from 'next/server';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';
import { checkOrigin } from '@/lib/guard';

const uuid = /^[0-9a-f-]{36}$/i; const STATUSES = ['saved', 'worth_investigating', 'dismissed'];
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return withUser(s.user_id, async (c) => {
    const o = await c.query('select o.*, r.sector, r.geography, r.created_at as researched_at from opportunities o join research_runs r on r.id=o.run_id where o.id=$1 and r.owner_id=$2', [params.id, s.user_id]);
    if (!o.rows[0]) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    const ev = await c.query('select e.id,e.canonical_url,e.employer,e.role,e.published_at,e.observed_at,e.excerpt,oe.claim from opportunity_evidence oe join evidence e on e.id=oe.evidence_id where oe.opportunity_id=$1', [params.id]);
    const sv = await c.query('select status,note,dismiss_reason from saved_opportunities where opportunity_id=$1 and owner_id=$2', [params.id, s.user_id]);
    const latest = (await c.query('select coalesce(max(version),0) v from business_profiles where owner_id=$1', [s.user_id])).rows[0].v;
    const opportunity = { ...o.rows[0], assessment_status: o.rows[0].profile_version && o.rows[0].profile_version < latest ? 'needs_reassessment' : o.rows[0].assessment_status };
    return NextResponse.json({ opportunity, evidence: ev.rows, saved: sv.rows[0] ?? null });
  });
}
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const bad = checkOrigin(req); if (bad) return bad;
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const status = STATUSES.includes(b.status) ? b.status : null; const note = typeof b.note === 'string' ? b.note.slice(0, 4000) : '';
  const reason = typeof b.dismissReason === 'string' ? b.dismissReason.slice(0, 500) : null;
  if (!status || (status === 'dismissed' && !reason?.trim())) return NextResponse.json({ error: 'Choose a status; dismissing needs a reason.' }, { status: 400 });
  return withUser(s.user_id, async (c) => {
    const o = await c.query('select o.id from opportunities o join research_runs r on r.id=o.run_id where o.id=$1 and r.owner_id=$2', [params.id, s.user_id]);
    if (!o.rows[0]) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    await c.query('insert into saved_opportunities(owner_id,opportunity_id,status,note,dismiss_reason) values($1,$2,$3,$4,$5) on conflict(owner_id,opportunity_id) do update set status=excluded.status,note=excluded.note,dismiss_reason=excluded.dismiss_reason,updated_at=now()', [s.user_id, params.id, status, note, reason]);
    return NextResponse.json({ ok: true });
  });
}
