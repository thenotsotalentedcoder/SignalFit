# ADR 0001: Connect as a non-owner role; RLS keyed on a per-transaction setting

Status: accepted, 2026-10-22.

## Context
SPEC requires row-level security with ownership checks on every private read and mutation. The first implementation enabled RLS but connected as the PostgreSQL superuser, which bypasses every policy, so RLS provided no protection.

## Decision
- The app connects as `signalfit_app` (`NOSUPERUSER`, `NOBYPASSRLS`, not the table owner). Migrations run with `ADMIN_DATABASE_URL`.
- Private queries run inside `withUser(userId)`, which sets `app.user_id` with `set_config(..., true)` (transaction-local). Policies compare `owner_id` to `nullif(current_setting('app.user_id', true), '')::uuid`.
- Pre-session work (signup, signin, session lookup, rate limits) uses `withAuth`, which sets `app.auth='1'`; only `users`, `sessions` and `auth_attempts` accept it.
- Route handlers also filter by owner in SQL, so a policy mistake and a query mistake would both have to happen.

## Consequences
- Isolation is checked by `scripts/e2e-isolation.mjs`, including a hand-written query as another user.
- `nullif` is required: pooled connections retain an empty-string setting after commit, and `''::uuid` raises.
- `app.auth` is trusted server-side configuration, not a security boundary against SQL injection; parameterized queries are the defence there.
- Trade-off against Supabase RLS-with-JWT: simpler, no vendor dependency, but we own session handling and TOTP ourselves.
