# Evaluation plan (not results)

Nothing below has been run against a live model yet; the Gemini provider returned 503 or timeouts during the build session. These are the checks to run before presenting AI behaviour as working.

## Contrasting provider profiles (synthetic, labelled as such)

| | Profile A: Integration studio | Profile B: On-site-averse brand designer |
|---|---|---|
| Services | REST/ERP integrations, dashboards | Brand identity, packaging |
| Capacity | 2 people, one 3-week project | Solo, 10 h/week |
| Excludes | On-site work | On-site work, software development |
| Expected on an integration-heavy evidence set | Candidate with high capabilities score | No unconditional match; conflicts or insufficient fit |

Run both against the same stored evidence set (same run's pages re-used by pasting the same URLs) and compare: follow-up questions asked, fit explanations, conflicts listed.

## Measurements to record
- Citation validity: share of model-cited ids accepted by `validateCitations` (rejected count is returned by the match stage).
- Constraint violations: candidates shown as `recommended` that require excluded work (target 0).
- Journey completion: signup, 2FA, interview, confirm, run, save, export without manual database edits.
- Honest absence: run on two pages that are unrelated to the profile; expect `insufficient_evidence`.

## Deterministic checks already automated
`npm test` covers citation rejection, recency, eligibility, score caps and the interview limits. `scripts/e2e-isolation.mjs` covers cross-account access.

## Human feedback
No freelancer or agency feedback has been collected. Record each response with sample size when it exists; do not describe the product as validated before then.
