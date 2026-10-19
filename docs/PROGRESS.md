# Progress

## Current state
- Phase 1 vertical slice is wired and repaired: bcrypt signup/signin, database sessions, encrypted TOTP enrollment/challenge, AAL2 workspace gate, owner-scoped PostgreSQL queries, resumable interview, Gemini profile synthesis, review and confirmation.
- The existing Phase 1 migration was not changed. A forward-only uniqueness/index migration was applied for resumable answer updates.
- Phase 2 bounded research is now implemented: authenticated users can create one-sector/one-geography runs, inspect up to 12 public URLs, persist unavailable pages and receive a deterministic candidate or insufficient-evidence result.

## Decisions
- PostgreSQL via `DATABASE_URL`; Gemini via server-only environment variables.
- Custom auth and authenticator TOTP are planned; no Supabase.
- Research remains outside this phase and will use persisted browser-triggered stages.

## Known limitations
- Email verification and recovery-code login are not implemented because no mail provider is configured; signup clearly does not claim verification.
- Rate limiting and strict origin checks should be hardened before production deployment.

## Next phase
Implement bounded, SSRF-safe research and evidence collection only after confirmed profiles.
