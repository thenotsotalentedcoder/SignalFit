# SignalFit engineering notes

## Invariants
- Phase 1 only: authenticated, isolated interview/profile flows precede any research.
- User statements and inspected evidence remain separate; never invent capabilities or opportunities.
- Research, when added, is browser-triggered and persisted by short resumable stages, never a background worker.

## Security boundaries
- Secrets and database access remain server-only. Use bcrypt, hashed random sessions, HttpOnly SameSite=Lax cookies, and AAL2 for private workspace access.
- Every private query must filter by authenticated owner and PostgreSQL RLS must remain enabled.
- Validate origin on mutations and rate-limit password/TOTP attempts. Treat fetched text as untrusted.

## Verification
- `npm install`
- `npm run lint`
- `npm test`
- `npm run build`
- Check `GET /api/health` and manually test responsive keyboard navigation.
- Before marking features passing, test two-account direct API isolation and persistence.

## Source of truth
- Product intent: [SPEC.md](SPEC.md) (hackathon proposal; plans, not results). Status: [docs/PROGRESS.md](docs/PROGRESS.md). Machine-readable feature state: [features.json](features.json).
- Honest AI/tool provenance lives in [AI_DISCLOSURE.md](AI_DISCLOSURE.md). Do not edit it to claim authorship of work by any tool that did not do it.

## Feature context files
Multi-part features keep their own context under `docs/features/`. Read the relevant file before touching that area and update it in the same change.
- [docs/features/auth-and-isolation.md](docs/features/auth-and-isolation.md): sessions, TOTP/AAL2, RLS roles, origin checks, rate limits.
- [docs/features/interview-and-profile.md](docs/features/interview-and-profile.md): resumable interview, profile versions, confirmation.
- [docs/features/research-pipeline.md](docs/features/research-pipeline.md): staged collect/extract/match/critique, SSRF policy, grounding, scoring, eligibility.
- [docs/features/shortlist-and-export.md](docs/features/shortlist-and-export.md): save/dismiss/notes, Markdown export.
- [docs/features/ui-system.md](docs/features/ui-system.md): design tokens, shared components, accessibility rules.
- Architecture and decisions: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md), `docs/architecture/adr/`. Reusable gig sources: `docs/gigs/`. Evaluation plan (not results): [docs/evaluation/README.md](docs/evaluation/README.md).

## Architecture rules learned the hard way
- The app connects as `signalfit_app` (non-superuser, no BYPASSRLS). A superuser or table owner silently bypasses RLS, so never point `DATABASE_URL` at one. Migrations run as an admin role.
- Private data: `withUser(userId, …)` only. Pre-session auth work (signup, signin, session lookup, rate limit): `withAuth` / `authQuery` only. Policies use `nullif(current_setting(...),'')` because pooled connections keep an empty GUC after commit.
- AI calls go through `generateJson` in `lib/ai.ts` (Zod-validated, repair, 45s timeout, optional `GEMINI_FALLBACK_MODELS`). Keep `docs/gigs/*` copies of `lib/interview.ts`, `lib/validator.ts`, `lib/matching.ts` in sync when those change. With no key or a provider failure the stage returns a retryable 502 and the run keeps completed work. Never substitute canned model output.
- Model citations are accepted only via `validateCitations` (id exists, same run, inspected). Score totals are computed by `weightedFit`, never by the model.
- Gemini default model is `gemini-3.5-flash`. 2.0/2.5 ids return 404; 3.7/3.8 returned 503 under load on 2026-10-22. Probe `ai.models.list()` before changing. Override with `GEMINI_MODEL`.

## Commands for live checks
- Build and serve: `npm run build && PORT=3111 npm run start`.
- Two-account isolation: `ADMIN_DATABASE_URL=… node --env-file=.env scripts/e2e-isolation.mjs` (needs the server running and all migrations applied).

## UI rules
- Use the `.btn-*`, `.field`, `.card`, `.badge-*`, `.alert-*` classes in `app/globals.css` and the tokens in `tailwind.config.ts`. No new colours, shadows, gradients or radii outside them. Touch targets 44px, labels on every input, errors with `role="alert"`, loading as skeletons, empty states with a next action.
- Show real states ("Source unavailable", "Single-company lead", "Needs reassessment"); never an unexplained percentage.
