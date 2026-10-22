'use client';
import { useEffect, useState } from 'react';
import type { Question } from '@/lib/interview';

type Props = { question: Question; index: number; total: number; initial: string; busy: boolean; error: string; canGoBack: boolean; onSave: (value: string, skip: boolean) => void; onBack: () => void };

/** One question at a time. Choices append to the free-text answer; "don't know" is always allowed. */
export default function InterviewStep({ question, index, total, initial, busy, error, canGoBack, onSave, onBack }: Props) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [question.field, initial]);
  const pct = Math.round((index / total) * 100);
  return <section className="card" aria-labelledby="q-title">
    <div className="flex items-center justify-between gap-3 text-sm"><span className="eyebrow">{question.stage}</span><span className="text-muted">Question {index} of up to {total}</span></div>
    <div role="progressbar" aria-label="Interview progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="mt-2 h-1.5 rounded bg-line"><div className="h-full rounded bg-brand" style={{ width: `${pct}%` }} /></div>
    <h1 id="q-title" className="mt-5 text-xl font-bold sm:text-2xl">{question.title}</h1>
    <p className="mt-1 text-sm text-muted">{question.hint}{question.addresses && <span className="block text-xs">Helps us confirm: {question.addresses}</span>}</p>
    {question.choices && question.choices.length > 0 && <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Suggested answers">{question.choices.map((c) => <button key={c} type="button" onClick={() => setValue((v) => (v ? `${v.trim()}; ${c}` : c))} className="btn-secondary min-h-[44px] text-left">{c}</button>)}</div>}
    <label className="label mt-4">Your answer<textarea className="field min-h-32" value={value} onChange={(e) => setValue(e.target.value)} maxLength={3000} /></label>
    {error && <p role="alert" className="alert-error mt-3">{error}</p>}
    <div className="mt-5 flex flex-wrap gap-2">
      <button className="btn-primary" disabled={!value.trim() || busy} onClick={() => onSave(value, false)}>{busy ? 'Saving…' : 'Save and continue'}</button>
      <button className="btn-secondary" disabled={busy} onClick={() => onSave('', true)}>I don’t know / skip</button>
      {canGoBack && <button className="btn-secondary" disabled={busy} onClick={onBack}>Back</button>}
    </div>
  </section>;
}
