# Adaptive Profile Interview

Typed interview-state utility: fixed core questions, optional model-generated follow-ups, missing-field tracking, a hard question limit and skip/"I don't know" handling. No framework or database imports.

## Files
- `interview.ts`: `coreQuestions`, `nextStep`, `missingFields`, `allQuestions`, limits (`MAX_QUESTIONS = 10`).
- `interview.test.ts`: node test runner (`tsx --test`).

## Use
```ts
import { nextStep } from './interview';

const step = nextStep(answers, followups, closed);
if (step.kind === 'question') render(step.question, step.index, step.total);
else if (step.kind === 'generate') askModelForOneFollowUp(step.remaining); // you persist the result
else buildProfile(); // done
```
`answers` maps question field to the saved answer; an empty string means skipped and counts as answered. `closed` stops further generation. Persistence and the model call are yours to supply, which is what keeps the limit enforceable in code instead of in a prompt.

## Setup
Copy both files into a TypeScript project with `tsx` and run `npx tsx --test interview.test.ts`.

## Credits
Authored for SignalFit during the hackathon window by the SignalFit team. No third-party library code is included.
