# Progress

## Current state (2026-10-23)
- Auth: bcrypt, hashed DB sessions, encrypted TOTP, AAL2 gate, same-origin checks, rate limits. Verified by `scripts/e2e-isolation.mjs` against a live server.
- Isolation: app role without BYPASSRLS; two-account direct-ID tests pass; hand-written cross-user query returns nothing.
- Interview: core + model follow-ups (cap 10), resumable, back/edit; profile synthesis, portfolio link inspection, edit-as-new-version, confirm with unknown acknowledgement.
- Research: staged collect/extract/match/critique, SSRF-hardened fetch, citation validation, computed score, eligibility rules, honest insufficient-evidence result, history, reassessment flag.
- Shortlist: save / worth investigating / dismiss with reason, notes, Markdown export, `/saved`.
- UI: shared design tokens and shell, all screens restyled and responsive by construction (not browser-verified).
- Docs: architecture + 2 ADRs, per-feature files, extracted gig sources (`docs/gigs`), evaluation plan.
- Checks: `npm run lint`, `npm test` (31 pass), `npm run build`, e2e isolation script.

## Not verified
- Any successful live Gemini call through the app. During the sessions the provider returned 503 (high demand) or timeouts for every tried model; the retry, fallback and no-fake-results paths were exercised, the success path was not. Only `gemini-3.5-flash`, `gemini-3.6-flash` and `gemini-3-flash-preview` answered a bare probe at some point.
- Real-browser responsive and keyboard/screen-reader pass.
- Deployment, email verification, recovery codes, DNS pinning, side-by-side comparison.

## Known sharp edges
- Re-running `match` recreates a run's opportunities, so saved items on that run would be orphaned (see ADR 0002).
- Discovery scrapes DuckDuckGo HTML and may be blocked; manual URLs are the reliable path.
