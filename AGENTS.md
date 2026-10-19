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
