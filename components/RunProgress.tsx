const STEPS = [['collect', 'Collect sources'], ['extract', 'Extract evidence'], ['match', 'Match to your profile'], ['critique', 'Critique']] as const;
const ORDER: Record<string, number> = { collection: 0, extraction: 1, matching: 2, critique: 3, review: 4 };

/** Stage list driven by the persisted run stage, so a reload shows the last saved state. */
export default function RunProgress({ stage, status, working }: { stage: string; status: string; working: string }) {
  const at = ORDER[stage] ?? 0;
  return <ol aria-label="Research progress" className="grid gap-2 sm:grid-cols-4">
    {STEPS.map(([key, label], i) => {
      const done = at > i; const active = working === key || (!working && at === i && status !== 'complete');
      return <li key={key} aria-current={active ? 'step' : undefined} className={`rounded-md border px-3 py-2 text-sm ${done ? 'border-brand/30 bg-brand-soft text-brand' : active ? 'border-ink bg-white font-semibold' : 'border-line bg-canvas text-muted'}`}>
        <span className="block text-xs uppercase tracking-wide">{done ? 'Done' : active ? (status === 'error' ? 'Needs retry' : 'In progress') : 'Waiting'}</span>{label}</li>;
    })}
  </ol>;
}
