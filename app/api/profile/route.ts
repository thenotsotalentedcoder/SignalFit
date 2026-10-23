import { NextResponse } from 'next/server';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';
import { checkOrigin } from '@/lib/guard';
import { synthesize } from '@/lib/gemini';
import { profileSchema } from '@/lib/contracts';
import { inspect } from '@/lib/research';

const MODEL = () => process.env.GEMINI_MODEL || 'gemini-3.5-flash';
/** Portfolio links the user typed; fetched server-side and kept apart from their own statements. */
async function inspectPortfolio(answers: Record<string, string>) {
  const urls = [...new Set(Object.values(answers).flatMap((a) => a.match(/https?:\/\/[^\s)>,"]+/g) ?? []))].slice(0, 2);
  const pages = await Promise.all(urls.map((u) => inspect(u)));
  return pages.map((p) => ({ url: p.canonical_url, status: p.access_status, excerpt: p.excerpt.slice(0, 300) }));
}

export async function POST(req: Request) {
  const bad = checkOrigin(req); if (bad) return bad;
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Two-factor authentication required.' }, { status: 401 });
  return withUser(s.user_id, async (c) => {
    const a = await c.query('select question,answer from interview_answers where owner_id=$1 and not skipped order by created_at', [s.user_id]);
    const answers = Object.fromEntries(a.rows.map((x: any) => [x.question, x.answer]));
    try {
      const profile = profileSchema.parse({ ...(await synthesize(answers)), inspected: await inspectPortfolio(answers) });
      const v = await c.query('select coalesce(max(version),0)+1 version from business_profiles where owner_id=$1', [s.user_id]);
      await c.query('insert into business_profiles(owner_id,version,data) values($1,$2,$3)', [s.user_id, v.rows[0].version, profile]);
      await c.query('insert into model_calls(owner_id,purpose,model,status) values($1,$2,$3,$4)', [s.user_id, 'profile_synthesis', MODEL(), profile.source === 'deterministic' ? 'fallback' : 'success']);
      return NextResponse.json({ profile, version: v.rows[0].version });
    } catch (e) {
      await c.query('insert into model_calls(owner_id,purpose,model,status) values($1,$2,$3,$4)', [s.user_id, 'profile_synthesis', MODEL(), 'failed']);
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Profile generation failed. Saved answers are safe.' }, { status: 502 });
    }
  });
}
/** Editing never overwrites: it creates a new unconfirmed version. */
export async function PATCH(req: Request) {
  const bad = checkOrigin(req); if (bad) return bad;
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Two-factor authentication required.' }, { status: 401 });
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Profile format is invalid.' }, { status: 400 });
  return withUser(s.user_id, async (c) => {
    const v = await c.query('select coalesce(max(version),0)+1 version from business_profiles where owner_id=$1', [s.user_id]);
    await c.query('insert into business_profiles(owner_id,version,data) values($1,$2,$3)', [s.user_id, v.rows[0].version, { ...parsed.data, source: parsed.data.source }]);
    return NextResponse.json({ ok: true, version: v.rows[0].version });
  });
}
