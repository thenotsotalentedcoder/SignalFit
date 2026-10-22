import { NextResponse } from 'next/server';
import type { PoolClient } from 'pg';
import type { z } from 'zod';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';
import { checkOrigin, allow, tooMany } from '@/lib/guard';
import { discover, inspect } from '@/lib/research';
import { AiUnavailable, CRITIQUE_PROMPT, EXTRACT_PROMPT, MATCH_PROMPT, critiqueSchema, extractionSchema, generateJson, matchSchema } from '@/lib/ai';
import { eligibility, fitLabel, scoreDimensions, validateCitations, type Dimensions, type EvidenceRec } from '@/lib/validator';

const MAX_SOURCES = 12; const EXTRACT_BATCH = 3; const uuid = /^[0-9a-f-]{36}$/i;
const rec = (x: any): EvidenceRec => ({ id: x.id, runId: x.run_id, employer: x.employer, publisher: x.publisher, pageType: x.page_type, publishedAt: x.published_at, accessStatus: x.access_status });
const modelCall = (c: PoolClient, owner: string, purpose: string, status: string) => c.query('insert into model_calls(owner_id,purpose,model,status) values($1,$2,$3,$4)', [owner, purpose, process.env.GEMINI_MODEL || 'gemini-3.5-flash', status]);

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'Run not found.' }, { status: 404 });
  return withUser(s.user_id, async (c) => {
    const r = await c.query('select id,sector,geography,engagement,stage,status,error,created_at,profile_snapshot->>\'_version\' as profile_version from research_runs where id=$1 and owner_id=$2', [params.id, s.user_id]);
    if (!r.rows[0]) return NextResponse.json({ error: 'Run not found.' }, { status: 404 });
    const e = await c.query('select id,canonical_url,publisher,employer,role,location,page_type,observed_at,published_at,excerpt,duties,access_status,provenance,extracted from evidence where run_id=$1 order by created_at', [params.id]);
    const latest = await c.query('select coalesce(max(version),0) v from business_profiles where owner_id=$1', [s.user_id]);
    const o = await c.query('select o.*, sv.status as saved_status, sv.note as saved_note from opportunities o left join saved_opportunities sv on sv.opportunity_id=o.id and sv.owner_id=$2 where o.run_id=$1 order by o.computed_score desc nulls last, o.created_at', [params.id, s.user_id]);
    const links = await c.query('select oe.opportunity_id, oe.evidence_id, oe.claim, e.canonical_url, e.employer, e.role, e.published_at, e.observed_at, e.excerpt from opportunity_evidence oe join opportunities o on o.id=oe.opportunity_id join evidence e on e.id=oe.evidence_id where o.run_id=$1', [params.id]);
    const opportunities = o.rows.map((x: any) => ({ ...x, assessment_status: x.profile_version && x.profile_version < latest.rows[0].v ? 'needs_reassessment' : x.assessment_status, citations: links.rows.filter((l: any) => l.opportunity_id === x.id) }));
    return NextResponse.json({ run: r.rows[0], evidence: e.rows, opportunities });
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const bad = checkOrigin(req); if (bad) return bad;
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'Run not found.' }, { status: 404 });
  if (!(await allow(`research:${s.user_id}`, 60, 3600))) return tooMany();
  const body = await req.json().catch(() => ({}));
  const stage = ['collect', 'extract', 'match', 'critique'].includes(body.stage) ? body.stage as string : 'collect';
  return withUser(s.user_id, async (c) => {
    const run = await c.query('select * from research_runs where id=$1 and owner_id=$2', [params.id, s.user_id]);
    if (!run.rows[0]) return NextResponse.json({ error: 'Run not found.' }, { status: 404 });
    try {
      if (stage === 'collect') return NextResponse.json(await collect(c, run.rows[0], body));
      if (stage === 'extract') return NextResponse.json(await extract(c, s.user_id, run.rows[0]));
      if (stage === 'match') return NextResponse.json(await match(c, s.user_id, run.rows[0]));
      return NextResponse.json(await critique(c, s.user_id, run.rows[0]));
    } catch (e) {
      if (!(e instanceof AiUnavailable)) throw e;
      await modelCall(c, s.user_id, stage, 'failed'); await c.query("update research_runs set status='error',error=$2,updated_at=now() where id=$1", [params.id, e.message]);
      return NextResponse.json({ error: e.message, retryable: true, stage }, { status: 502 });
    }
  });
}

