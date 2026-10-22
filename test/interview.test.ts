import test from 'node:test'; import assert from 'node:assert/strict';
import { MAX_QUESTIONS, allQuestions, coreQuestions, missingFields, nextStep, type Question } from '../lib/interview';

const all = (extra: Record<string, string> = {}) => Object.fromEntries(coreQuestions.map((q) => [q.field, 'x'])) as Record<string, string> & typeof extra;
const fu = (n: number): Question[] => Array.from({ length: n }, (_, i) => ({ field: `followup_${i + 1}`, stage: 'Follow-up', title: 't', hint: '' }));

test('core questions come first and in order', () => {
  const s = nextStep({}); assert.equal(s.kind, 'question'); if (s.kind === 'question') assert.equal(s.question.field, 'identity');
});
test('proof is skipped when the user has no proof yet', () => {
  assert.ok(!missingFields({ identity: 'a', services: 'none yet' }).includes('proof'));
  assert.ok(missingFields({ identity: 'a', services: 'APIs' }).includes('proof'));
});
test('skipped answers (empty string) count as answered, so "I don\'t know" never blocks', () => {
  const a = all(); a.proof = ''; assert.equal(nextStep(a).kind, 'generate');
});
test('after core, the model may add follow-ups until a hard cap of three / ten total', () => {
  const a = all();
  assert.equal(nextStep(a, []).kind, 'generate');
  const f3 = fu(3); for (const f of f3) a[f.field] = 'y';
  assert.equal(nextStep(a, f3).kind, 'done');
  assert.ok(allQuestions(a, f3).length <= MAX_QUESTIONS);
});
test('a closed interview never asks the model again', () => { assert.equal(nextStep(all(), [], true).kind, 'done'); });
test('an unanswered follow-up is shown before anything else is generated', () => {
  const f = fu(1); const s = nextStep(all(), f); assert.equal(s.kind, 'question'); if (s.kind === 'question') assert.equal(s.question.field, 'followup_1');
});
