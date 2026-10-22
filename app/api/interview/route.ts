import { NextResponse } from 'next/server';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';
import { checkOrigin } from '@/lib/guard';
import { allQuestions, nextStep, stages } from '@/lib/interview';
import { loadFollowups } from '@/lib/followups';

export async function GET() {
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Two-factor authentication required.' }, { status: 401 });
  return withUser(s.user_id, async (c) => {
    const r = await c.query('select question,answer,skipped from interview_answers where owner_id=$1 order by created_at', [s.user_id]);
    const answers = Object.fromEntries(r.rows.map((x: any) => [x.question, x.skipped ? '' : x.answer]));
    const { followups, closed } = await loadFollowups(c, s.user_id);
    const p = await c.query('select id,version,data,confirmed_at from business_profiles where owner_id=$1 order by version desc limit 1', [s.user_id]);
    const row = p.rows[0]; const hasProfile = Boolean(row?.data?.summary);
    return NextResponse.json({ answers, questions: allQuestions(answers, followups), stages, step: nextStep(answers, followups, closed), profile: hasProfile ? row.data : null, profileVersion: hasProfile ? row.version : null, confirmed: Boolean(row?.confirmed_at) });
  });
}

export async function POST(req: Request) {
  const bad = checkOrigin(req); if (bad) return bad;
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Two-factor authentication required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.field !== 'string' || typeof body.answer !== 'string' || body.answer.length > 3000) return NextResponse.json({ error: 'Please provide a valid answer.' }, { status: 400 });
  return withUser(s.user_id, async (c) => {
    const { followups } = await loadFollowups(c, s.user_id);
    const known = allQuestions({}, followups).some((q) => q.field === body.field);
    if (!known) return NextResponse.json({ error: 'Unknown question.' }, { status: 400 });
    const p = await c.query('select id from business_profiles where owner_id=$1 order by version desc limit 1', [s.user_id]);
    await c.query('insert into interview_answers(owner_id,profile_id,question,answer,skipped) values($1,$2,$3,$4,$5) on conflict(owner_id,question) do update set answer=excluded.answer,skipped=excluded.skipped,profile_id=excluded.profile_id', [s.user_id, p.rows[0].id, body.field, body.answer.trim(), Boolean(body.skip)]);
    return NextResponse.json({ ok: true });
  });
}
