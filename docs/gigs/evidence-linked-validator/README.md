# Evidence-Linked Recommendation Validator

Checks model output before it is displayed: citation ids must exist, belong to the same run and have been inspected; recency needs a real date; eligibility and the weighted score are computed in code, never taken from the model.

## Files
- `validator.ts`: `validateCitations`, `isRecent`, `eligibility`, `scoreDimensions`, `fitLabel`.
- `matching.ts`: `weightedFit` (30/20/20/20/10 weights, 0-5 inputs, 0-100 output).
- `validator.test.ts`: tests for rejection, recency, eligibility and score caps.

## Use
```ts
import { validateCitations, eligibility, scoreDimensions, fitLabel } from './validator';

const { valid, rejected } = validateCitations(candidate.evidenceIds, evidenceById, runId);
const kind = eligibility(valid.map((id) => evidenceById.get(id)!), allInspected);
const { total, unknown } = scoreDimensions(candidate.dimensions);
const label = fitLabel(total, unknown, candidate.conflicts); // 'strong' is impossible with unknowns or conflicts
```

## Setup
Copy the three source files into a TypeScript project with `tsx`; `npx tsx --test validator.test.ts`.

## Credits
Authored for SignalFit during the hackathon window by the SignalFit team. No third-party library code is included.
