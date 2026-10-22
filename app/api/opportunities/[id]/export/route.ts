import { NextResponse } from 'next/server';
import { requireAAL2 } from '@/lib/auth';
import { withUser } from '@/lib/db';

const uuid = /^[0-9a-f-]{36}$/i; const list = (xs: unknown) => (Array.isArray(xs) && xs.length ? xs.map((x) => `- ${x}`).join('\n') : '- None stated');
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await requireAAL2(); if (!s) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!uuid.test(params.id)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return withUser(s.user_id, async (c) => {
    const o = (await c.query('select o.*, r.sector, r.geography, r.created_at as researched_at from opportunities o join research_runs r on r.id=o.run_id where o.id=$1 and r.owner_id=$2', [params.id, s.user_id])).rows[0];
    if (!o) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    const ev = (await c.query('select e.canonical_url,e.employer,e.role,e.published_at,e.observed_at,e.excerpt from opportunity_evidence oe join evidence e on e.id=oe.evidence_id where oe.opportunity_id=$1', [params.id])).rows;
    const sv = (await c.query('select status,note from saved_opportunities where opportunity_id=$1 and owner_id=$2', [params.id, s.user_id])).rows[0];
    const cr = o.critique || {}; const offer = o.offer || {};
    const md = `# ${o.title}\n\n> ${o.eligibility.replace('_', ' ')} · fit ${o.computed_score ?? 'n/a'}/100 (${o.scores?.label ?? 'unscored'}) · ${o.sector}, ${o.geography} · research cutoff ${new Date(o.researched_at).toISOString().slice(0, 10)}\n> A prioritization aid, not a probability of closing a sale. Nothing here shows a company has agreed to buy.\n\n${o.summary}\n\n## Proposed first engagement\n${offer.firstEngagement ?? 'Not stated'}\n\n**Deliverables**\n${list(offer.deliverables)}\n\n**Buyer retains**\n${list(offer.buyerRetains)}\n\n**Likely buyer role (inference):** ${o.buyer_role ?? 'Unknown'}\n\n## Evidence\n${ev.length ? ev.map((e: any) => `- [${e.employer ?? e.canonical_url}${e.role ? ` — ${e.role}` : ''}](${e.canonical_url}) · published ${e.published_at ? new Date(e.published_at).toISOString().slice(0, 10) : 'date unknown'} · inspected ${new Date(e.observed_at).toISOString().slice(0, 10)}\n  > ${String(e.excerpt ?? '').slice(0, 240)}`).join('\n') : '- None'}\n\n## Constraint conflicts\n${list(o.conflicts)}\n\n## Critique\n**Objections**\n${list(cr.objections)}\n\n**Unsupported claims**\n${list(cr.unsupportedClaims)}\n\n**Questions to confirm with the buyer**\n${list(cr.discoveryQuestions)}\n\n## Unknowns\n${list(o.unknowns)}\n\n## Your notes\n${sv ? `Status: ${sv.status}\n\n${sv.note || '(no note)'}` : '(not saved)'}\n`;
    return new NextResponse(md, { headers: { 'content-type': 'text/markdown; charset=utf-8', 'content-disposition': `attachment; filename="signalfit-${params.id.slice(0, 8)}.md"` } });
  });
}
