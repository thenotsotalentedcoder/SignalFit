# SignalFit

**Find the work your business is built to win.**

Phase 1 foundation: a Next.js App Router experience with landing, account entry screens, workspace shell, health endpoint, and the PostgreSQL schema for the upcoming authenticated interview/profile flow.

## Run locally

1. Copy `.env.example` to your environment and provide `DATABASE_URL` and `SESSION_SECRET` through the workspace Secrets panel (Gemini is optional for the foundation).
2. Run `npm install`.
3. Run `npm run dev` and open the displayed local URL.

Useful commands: `npm run lint`, `npm test`, `npm run build`.

`GET /api/health` reports service status and whether server-side database/AI configuration is present. The signup/signin controls and workspace are intentionally not wired yet; later work will add custom bcrypt sessions, TOTP and the resumable interview. Research is not part of this phase.
