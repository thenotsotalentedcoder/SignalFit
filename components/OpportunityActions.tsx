'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import { STATUS_LABEL } from '@/lib/labels';

/** Save / worth investigating / dismiss (with reason) plus a private note. */
export default function OpportunityActions({ id, saved, onSaved }: { id: string; saved: { status: string; note: string; dismiss_reason: string | null } | null; onSaved: () => void }) {
  const [note, setNote] = useState(saved?.note ?? ''); const [reason, setReason] = useState(saved?.dismiss_reason ?? ''); const [dismissing, setDismissing] = useState(false);
  const [msg, setMsg] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function put(status: string) {
    setBusy(true); setError(''); setMsg('');
    const r = await api(`/api/opportunities/${id}`, 'PUT', { status, note, dismissReason: status === 'dismissed' ? reason : undefined });
    if (r.ok) { setMsg(`${STATUS_LABEL[status]}.`); setDismissing(false); onSaved(); } else setError(r.data.error); setBusy(false);
  }
  return <section className="card" aria-labelledby="act-title">
    <h2 id="act-title" className="font-bold">Your decision</h2>
    {saved && <p className="mt-1 text-sm text-muted">Current status: <b>{STATUS_LABEL[saved.status]}</b>{saved.dismiss_reason && ` — ${saved.dismiss_reason}`}</p>}
    <label className="label mt-3">Private note<textarea className="field min-h-24" maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What you want to check, who to ask, why it fits or not" /></label>
    {dismissing && <label className="label mt-3">Reason for dismissing (required)<input className="field" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus /></label>}
    <div className="mt-4 flex flex-wrap gap-2">
      <button className="btn-brand" disabled={busy} onClick={() => put('worth_investigating')}>Worth investigating</button>
      <button className="btn-secondary" disabled={busy} onClick={() => put('saved')}>Save with note</button>
      {!dismissing ? <button className="btn-secondary" onClick={() => setDismissing(true)}>Dismiss…</button> : <button className="btn-primary" disabled={busy || !reason.trim()} onClick={() => put('dismissed')}>Confirm dismiss</button>}
      <a className="btn-secondary" href={`/api/opportunities/${id}/export`} download>Export Markdown</a>
    </div>
    <p role="status" className="mt-2 text-sm text-brand">{msg}</p>{error && <p role="alert" className="alert-error mt-2">{error}</p>}
  </section>;
}
