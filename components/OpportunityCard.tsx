import Link from 'next/link';
import { ELIGIBILITY, STATUS_LABEL, day } from '@/lib/labels';

/** Compact, scannable card. Everything else lives on the detail page. */
export default function OpportunityCard({ o }: { o: any }) {
  const e = ELIGIBILITY[o.eligibility] ?? { label: o.eligibility, badge: 'badge-neutral', help: '' };
  const insufficient = o.eligibility === 'insufficient_evidence';
  const employers = new Set((o.citations ?? []).map((c: any) => c.employer).filter(Boolean)).size;
  return <article className="card" aria-labelledby={`t-${o.id}`}>
    <div className="flex flex-wrap items-center gap-2"><span className={e.badge}>{e.label}</span>
      {o.assessment_status === 'needs_reassessment' && <span className="badge-warn">Needs reassessment</span>}
      {o.saved_status && <span className="badge-neutral">{STATUS_LABEL[o.saved_status]}</span>}</div>
    <h3 id={`t-${o.id}`} className="mt-2 text-lg font-bold">{o.title}</h3>
    {!insufficient && <p className="mt-1 text-sm"><b>Fit {o.computed_score}/100</b> <span className="text-muted">· {o.scores?.label}{o.scores?.unknown?.length > 0 && ` · unknown: ${o.scores.unknown.length} dimension(s)`}</span></p>}
    <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-muted">{o.summary}</p>
    {!insufficient && <p className="mt-2 text-xs text-muted">{o.citations?.length ?? 0} cited source(s) from {employers || 'unnamed'} employer(s) · researched {day(o.created_at)}</p>}
    {o.conflicts?.length > 0 && <p className="alert-warn mt-3">Conflicts with your constraints: {o.conflicts.join('; ')}</p>}
    {!insufficient && <Link href={`/opportunity/${o.id}`} className="btn-secondary mt-4">Open evidence and detail</Link>}
  </article>;
}
