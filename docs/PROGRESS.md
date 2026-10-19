# Progress

## Current state
- Root Next.js TypeScript App Router scaffold is present.
- Landing page, signup/signin entry screens, workspace shell and `/api/health` exist.
- Phase 1 PostgreSQL migration was applied for users, sessions, auth attempts, profiles, answers and model-call metadata, with owner RLS policies.

## Decisions
- PostgreSQL via `DATABASE_URL`; Gemini via server-only environment variables.
- Custom auth and authenticator TOTP are planned; no Supabase.
- Research remains outside this phase and will use persisted browser-triggered stages.

## Known failures / blockers
- Account controls are placeholders; no auth, TOTP, Gemini adapter, interview persistence or profile confirmation is wired.
- Automated tests are not yet added.

## Exactly one next action
Implement server-side signup/signin with hashed sessions and the AAL1-to-AAL2 TOTP flow against the applied schema.
