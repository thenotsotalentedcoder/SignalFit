# SignalFit

**Find the work your business is built to win.**

Phase 1: authenticated SignalFit workspace with bcrypt sessions, authenticator TOTP (AAL2), owner-scoped interview persistence, Gemini-validated profile synthesis, editable review and confirmation. Phase 2 adds bounded authenticated research: one sector and geography per run, up to 12 public pages, persisted evidence, and an honest candidate or insufficient-evidence result. Critique, shortlist and export remain future phases.

## Run locally

1. Provide `DATABASE_URL`, `SESSION_SECRET`, and optionally `GEMINI_API_KEY` / `GEMINI_MODEL` through the workspace Secrets panel. The existing Phase 1 migration, interview uniqueness/index migration, and Phase 2 research/evidence migrations must be applied in the connected database.
2. Run `npm install`.
3. Run `npm run dev` and open the displayed local URL.

Useful commands: `npm run lint`, `npm test`, `npm run build`. Tests cover the real health handler, interview branching, and profile validation.

`GET /api/health` reports service status and whether server-side database/AI configuration is present. Create an account, scan the authenticator QR code, verify a code, then complete and confirm the interview. Visit `/research`, choose one sector/geography/engagement, and optionally supply public URLs. The server caps inspection at 12, records blocked pages as unavailable, and never treats snippets as evidence. If Gemini is unavailable, the app preserves answers and shows an incomplete draft; configure the key for live synthesis.