async function collect(c: PoolClient, run: any, body: any) {
  const manual = Array.isArray(body.urls) ? body.urls.filter((x: unknown): x is string => typeof x === 'string').slice(0, MAX_SOURCES) : [];
  const existing = Number((await c.query('select count(*) n from evidence where run_id=$1', [run.id])).rows[0].n);
  const room = MAX_SOURCES - existing;
  const urls: string[] = room > 0 ? [...new Set<string>(manual.length ? manual : await discover(run.sector, run.geography))].slice(0, room) : [];
  await c.query("update research_runs set stage='collection',status='active',error=null,updated_at=now() where id=$1", [run.id]);
  const items = [];
  for (let i = 0; i < urls.length; i += 4) items.push(...await Promise.all(urls.slice(i, i + 4).map((u: string) => inspect(u))));
  for (const item of items) {
    await c.query(`insert into evidence(run_id,original_url,canonical_url,publisher,excerpt,body_text,published_at,access_status,provenance,facts,unknowns,extracted) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict(run_id,canonical_url) do nothing`,
      [run.id, item.original_url, item.canonical_url, item.publisher, item.excerpt, item.body_text ?? null, item.published_at ?? null, item.access_status, manual.length ? 'manual_url' : 'discovery', JSON.stringify(item.facts || []), JSON.stringify(item.unknowns || []), item.access_status !== 'inspected']);
  }
  await c.query("update research_runs set stage='extraction',updated_at=now() where id=$1", [run.id]);
  const pending = Number((await c.query("select count(*) n from evidence where run_id=$1 and access_status='inspected' and not extracted", [run.id])).rows[0].n);
  return { ok: true, stage: 'extraction', added: items.length, unavailable: items.filter((i) => i.access_status === 'unavailable').length, pending };
}

async function extract(c: PoolClient, owner: string, run: any) {
  const batch = await c.query("select id,canonical_url,body_text,published_at from evidence where run_id=$1 and access_status='inspected' and not extracted order by created_at limit $2", [run.id, EXTRACT_BATCH]);
  await c.query("update research_runs set status='active',error=null where id=$1", [run.id]);
  for (const row of batch.rows) {
    const out = await generateJson(EXTRACT_PROMPT, { url: row.canonical_url, text: String(row.body_text || '').slice(0, 9000) }, extractionSchema);
    const verbatim = out.publishedDateText && String(row.body_text).includes(out.publishedDateText) ? Date.parse(out.publishedDateText) : NaN;
    const published = row.published_at || (Number.isNaN(verbatim) ? null : new Date(verbatim).toISOString());
    await c.query('update evidence set page_type=$2,employer=$3,role=$4,location=$5,duties=$6,published_at=$7,extracted=true where id=$1', [row.id, out.pageType, out.employer, out.role, out.location, JSON.stringify(out.duties), published]);
    await modelCall(c, owner, 'evidence_extraction', 'success');
  }
  const pending = Number((await c.query("select count(*) n from evidence where run_id=$1 and access_status='inspected' and not extracted", [run.id])).rows[0].n);
  await c.query("update research_runs set stage=$2,updated_at=now() where id=$1", [run.id, pending ? 'extraction' : 'matching']);
  return { ok: true, stage: pending ? 'extraction' : 'matching', pending };
}

