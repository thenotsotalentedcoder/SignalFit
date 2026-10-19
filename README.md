# SignalFit

**Find the work your business is built to win.**

Phase 1: authenticated SignalFit workspace with bcrypt sessions, authenticator TOTP (AAL2), owner-scoped interview persistence, Gemini-validated profile synthesis, editable review and confirmation. Research and opportunity discovery are not included yet.

## Run locally

1. Provide `DATABASE_URL`, `SESSION_SECRET`, and optionally `GEMINI_API_KEY` / `GEMINI_MODEL` through the workspace Secrets panel. The existing Phase 1 migration must be applied (it is already applied in the connected database).
2. Run `npm install`.
3. Run `npm run dev` and open the displayed local URL.

Useful commands: `npm run lint`, `npm test`, `npm run build`.

`GET /api/health` reports service status and whether server-side database/AI configuration is present. Create an account, scan the authenticator QR code, verify a code, then complete the interview. If Gemini is unavailable, the app preserves answers and shows an incomplete draft; configure the key for live synthesis. Research is not part of this phase.
