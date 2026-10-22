'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import InterviewStep from '@/components/InterviewStep';
import ProfileReview from '@/components/ProfileReview';
import { api } from '@/lib/client';
import type { Profile } from '@/lib/contracts';
import type { Question, Step } from '@/lib/interview';

type State = { answers: Record<string, string>; questions: Question[]; step: Step; profile: Profile | null; profileVersion: number | null; confirmed: boolean };

export default function Workspace() {
  const router = useRouter();
  const [s, setS] = useState<State | null>(null); const [editing, setEditing] = useState<string | null>(null); const [revising, setRevising] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [aiError, setAiError] = useState('');

  const load = useCallback(async () => {
    const r = await api('/api/interview'); if (r.status === 401) { router.push('/signin'); return null; }
    if (!r.ok) { setError(r.data.error || 'Could not load your saved interview.'); return null; }
    setS(r.data); return r.data as State;
  }, [router]);
  useEffect(() => { void load(); }, [load]);

  // Core questions are done: ask the model for one follow-up (or to close). Failure is recoverable.
  const needsFollowup = s?.step.kind === 'generate' && !editing && !revising;
  const askFollowup = useCallback(async (skip = false) => {
    setBusy(true); setAiError('');
    const r = await api('/api/interview/followup', 'POST', skip ? { skip: true } : {});
    if (!r.ok) setAiError(r.data.error || 'Could not generate a follow-up question.');
    await load(); setBusy(false);
  }, [load]);
  useEffect(() => { if (needsFollowup && !busy && !aiError) void askFollowup(); }, [needsFollowup, busy, aiError, askFollowup]);

  async function save(question: Question, value: string, skip: boolean) {
    setBusy(true); setError('');
    const r = await api('/api/interview', 'POST', { field: question.field, answer: value.trim(), skip });
    if (!r.ok) { setError(r.data.error || 'Could not save.'); setBusy(false); return; }
    const fresh = await load(); setBusy(false);
    if (editing && fresh) { const list = fresh.questions; const i = list.findIndex((q) => q.field === question.field); setEditing(list[i + 1] && revising ? list[i + 1].field : null); }
  }
  async function build() {
    setBusy(true); setError(''); const r = await api('/api/profile', 'POST');
    if (!r.ok) setError(r.data.error || 'Profile generation failed. Your answers are saved.'); else { setRevising(false); await load(); }
    setBusy(false);
  }

  if (!s) return <AppShell>{error ? <p role="alert" className="alert-error">{error}</p> : <div aria-busy="true" aria-label="Loading your workspace" className="space-y-3"><div className="skeleton h-6 w-1/3" /><div className="skeleton h-48" /></div>}</AppShell>;

  const showProfile = s.profile && !revising && !editing;
  const current = editing ? s.questions.find((q) => q.field === editing) : s.step.kind === 'question' ? s.step.question : undefined;
  const index = current ? s.questions.findIndex((q) => q.field === current.field) + 1 : 0;
  const total = s.step.kind === 'question' ? s.step.total : Math.max(s.questions.length, 8);

  return <AppShell>
    {showProfile ? <ProfileReview profile={s.profile!} version={s.profileVersion} confirmed={s.confirmed} onChanged={() => void load()} onRevise={() => { setRevising(true); setEditing(s.questions[0].field); }} />
      : current ? <InterviewStep question={current} index={index} total={total} initial={s.answers[current.field] ?? ''} busy={busy} error={error} canGoBack={index > 1}
          onSave={(v, skip) => void save(current, v, skip)} onBack={() => setEditing(s.questions[index - 2].field)} />
      : needsFollowup || (s.step.kind === 'generate') ? <section className="card" aria-live="polite">
          <p className="eyebrow">Almost there</p><h1 className="mt-2 text-xl font-bold">{aiError ? 'Follow-up question unavailable' : 'Choosing your next question…'}</h1>
          {aiError ? <><p role="alert" className="alert-error mt-3">{aiError}</p><div className="mt-4 flex flex-wrap gap-2"><button className="btn-primary" onClick={() => void askFollowup()}>Try again</button><button className="btn-secondary" onClick={() => void askFollowup(true)}>Continue without follow-ups</button></div></> : <div className="skeleton mt-4 h-10" aria-busy="true" />}
        </section>
      : <section className="card"><p className="eyebrow">Interview complete</p><h1 className="mt-2 text-xl font-bold">Ready to build your profile</h1><p className="mt-2 text-sm text-muted">We turn your answers into an editable draft. You review and confirm it before any research starts. Anything you left unknown stays marked unknown.</p>
          {error && <p role="alert" className="alert-error mt-3">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-2"><button className="btn-brand" onClick={() => void build()} disabled={busy}>{busy ? 'Building…' : 'Build my profile'}</button><button className="btn-secondary" onClick={() => setEditing(s.questions[s.questions.length - 1].field)}>Edit my answers</button></div></section>}
  </AppShell>;
}
