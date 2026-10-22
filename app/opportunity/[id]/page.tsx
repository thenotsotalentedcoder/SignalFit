'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import OpportunityActions from '@/components/OpportunityActions';
import { api } from '@/lib/client';
import { DIMENSIONS, ELIGIBILITY, day } from '@/lib/labels';

export default function OpportunityDetail({ params }: { params: { id: string } }) {
  const [d, setD] = useState<any>(null); const [error, setError] = useState('');
  const load = useCallback(async () => { const r = await api(`/api/opportunities/${params.id}`); if (r.ok) setD(r.data); else setError(r.status === 404 ? 'Opportunity not found.' : r.data.error); }, [params.id]);
  useEffect(() => { void load(); }, [load]);
  if (error) return <AppShell><p role="alert" className="alert-error">{error}</p><Link href="/research" className="btn-secondary mt-4">Back to research</Link></AppShell>;
  if (!d) return <AppShell><div aria-busy="true" aria-label="Loading opportunity" className="space-y-3"><div className="skeleton h-8 w-2/3" /><div className="skeleton h-40" /></div></AppShell>;

  const o = d.opportunity; const e = ELIGIBILITY[o.eligibility] ?? ELIGIBILITY.insufficient_evidence; const cr = o.critique ?? {}; const offer = o.offer ?? {};
  return <AppShell width="max-w-4xl">
    <Link href="/research" className="text-sm font-semibold text-brand underline">← Research</Link>
    <div className="mt-3 flex flex-wrap items-center gap-2"><span className={e.badge}>{e.label}</span>{o.assessment_status === 'needs_reassessment' && <span className="badge-warn">Needs reassessment: profile changed since</span>}<span className="badge-neutral">Profile v{o.profile_version ?? '?'}</span></div>
    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{o.title}</h1>
    <p className="mt-1 text-sm text-muted">{o.sector} · {o.geography} · research cutoff {day(o.researched_at)}. {e.help}</p>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <Section title="What the sources show"><p className="whitespace-pre-line text-sm">{o.summary}</p></Section>
        <Section title="Proposed first engagement">
          <p className="text-sm">{offer.firstEngagement ?? 'Not stated.'}</p>
          <List title="You deliver" items={offer.deliverables} /><List title="The buyer keeps" items={offer.buyerRetains} />
          <p className="mt-3 text-sm"><b>Likely buyer role:</b> {o.buyer_role ?? 'Unknown'} <span className="badge-neutral">inference</span></p>
        </Section>
        <Section title={`Evidence (${d.evidence.length})`}>
          <ul className="space-y-3">{d.evidence.map((x: any) => <li key={x.id} className="rounded-md bg-canvas p-3 text-sm">
            <a className="break-all font-semibold underline" href={x.canonical_url} target="_blank" rel="noreferrer">{x.employer ?? x.canonical_url}{x.role && ` — ${x.role}`}</a>
            <p className="text-xs text-muted">Published {day(x.published_at)} · inspected {day(x.observed_at)}</p>
            <p className="mt-1"><b>Supports:</b> {x.claim}</p><blockquote className="mt-1 border-l-2 border-line pl-3 text-muted">{String(x.excerpt ?? '').slice(0, 280)}</blockquote></li>)}</ul>
        </Section>
        {cr.verdict && <Section title={`Critique: ${cr.verdict}`}><List title="Objections" items={cr.objections} /><List title="Claims the evidence does not support" items={cr.unsupportedClaims} /><List title="Questions for the buyer" items={cr.discoveryQuestions} /><p className="mt-3 text-xs text-muted">A second model pass with a different task. It is not independent human review.</p></Section>}
      </div>
      <div className="space-y-5">
        <Section title={o.computed_score != null ? `Fit ${o.computed_score}/100 (${o.scores?.label})` : 'Fit'}>
          <ul className="space-y-3 text-sm">{Object.entries(o.dimensions ?? {}).map(([k, v]: any) => <li key={k}><div className="flex justify-between gap-2"><span className="font-semibold">{DIMENSIONS[k] ?? k}</span><span>{v.score === null ? 'Unknown' : `${v.score}/5`}</span></div>
            <div className="mt-1 h-1.5 rounded bg-line" aria-hidden><div className="h-full rounded bg-brand" style={{ width: `${((v.score ?? 0) / 5) * 100}%` }} /></div><p className="mt-1 text-xs text-muted">{v.note}</p></li>)}</ul>
          <p className="mt-3 text-xs text-muted">A prioritization aid, not a probability of closing a sale. Unknown dimensions block a “strong” label.</p>
        </Section>
        {o.conflicts?.length > 0 && <Section title="Conflicts with your constraints"><List items={o.conflicts} /></Section>}
        <Section title="Still unknown"><List items={o.unknowns} /></Section>
        <OpportunityActions id={o.id} saved={d.saved} onSaved={() => void load()} />
      </div>
    </div>
  </AppShell>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="card"><h2 className="font-bold">{title}</h2><div className="mt-2">{children}</div></section>; }
function List({ title, items }: { title?: string; items?: string[] }) { return items?.length ? <div className="mt-3">{title && <h3 className="text-sm font-semibold">{title}</h3>}<ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div> : null; }
