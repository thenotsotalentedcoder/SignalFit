import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';
import { allow, checkOrigin, tooMany } from '@/lib/guard';
import { AiUnavailable, generateJson } from '@/lib/ai';
import { missingFields, nextStep } from '@/lib/interview';
import { CLOSED, loadFollowups } from '@/lib/followups';

const schema = z.object({ done: z.boolean(), question: z.object({ title: z.string().min(5).max(200), hint: z.string().max(240), choices: z.array(z.string().max(60)).max(5), addresses: z.string().max(120) }).nullable() });
const PROMPT = 'You run a short intake interview for a freelancer or small agency. From the answers so far, choose the SINGLE most valuable follow-up that fills a gap needed to match them with market demand (proof of delivery, capacity and smaller engagements, systems actually connected, commercial preferences, exclusions, goals). Never re-ask something already answered. If they offer integrations, ask which systems they have actually connected; if they are at capacity, ask what smaller engagement they could accept. Plain language, one question, optional short choices, and `addresses` names the uncertainty it resolves. Output exactly this JSON shape: {"done":false,"question":{"title":string,"hint":string,"choices":[string],"addresses":string}}. If enough is known, output {"done":true,"question":null}.';

/** Ask the model for the next follow-up (or close the interview). Limits are enforced here, not by the model. */
export async function POST(req: Request) {
  const bad = checkOrigin(req); if (bad) return bad;
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Two-factor authentication required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  return withUser(s.user_id, async (c) => {
    const r = await c.query('select question,answer from interview_answers where owner_id=$1 and not skipped', [s.user_id]);
    const answers = Object.fromEntries(r.rows.map((x: any) => [x.question, x.answer]));
    const { followups, closed } = await loadFollowups(c, s.user_id);
    const close = () => c.query("insert into interview_followups(owner_id,field,title) values($1,$2,'') on conflict do nothing", [s.user_id, CLOSED]);
    if (body.skip) { await close(); return NextResponse.json({ step: { kind: 'done' } }); }
    const step = nextStep(await answered(c, s.user_id), followups, closed);
    if (step.kind !== 'generate') return NextResponse.json({ step });
    if (!(await allow(`followup:${s.user_id}`, 20, 3600))) return tooMany();
    try {
      const out = await generateJson(PROMPT, { answers, askedFollowups: followups.map((f) => f.title), stillMissing: missingFields(answers, followups), remainingQuestions: step.remaining }, schema);
      if (out.done || !out.question) await close();
      else await c.query('insert into interview_followups(owner_id,field,title,hint,choices,addresses) values($1,$2,$3,$4,$5,$6)', [s.user_id, `followup_${followups.length + 1}`, out.question.title, out.question.hint, JSON.stringify(out.question.choices), out.question.addresses]);
      await c.query('insert into model_calls(owner_id,purpose,model,status) values($1,$2,$3,$4)', [s.user_id, 'interview_followup', process.env.GEMINI_MODEL || 'gemini-3.5-flash', 'success']);
    } catch (e) {
      if (!(e instanceof AiUnavailable)) throw e;
      await c.query('insert into model_calls(owner_id,purpose,model,status) values($1,$2,$3,$4)', [s.user_id, 'interview_followup', process.env.GEMINI_MODEL || 'gemini-3.5-flash', 'failed']);
      return NextResponse.json({ error: e.message, retryable: true, step }, { status: 502 });
    }
    const after = await loadFollowups(c, s.user_id);
    return NextResponse.json({ step: nextStep(await answered(c, s.user_id), after.followups, after.closed) });
  });
}
async function answered(c: import('pg').PoolClient, owner: string) {
  const r = await c.query('select question,answer from interview_answers where owner_id=$1', [owner]);
  return Object.fromEntries(r.rows.map((x: any) => [x.question, x.answer])) as Record<string, string>;
}
