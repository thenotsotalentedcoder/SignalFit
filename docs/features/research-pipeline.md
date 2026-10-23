# Research pipeline

Stages are browser-driven HTTP calls, each persisted before returning: `collect` -> `extract` (3 pages/call, repeat until pending=0) -> `match` -> `critique`. Failure sets `status='error'` with a message; calling the same stage again resumes. Evidence already stored is never refetched (unique on run + canonical URL; cap 12 per run).

- Fetch policy (`lib/research.ts`): http(s) only, ports 80/443, no credentials, BlockList for private/loopback/link-local/CGNAT/ULA/IPv4-mapped, DNS result checked, manual redirects (max 4) re-validated, 10s timeout, 500KB cap, text/html only. Blocked pages stored as `unavailable`.
- Extraction: model returns page type, employer, role, location, duties, and a date string that must appear verbatim in the page text, otherwise the date is dropped (undated sources can't establish recency). JSON-LD `datePosted` is trusted as structured data.
- Matching: model sees confirmed profile + evidence ids; proposes <=3 candidates with 0-5 dimension scores (null = unknown). Code (`lib/validator.ts`) rejects ids not in this run/uninspected, computes the weighted total, label (`strong` impossible with unknowns/conflicts) and eligibility: `recommended` needs 2 distinct employers with job postings published in the last 30 days plus 1 context page; one cited page is `discovery_lead`; constraint conflicts -> `conditional`. No supported candidate -> an explicit `insufficient_evidence` row.
- Critique: second call may keep, downgrade (recommended -> lead) or exclude.
- Prompts treat fetched text as untrusted data inside a JSON payload.

Known limits: discovery is DuckDuckGo HTML scraping (may be blocked; manual URLs are the reliable path); script-rendered job boards return little text and are recorded unavailable.