async function match(c: PoolClient, owner: string, run: any) {
  const pending = Number((await c.query("select count(*) n from evidence where run_id=$1 and access_status='inspected' and not extracted", [run.id])).rows[0].n);
  if (pending) throw new AiUnavailable(`${pending} source(s) are not extracted yet. Run the extraction stage first.`);
  const ev = (await c.query("select * from evidence where run_id=$1 and access_status='inspected' and extracted", [run.id])).rows;
  const index = new Map<string, EvidenceRec>(ev.map((x: any) => [x.id, rec(x)]));
  const { _version, ...profile } = run.profile_snapshot;
  await c.query("update research_runs set status='active',error=null where id=$1", [run.id]);
  const coverage = `${ev.length} inspected page(s) with ${new Set(ev.map((x: any) => (x.employer || '').toLowerCase()).filter(Boolean)).size} named employer(s).`;
  let candidates: z.infer<typeof matchSchema>['candidates'] = [];
  if (ev.length >= 2) {
    candidates = (await generateJson(MATCH_PROMPT, { profile, sector: run.sector, geography: run.geography, engagement: run.engagement, evidence: ev.map((x: any) => ({ id: x.id, url: x.canonical_url, employer: x.employer, role: x.role, pageType: x.page_type, publishedAt: x.published_at, duties: x.duties, excerpt: String(x.excerpt).slice(0, 600) })) }, matchSchema)).candidates;
    await modelCall(c, owner, 'matching', 'success');
  }
  await c.query('delete from opportunities where run_id=$1', [run.id]);
  let saved = 0; const dropped: string[] = [];
  for (const cand of candidates) {
    const ids = [...cand.evidenceIds, ...Object.values(cand.dimensions).flatMap((d) => d.evidenceIds)];
    const { valid, rejected } = validateCitations(ids, index, run.id);
    if (rejected.length) dropped.push(...rejected);
    const cited = valid.filter((id) => cand.evidenceIds.includes(id)).map((id) => index.get(id)!);
    if (!cited.length) continue;
    const elig = eligibility(cited, [...index.values()]);
    const { total, unknown } = scoreDimensions(cand.dimensions as Dimensions);
    const label = fitLabel(total, unknown, cand.conflicts);
    const finalElig = cand.conflicts.length && elig === 'recommended' ? 'conditional' : elig;
    const o = await c.query('insert into opportunities(run_id,title,summary,eligibility,scores,rationale,unknowns,offer,dimensions,computed_score,profile_version,buyer_role,conflicts,critique) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning id',
      [run.id, cand.title, `${cand.summary}\n\nObserved workflow: ${cand.workflow}`, finalElig, JSON.stringify({ total, label, unknown }), JSON.stringify([]), JSON.stringify(cand.unknowns), JSON.stringify(cand.offer), JSON.stringify(cand.dimensions), total, _version ?? null, cand.buyerRole, JSON.stringify(cand.conflicts), JSON.stringify({})]);
    for (const e of cited) await c.query('insert into opportunity_evidence(opportunity_id,evidence_id,claim) values($1,$2,$3) on conflict do nothing', [o.rows[0].id, e.id, cand.workflow.slice(0, 300)]);
    saved++;
  }
  if (!saved) await c.query('insert into opportunities(run_id,title,summary,eligibility,scores,unknowns) values($1,$2,$3,$4,$5,$6)', [run.id, 'No qualifying opportunity', `Not enough supported evidence to recommend anything. Coverage: ${coverage}${dropped.length ? ` ${dropped.length} model citation(s) were rejected as not belonging to this run.` : ''} Add accessible public URLs and run again.`, 'insufficient_evidence', JSON.stringify({ total: 0 }), JSON.stringify(['Need dated work from two distinct employers plus one company or vendor context page.'])]);
  await c.query("update research_runs set stage=$2,status='active',updated_at=now() where id=$1", [run.id, saved ? 'critique' : 'review']);
  if (!saved) await c.query("update research_runs set status='complete' where id=$1", [run.id]);
  return { ok: true, stage: saved ? 'critique' : 'review', candidates: saved, rejectedCitations: dropped.length };
}

async function critique(c: PoolClient, owner: string, run: any) {
  if (!['critique', 'review'].includes(run.stage) || (run.stage === 'review' && run.status !== 'complete')) throw new AiUnavailable('Matching has not finished for this run. Run the earlier stages first.');
  const opps = (await c.query("select o.* from opportunities o where o.run_id=$1 and o.eligibility<>'insufficient_evidence' and o.critique = '{}'::jsonb", [run.id])).rows;
  await c.query("update research_runs set status='active',error=null where id=$1", [run.id]);
  for (const o of opps) {
    const ev = (await c.query('select e.id,e.canonical_url,e.employer,e.role,e.published_at,e.duties,e.excerpt from opportunity_evidence oe join evidence e on e.id=oe.evidence_id where oe.opportunity_id=$1', [o.id])).rows;
    const out = await generateJson(CRITIQUE_PROMPT, { candidate: { title: o.title, summary: o.summary, offer: o.offer, buyerRole: o.buyer_role, dimensions: o.dimensions }, evidence: ev.map((x: any) => ({ ...x, excerpt: String(x.excerpt).slice(0, 600) })) }, critiqueSchema);
    const elig = out.verdict === 'exclude' ? 'excluded' : out.verdict === 'downgrade' && o.eligibility === 'recommended' ? 'discovery_lead' : o.eligibility;
    await c.query('update opportunities set critique=$2,eligibility=$3 where id=$1', [o.id, JSON.stringify(out), elig]);
    await modelCall(c, owner, 'critique', 'success');
  }
  await c.query("update research_runs set stage='review',status='complete',updated_at=now() where id=$1", [run.id]);
  return { ok: true, stage: 'review', critiqued: opps.length };
}
