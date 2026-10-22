# Shortlist, notes, export

- `PUT /api/opportunities/:id` upserts status (`saved`, `worth_investigating`, `dismissed` — dismissal requires a reason) and a note (<=4000 chars) per owner. Ownership is re-checked via the run; RLS also enforces it.
- `GET /api/saved` lists the owner's shortlist across runs; `/research` shows it and reopens runs.
- `GET /api/opportunities/:id/export` returns a Markdown brief: score caveat, offer, evidence with dates and excerpts, conflicts, critique, unknowns, notes.
- Nothing is sent externally; outreach is never drafted automatically.
