'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Profile } from '@/lib/contracts';
import { api } from '@/lib/client';

const lines = (v: string) => v.split('\n').map((x) => x.trim()).filter(Boolean);
const LISTS: [keyof Profile, string][] = [['services', 'Services'], ['capabilities', 'Capabilities'], ['evidence', 'Proof you stated'], ['buyerRoles', 'Likely buyer roles'], ['differentiators', 'Differentiators'], ['constraints', 'Constraints and exclusions'], ['unknowns', 'Unknown or needs confirmation']];
const TEXTS: [keyof Profile, string][] = [['customers', 'Best-fit customers'], ['preferences', 'Commercial preferences']];

type Props = { profile: Profile; version: number | null; confirmed: boolean; onChanged: () => void; onRevise: () => void };

export default function ProfileReview({ profile, version, confirmed, onChanged, onRevise }: Props) {
  const [editing, setEditing] = useState(false); const [draft, setDraft] = useState<Record<string, string>>({}); const [ack, setAck] = useState(false);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const unknowns = profile.unknowns ?? [];
  function startEdit() { setDraft({ summary: profile.summary, ...Object.fromEntries(LISTS.map(([k]) => [k, (profile[k] as string[]).join('\n')])), ...Object.fromEntries(TEXTS.map(([k]) => [k, profile[k] as string])) }); setEditing(true); }
  async function saveEdit() {
    setBusy(true); setError('');
    const next = { ...profile, summary: draft.summary, ...Object.fromEntries(LISTS.map(([k]) => [k, lines(draft[k] ?? '')])), ...Object.fromEntries(TEXTS.map(([k]) => [k, draft[k] ?? ''])) };
    const r = await api('/api/profile', 'PATCH', next);
    if (r.ok) { setEditing(false); onChanged(); } else setError(r.data.error); setBusy(false);
  }
  async function confirm() { setBusy(true); setError(''); const r = await api('/api/profile/confirm', 'POST', { acknowledgeUnknowns: ack }); if (r.ok) onChanged(); else setError(r.data.error); setBusy(false); }

  if (editing) return <section className="card" aria-labelledby="edit-title">
    <h1 id="edit-title" className="text-xl font-bold">Edit profile</h1><p className="mt-1 text-sm text-muted">Saving creates a new version that you confirm again. One item per line.</p>
    <label className="label mt-4">Summary<textarea className="field min-h-20" value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></label>
    {TEXTS.map(([k, l]) => <label key={k} className="label mt-4">{l}<textarea className="field min-h-20" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} /></label>)}
    {LISTS.map(([k, l]) => <label key={k} className="label mt-4">{l}<textarea className="field min-h-20" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} /></label>)}
    {error && <p role="alert" className="alert-error mt-3">{error}</p>}
    <div className="mt-5 flex flex-wrap gap-2"><button className="btn-primary" onClick={saveEdit} disabled={busy || !draft.summary?.trim()}>{busy ? 'Saving…' : 'Save as new version'}</button><button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button></div>
  </section>;

  return <section className="card" aria-labelledby="profile-title">
    <div className="flex flex-wrap items-center gap-2"><span className="eyebrow">Business profile</span>{version && <span className="badge-neutral">Version {version}</span>}{confirmed ? <span className="badge-ok">Confirmed</span> : <span className="badge-warn">Needs your confirmation</span>}</div>
    {profile.source === 'deterministic' && <p className="alert-warn mt-3">Incomplete draft built from your words only: the AI model was not used. Review carefully.</p>}
    <h1 id="profile-title" className="mt-3 text-xl font-bold sm:text-2xl">{profile.summary}</h1>
    {TEXTS.map(([k, l]) => <Block key={k} title={l} items={[profile[k] as string]} />)}
    {LISTS.map(([k, l]) => <Block key={k} title={l} items={profile[k] as string[]} muted={k === 'unknowns'} />)}
    <h2 className="mt-6 text-sm font-bold">Portfolio pages we inspected</h2>
    {profile.inspected?.length ? <ul className="mt-1 space-y-2 text-sm">{profile.inspected.map((p) => <li key={p.url} className="rounded-md bg-canvas p-3"><a className="break-all font-semibold underline" href={p.url} target="_blank" rel="noreferrer">{p.url}</a> <span className={p.status === 'inspected' ? 'badge-ok' : 'badge-warn'}>{p.status === 'inspected' ? 'Inspected' : 'Source unavailable'}</span><p className="mt-1 text-muted">{p.excerpt}</p></li>)}</ul> : <p className="mt-1 text-sm text-muted">None. Everything above comes from your statements. Add a public link in an answer to have it inspected.</p>}
    {error && <p role="alert" className="alert-error mt-4">{error}</p>}
    {!confirmed && unknowns.length > 0 && <label className="mt-5 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 h-5 w-5" checked={ack} onChange={(e) => setAck(e.target.checked)} /><span>I understand the items marked unknown stay unknown, and I want to confirm this profile anyway.</span></label>}
    <div className="mt-5 flex flex-wrap gap-2">
      {!confirmed && <button className="btn-brand" onClick={confirm} disabled={busy || (unknowns.length > 0 && !ack)}>{busy ? 'Confirming…' : 'Confirm profile'}</button>}
      {confirmed && <Link className="btn-brand" href="/research">Start research</Link>}
      <button className="btn-secondary" onClick={startEdit}>Edit profile</button><button className="btn-secondary" onClick={onRevise}>Revise interview answers</button>
    </div>
    {confirmed && <p className="mt-3 text-xs text-muted">Editing creates a new version. Earlier research keeps the version it used and is marked for reassessment.</p>}
  </section>;
}
function Block({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  const shown = items.filter(Boolean);
  return <><h2 className="mt-6 text-sm font-bold">{title}</h2>{shown.length ? <ul className={`mt-1 list-disc space-y-0.5 pl-5 text-sm ${muted ? 'text-warn' : ''}`}>{shown.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="mt-1 text-sm text-muted">Not provided.</p>}</>;
}
