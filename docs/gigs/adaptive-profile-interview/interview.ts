/**
 * Adaptive Profile Interview state (reusable utility; no framework or database imports).
 * Core questions are fixed; the model may add follow-ups, and the limit is enforced here, not by the model.
 */
export type Question = { field: string; stage: string; title: string; hint: string; optional?: boolean; choices?: string[]; addresses?: string };
export const MAX_QUESTIONS = 10;
export const TARGET_QUESTIONS = 8;

export const coreQuestions: Question[] = [
  { field: 'identity', stage: 'Business basics', title: 'Who are you and what does your business do?', hint: 'Solo or agency, name, location, markets served. A website or portfolio link is optional.' },
  { field: 'services', stage: 'Services', title: 'What services can you deliver today?', hint: 'Only work you can confidently deliver. Say "none yet" if you are just starting.' },
  { field: 'capabilities', stage: 'Services', title: 'Which tools, systems and methods have you actually used?', hint: 'For example: languages, platforms, integrations you have connected in real work.' },
  { field: 'customers', stage: 'Best-fit customers', title: 'Who do you most want to help?', hint: 'Industries, company size and the buyer roles you usually talk to.' },
  { field: 'proof', stage: 'Proof', title: 'What past project best proves this work?', hint: 'Outcome, scope, and a link if public. "I don\'t know" is fine.', optional: true },
  { field: 'delivery', stage: 'Capacity', title: 'What capacity and project size can you take on now?', hint: 'Team size, hours available, fixed scope or ongoing, rough timeline.' },
  { field: 'constraints', stage: 'Constraints', title: 'What work, locations, languages or timelines must be excluded?', hint: 'On-site work, services you will not provide, access limits. Skip if none.', optional: true }
];
export const stages = ['Business basics', 'Services', 'Best-fit customers', 'Proof', 'Capacity', 'Constraints', 'Review'];

export type Answers = Record<string, string>;
const noProof = (a: Answers) => /\b(no proof|none|none yet|not yet)\b/i.test(a.services ?? '');
export const visibleCore = (a: Answers) => coreQuestions.filter((q) => !(q.field === 'proof' && noProof(a)));
export const missingFields = (a: Answers, followups: Question[] = []) => [...visibleCore(a), ...followups].filter((q) => a[q.field] === undefined).map((q) => q.field);

export type Step =
  | { kind: 'question'; question: Question; index: number; total: number }
  | { kind: 'generate'; remaining: number }
  | { kind: 'done' };

/** What to show next. 'generate' means core is finished and the model may be asked for one more question. */
export function nextStep(a: Answers, followups: Question[] = [], closed = false): Step {
  const all = [...visibleCore(a), ...followups];
  const q = all.find((x) => a[x.field] === undefined);
  if (q) return { kind: 'question', question: q, index: all.indexOf(q) + 1, total: Math.max(all.length, Math.min(TARGET_QUESTIONS, MAX_QUESTIONS)) };
  const remaining = MAX_QUESTIONS - all.length;
  return !closed && remaining > 0 && followups.length < 3 ? { kind: 'generate', remaining } : { kind: 'done' };
}
export function canAddFollowup(a: Answers, followups: Question[], closed = false) { return nextStep(a, followups, closed).kind === 'generate'; }
export function allQuestions(a: Answers, followups: Question[]) { return [...visibleCore(a), ...followups]; }
