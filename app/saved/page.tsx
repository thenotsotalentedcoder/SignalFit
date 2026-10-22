'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/client';
import { ELIGIBILITY, STATUS_LABEL, day } from '@/lib/labels';

export default function Saved() {
  const [rows, setRows] = useState<any[] | null>(null); const [error, setError] = useState('');
  useEffect(() => { void api('/api/saved').then((r) => (r.ok ? setRows(r.data.saved) : setError(r.data.error))); }, []);
  return <AppShell>
    <p className="eyebrow">Shortlist</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Saved opportunities</h1>
    {error && <p role="alert" className="alert-error mt-4">{error}</p>}
    {rows === null && !error && <div aria-busy="true" className="mt-4 space-y-3"><div className="skeleton h-20" /><div className="skeleton h-20" /></div>}
    {rows?.length === 0 && <div className="card mt-4"><h2 className="font-bold">Nothing saved yet</h2><p className="mt-1 text-sm text-muted">Open an opportunity from a research run and mark it worth investigating, save it with a note, or dismiss it with a reason.</p><Link className="btn-brand mt-4" href="/research">Go to research</Link></div>}
    <ul className="mt-4 space-y-3">{rows?.map((s) => <li key={s.opportunity_id} className="card">
      <div className="flex flex-wrap items-center gap-2"><span className={s.status === 'dismissed' ? 'badge-neutral' : 'badge-ok'}>{STATUS_LABEL[s.status]}</span><span className={(ELIGIBILITY[s.eligibility] ?? ELIGIBILITY.insufficient_evidence).badge}>{(ELIGIBILITY[s.eligibility] ?? ELIGIBILITY.insufficient_evidence).label}</span><span className="text-xs text-muted">updated {day(s.updated_at)}</span></div>
      <h2 className="mt-2 font-bold">{s.title}{s.computed_score != null && <span className="font-normal text-muted"> · fit {s.computed_score}/100</span>}</h2>
      {s.note && <p className="mt-1 whitespace-pre-line text-sm">{s.note}</p>}{s.dismiss_reason && <p className="mt-1 text-sm text-muted">Dismissed because: {s.dismiss_reason}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><Link className="btn-secondary" href={`/opportunity/${s.opportunity_id}`}>Open</Link><a className="btn-secondary" href={`/api/opportunities/${s.opportunity_id}/export`} download>Export Markdown</a></div></li>)}</ul>
  </AppShell>;
}
