# Interview and profile

Status: implemented. Seven core questions (`lib/interview.ts`), then up to three model-chosen follow-ups, hard cap ten.

- Flow: core questions in order (`proof` skipped when services say none). When core is done, `/api/interview/followup` asks the model for ONE follow-up or `done`. The follow-up is stored in `interview_followups` so the interview resumes. A sentinel row `_closed` stops further generation. If the model is unavailable the user sees a retry and a "continue without follow-ups" option; nothing is invented.
- Answers upsert by (owner, question). Empty string = skipped / "I don't know" and counts as answered. Users can go Back and edit answers.
- `POST /api/profile` synthesizes a Zod-validated profile and inspects up to two public links found in answers (kept in `inspected`, shown apart from user statements). Without a working model it returns an explicit incomplete draft or a retryable error.
- Profiles are versioned. Editing in the UI (`PATCH`) creates a new unconfirmed version. Confirm requires acknowledging remaining `unknowns` (server enforced, 409 otherwise).
- Research runs snapshot the confirmed profile and version; newer versions mark old opportunities `needs_reassessment` on read.

Gap: live model follow-ups and synthesis not verified end to end (provider overloaded on 2026-10-22/23).
