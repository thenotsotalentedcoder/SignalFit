'use client';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import OpportunityCard from '@/components/OpportunityCard';
import RunProgress from '@/components/RunProgress';
import { api } from '@/lib/client';
import { day } from '@/lib/labels';

export default function ResearchPage() {
  const [form, setForm] = useState({ sector: '', geography: '', engagement: 'project' });
  const [runId, setRunId] = useState<string | null>(null); const [urls, setUrls] = useState('');
  const [data, setData] = useState<any>(null); const [runs, setRuns] = useState<any[] | null>(null);
  const [error, setError] = useState(''); const [working, setWorking] = useState(''); const [busy, setBusy] = useState(false);

  const load = useCallback(async (id: string) => { const r = await api(`/api/research/run/${id}`); if (r.ok) setData(r.data); }, []);
  useEffect(() => { void api('/api/research/run').then((r) => setRuns(r.ok ? r.data.runs : [])); }, []);
  useEffect(() => { if (runId) void load(runId); }, [runId, load]);

  async function start(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const r = await api('/api/research/run', 'POST', form);
    if (!r.ok) setError(r.data.error); else { setData(null); setRunId(r.data.run.id); }
    setBusy(false);
  }
  async function stage(name: string, body: object = {}) {
    setWorking(name); const r = await api(`/api/research/run/${runId}`, 'POST', { stage: name, ...body });
    await load(runId!); if (!r.ok) throw new Error(r.data.error || 'Stage failed.'); return r.data;
  }
  async function execute() {
    setBusy(true); setError('');
    try {
      const list = urls.split('\n').map((x) => x.trim()).filter(Boolean);
      if (!data?.evidence?.length) await stage('collect', { urls: list });
      for (let pending = 1; pending > 0;) pending = (await stage('extract')).pending;
      await stage('match'); await stage('critique');
    } catch (e) { setError(`${e instanceof Error ? e.message : 'Run failed.'} Completed work is saved. Press the button again to resume.`); }
    setWorking(''); setBusy(false);
  }

  const run = data?.run; const done = run?.status === 'complete'; const opps: any[] = data?.opportunities ?? [];
  const unavailable = data?.evidence?.filter((x: any) => x.access_status === 'unavailable').length ?? 0;
  return <AppShell>
    <p className="eyebrow">Research</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Investigate one market</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted">One sector, one geography, at most 12 public pages. Only pages actually fetched count as evidence. A job posting shows advertised work, not intent to buy.</p>

    {!runId ? <>
      <form onSubmit={start} className="card mt-6 space-y-4">
        <label className="label">Sector<input className="field" required maxLength={200} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="e.g. freight and logistics software" /></label>
        <label className="label">Geography<input className="field" required maxLength={200} value={form.geography} onChange={(e) => setForm({ ...form, geography: e.target.value })} placeholder="e.g. Pakistan, remote-friendly" /></label>
        <label className="label">Desired engagement<input className="field" required maxLength={200} value={form.engagement} onChange={(e) => setForm({ ...form, engagement: e.target.value })} placeholder="project, retainer, advisory" /></label>
        {error && <p role="alert" className="alert-error">{error}{error.includes('Confirm') && <> <a className="font-semibold underline" href="/workspace">Go to your profile</a></>}</p>}
        <button className="btn-brand" disabled={busy}>{busy ? 'Creating…' : 'Create run'}</button>
      </form>
      <section className="mt-8" aria-labelledby="hist"><h2 id="hist" className="text-lg font-bold">Research history</h2>
        {runs === null ? <div className="skeleton mt-3 h-12" aria-busy="true" /> : runs.length === 0 ? <p className="mt-2 text-sm text-muted">No runs yet. Your first run will appear here and stay after you sign out.</p>
          : <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-white">{runs.map((r) => <li key={r.id}><button onClick={() => setRunId(r.id)} className="flex min-h-[44px] w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-canvas"><span className="font-semibold">{r.sector} · {r.geography}</span><span className="text-sm text-muted">{r.status} · {day(r.created_at)}</span></button></li>)}</ul>}
      </section>
    </> : <section className="mt-6 space-y-5">
      <div className="card">
        <p className="text-sm text-muted"><b className="text-ink">{run?.sector}</b> · {run?.geography} · {run?.engagement} · started {day(run?.created_at)}</p>
        <div className="mt-4"><RunProgress stage={run?.stage ?? 'collection'} status={run?.status ?? 'active'} working={working} /></div>
        {!done && <>
          <label className="label mt-5">Public URLs to inspect <span className="font-normal text-muted">(optional, one per line; blank uses live search)</span><textarea className="field min-h-24" value={urls} onChange={(e) => setUrls(e.target.value)} disabled={Boolean(data?.evidence?.length)} placeholder="https://company.example/careers" /></label>
          <button onClick={execute} disabled={busy} className="btn-primary mt-4">{busy ? 'Working…' : run?.status === 'error' ? 'Retry from last saved stage' : data?.evidence?.length ? 'Resume run' : 'Run research'}</button></>}
        <p role="status" className="mt-3 text-sm text-muted">{busy ? `Stage in progress: ${working}…` : done ? 'Run complete. Results are saved to your account.' : ''}</p>
        {error && <p role="alert" className="alert-error mt-3">{error}</p>}
      </div>
      {data?.evidence?.length > 0 && <details className="card"><summary className="cursor-pointer font-semibold">Sources inspected: {data.evidence.length - unavailable} read, {unavailable} unavailable</summary>
        <ul className="mt-3 space-y-2">{data.evidence.map((x: any) => <li key={x.id} className="rounded-md bg-canvas p-3 text-sm"><span className={x.access_status === 'unavailable' ? 'badge-warn' : 'badge-ok'}>{x.access_status === 'unavailable' ? 'Source unavailable' : x.page_type?.replace('_', ' ') ?? 'read'}</span> <a className="break-all font-semibold underline" href={x.canonical_url} target="_blank" rel="noreferrer">{x.employer || x.publisher || x.canonical_url}</a> <span className="text-muted">· {day(x.published_at)}</span><p className="mt-1 text-muted">{String(x.excerpt).slice(0, 180)}</p></li>)}</ul></details>}
      {opps.length > 0 && <div className="space-y-4"><h2 className="text-lg font-bold">{opps.some((o) => o.eligibility === 'insufficient_evidence') ? 'Result' : `Opportunities (${opps.length})`}</h2>{opps.map((o) => <OpportunityCard key={o.id} o={o} />)}</div>}
      {done && <button onClick={() => { setRunId(null); setData(null); setUrls(''); setError(''); void api('/api/research/run').then((r) => setRuns(r.ok ? r.data.runs : [])); }} className="btn-secondary">Back to runs</button>}
    </section>}
  </AppShell>;
}
