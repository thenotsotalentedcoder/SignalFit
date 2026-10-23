# Auth and isolation

Status: implemented; verified by `scripts/e2e-isolation.mjs` against a live server (2026-10-22).

- bcrypt (cost 12) passwords; random 32-byte session token, only its sha256 stored; cookie HttpOnly, SameSite=Lax, Secure in production.
- TOTP secret AES-256-GCM encrypted with a key derived from `SESSION_SECRET`. Enrollment is refused once enabled (an AAL1 session can't replace the authenticator). Verify elevates the session to AAL2 and rotates the token.
- Private routes require AAL2 (`requireAAL2`). AAL1 sessions get 401.
- Mutations call `checkOrigin` (Origin host must equal Host). Rate limits via `auth_attempts`: signup 10/h/IP, signin 8/15min/IP+email, TOTP 8/10min/user, research stages 60/h/user.
- RLS: every private table has an owner policy; app role `signalfit_app` is non-superuser. `app.auth='1'` (server-only, `withAuth`) is used solely for signup/signin/session lookup/rate limit.
- Direct-ID access by another account returns 404 for runs, opportunities, exports and notes.

Gaps: no email verification or recovery codes (no mail provider); rate limiter keys on `x-forwarded-for`, so a trusted proxy must set it; DNS re-resolution between check and fetch (rebinding) is not pinned.
