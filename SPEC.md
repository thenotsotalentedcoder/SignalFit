# SignalFit

> Find the work your business is built to win.

**One-line pitch:** SignalFit uses adaptive AI to understand your business and turn live market signals into client opportunities matched to your skills, capacity and goals.

**Pitch date:** 16 October 2026  
**Team size:** Three members  
**Build window:** 19 October 2026, 9:00 AM PKT to 22 October 2026, 11:00 PM PKT  
**Status:** Proposed product specification. Features, evaluation targets and architecture below describe the planned hackathon build, not completed functionality or validated commercial results.

## 1. The problem

A capable freelancer or small agency can know how to deliver a service without knowing which companies need it now, which needs fit their capacity, or what offer would make sense to a buyer.

Today, that decision involves disconnected work: describing capabilities, searching job boards and company websites, reading responsibilities, comparing alternatives, identifying a buyer and turning the findings into an offer. A generic prospect list supplies names without a reason to approach. A generic AI answer can sound convincing while assuming skills the provider does not have or treating a vacancy as proof that the employer wants to outsource.

SignalFit addresses the decision before outreach: **Which real, current business need should I pursue, why does it fit me, and what do I still need to verify?**

### Initial user

The hackathon MVP focuses on solo professionals and small agencies offering software development, workflow automation, integrations or digital services. They can describe their work and provide portfolio links, but lack a dedicated market-research or sales team.

The profile model supports other service businesses later. The initial build will demonstrate one provider, one target sector and one geography per research run rather than promise exhaustive discovery for every profession and country.

### Why it matters

These users spend scarce delivery time deciding where to look for work. Pursuing an unsuitable prospect can consume discovery calls, proposal writing and technical scoping before the mismatch becomes visible. SignalFit aims to make that decision more informed and explainable. Time saved, conversion improvement and willingness to pay are hypotheses to test, not claims of established impact.

## 2. The solution

SignalFit combines an adaptive business interview with a source-backed opportunity workspace.

1. **Understand the provider.** Ask focused questions, use the answers to choose follow-ups, and produce an editable business profile.
2. **Find current demand.** Research accessible employer and company sources for recurring work in the selected market.
3. **Match the work to the provider.** Compare the observed duties with confirmed capabilities, proof of delivery, available capacity and constraints.
4. **Challenge the match.** Run a separate critique pass that looks for unsupported assumptions, alternatives and reasons the offer may fail.
5. **Make the next step concrete.** Save a ranked shortlist with sources, a bounded service offer, likely buyer role and discovery questions.

The product's central distinction is the connection between **who the provider actually is** and **what the market demonstrably needs**. Onboarding becomes an input to research, ranking and offer design, rather than a form that disappears after signup.

## 3. One complete user journey

An illustrative user is a small automation studio that builds API integrations and dashboards, has delivered invoice-processing work, and can take on one small project. This is a demo scenario, not a customer testimonial.

1. The user signs up, verifies their email, enrolls an authenticator for two-factor authentication and completes the second-factor challenge.
2. They describe their business in a few sentences. A website or portfolio URL is optional; users without a website can proceed.
3. SignalFit asks one focused question at a time. If the user offers integrations, it may ask which systems they have actually connected. If they are at capacity, it asks what kind of smaller engagement they could accept. Follow-ups depend on the answers.
4. The user reviews and corrects the resulting business profile. User statements and inspected portfolio evidence remain distinguishable. Research starts only after profile confirmation.
5. The user chooses a sector, geography and desired engagement, then starts a research run. A progress view shows source collection, extraction, matching and review.
6. SignalFit presents up to three opportunity cards, or an explicit insufficient-evidence result. Each card explains the observed work, provider fit, limits, source dates and unresolved questions.
7. The user opens a card, inspects its citations and saves it with a note. They can mark it as worth investigating or dismiss it with a reason.
8. They sign out, sign in with 2FA and return to the saved profile, research history, shortlist and notes. The data remains after an application restart.

## 4. Adaptive onboarding

The interview gathers the minimum context needed to make a useful match:

| Area | What SignalFit needs to learn |
|---|---|
| Business identity | Solo worker or company; what it sells; current customer types |
| Capabilities | Services, technologies and workflows the user can deliver |
| Proof | Relevant projects, portfolio sources and what those sources actually establish |
| Capacity | Team size, available time, preferred project size and delivery timeline |
| Commercial preferences | Target sectors, markets, engagement model and optional budget preferences |
| Constraints | Excluded work, access limitations, languages, on-site requirements and professional boundaries |
| Goals | First clients, a new niche, recurring work or a specific service to grow |

The model receives the current profile, answered questions and missing fields. It returns a structured next question, the uncertainty it addresses and any proposed profile updates. Questions may offer short choices plus free text. The interface never presents the model's internal reasoning.

Target interview length is four to eight questions, with a maximum of ten in the MVP. Users may answer "I don't know," skip optional questions, revise answers and resume later. Missing essential context results in a request for clarification, not an invented capability. A review screen shows remaining unknowns and lets users confirm an incomplete profile explicitly.

## 5. MVP features and scope

### Must ship

- Sign-up, sign-in, sign-out and working authenticator-based 2FA.
- Private, persistent workspace for each account.
- Adaptive onboarding with saved answers and an editable, confirmed business profile.
- One sector and one geography per bounded research run.
- Live web discovery and inspection of accessible source pages, with manual URL entry as a complementary route.
- Structured evidence records, canonical URLs, source dates, excerpts and duplicate handling.
- AI extraction of duties and company context, provider-fit assessment, offer generation and a separate critique pass.
- Up to three ranked opportunities with linked evidence, limitations and suggested buyer-discovery questions.
- Save, dismiss, annotate and reopen results; export a concise Markdown brief.
- Clear loading, empty, partial-result and recoverable error states.

### Deliberately outside the hackathon MVP

- Automated email, messaging, contact enrichment or a full CRM.
- Unattended bulk scraping, login-gated sources or paid data-feed integrations.
- Exhaustive market coverage, continuous monitoring or scheduled collection.
- Team collaboration, billing, payments or a marketplace for buying services.
- Autonomous software building, staffing or delivery of the recommended offer.
- Guaranteed savings, sales outcomes, verified buyer intent or a claim of product-market fit.

If time remains after the core path passes, add side-by-side comparison of two opportunities and richer evidence filters. These are not dependencies of the demonstration.

## 6. AI at the core

AI performs distinct, stateful tasks within the product:

| Stage | Model context | Structured result | Product control |
|---|---|---|---|
| Interview | Previous answers, profile and missing context | Next question and proposed updates | Question limit; user confirms the profile |
| Evidence extraction | Retrieved page text and source metadata | Duties, employer, dates and supported observations | Schema checks; retain excerpts and provenance |
| Matching | Confirmed provider profile and stored evidence IDs | Fit rationale, gaps and bounded offer | Deterministic evidence and constraint checks |
| Critique | Proposed offer and its evidence | Objections, unsupported claims and discovery questions | Revise, downgrade or exclude the candidate |

The model may reference only evidence IDs supplied to the current run. The backend resolves citations from stored records; it rejects nonexistent IDs rather than displaying invented links. A critique pass is a second model call with a different task, not proof of independent human review.

### Evidence discipline

- A job posting indicates advertised work. It does not establish dissatisfaction, an available outsourcing budget or willingness to buy.
- Facts, user declarations, model inferences and unknowns are labeled separately.
- A source is inspected before it supports a claim. Search snippets are discovery aids only.
- Source text is untrusted input. Instructions embedded in a page cannot change the workflow, access another account or trigger actions.
- Observations record access time and publication date when available. Undated sources cannot establish recency.
- An offer must explain what the provider delivers and what stays with the buyer. A bounded automation is not compared with an entire salary as if it replaces the whole role.
- No fabricated contacts, quotations, prices, ROI or portfolio claims.

### Failure handling

Validate structured model responses, allow one repair attempt and then return a useful error while preserving the user's progress. Apply request timeouts, per-run source/model-call budgets and rate limits. A provider outage or exhausted quota leaves a retryable run; it never becomes a hardcoded successful AI response. Keep credentials server-side and maintain working provider access through judging.

## 7. Research and ranking

For each run, target six to twelve inspected pages, with a hard cap of twelve. Prioritize employer career pages, public ATS pages, company websites and relevant vendor documentation. Use live search to discover URLs and a server-side fetch/extraction tool to inspect them. Respect access restrictions; blocked pages are recorded as unavailable and reduce coverage.

The MVP does not need a bespoke adapter for each job board. If search or a source is unavailable, users can supply accessible URLs, and the interface reports the reduced scope. Manually supplied evidence still goes through live extraction and matching.

Normalize company names and canonical URLs. Collapse likely duplicates using employer, role and location, preserving the underlying source references. Group overlapping duties within this small evidence set through structured model output. Compare each group with the confirmed business profile.

### Recommendation eligibility

A recommended opportunity needs at least two distinct employers with dated work evidence from the last 30 days and at least one inspected company or vendor context page. A single-company signal may appear as a discovery lead, clearly separated from a recommended opportunity. The app must be able to return no qualifying opportunities.

Hard constraints override ranking: an explicitly excluded service, unavailable capacity, missing essential skill or required on-site delivery the provider cannot support makes a candidate unsuitable or conditional. A new skill the user could learn is not represented as an existing capability.

### Explainable fit score

The model proposes a 0-5 rating and evidence references for each dimension; application code computes the weighted total. The score is a prioritization aid, not a probability of closing a sale.

| Dimension | Weight |
|---|---:|
| Match to confirmed capabilities | 30% |
| Relevance of demonstrated past work | 20% |
| Capacity and delivery-constraint fit | 20% |
| Strength and recency of demand evidence | 20% |
| Match to preferred market and engagement | 10% |

Unknown dimensions remain visible and prevent a "strong fit" label. Each card lists what increased or reduced its fit, missing facts and the profile version used. Editing the profile marks previous assessments as needing reassessment; historical results remain intact.

## 8. What an opportunity contains

Each card and detailed brief includes:

- A plain-language name and the workflow observed in the sources.
- The companies advertising that work, dated links and short supporting excerpts.
- Why it matches the provider's services, proof, capacity and preferences.
- A bounded proposed offer with deliverables, retained buyer responsibilities and a small first engagement.
- Existing alternatives found in the inspected sources, or an explicit statement that they were not established.
- A likely buyer role, labeled as an inference unless directly sourced.
- Questions to confirm urgency, workflow volume, current systems, procurement and willingness to try the offer.
- Fit score breakdown, critique findings, unknowns and the research cutoff.

An opportunity is a reason to start an informed conversation, not a claim that a company has agreed to buy. Outreach is drafted only as a suggested next step; SignalFit sends nothing.

## 9. Technical approach

**Planned stack:** Next.js with TypeScript for the web interface and server endpoints; Tailwind CSS and an accessible component library for UI; Supabase PostgreSQL and Auth for persistent data and authentication; a hosted model API for structured AI calls; a web-search API and server-side page extraction for research. Final provider/model choices will follow the credits and tools available at kickoff and will be recorded in the repository.

Build and iterate in the Devmarketplace workspace. Deploy the web application to a managed Next.js-compatible host and use hosted PostgreSQL so application restarts do not erase user data.

The server orchestrates short, bounded stages: save interview answer, generate question, confirm profile, collect sources, extract evidence, generate matches, critique and save the final run. Persist each stage before continuing. The UI displays the run's last saved state. Interrupted processing is explicitly retryable; successful evidence records are reused rather than refetched unnecessarily.

Research requests accept only public HTTP(S) destinations. Block loopback, private-network and metadata-service addresses, recheck redirects and resolved destinations, and cap response size, content type and fetch duration. The tool cannot execute downloaded content. Provider keys and privileged database credentials never reach the browser.

## 10. Data model and account isolation

| Entity | Main fields and purpose |
|---|---|
| User | Managed auth identity, email and second-factor enrollment |
| BusinessProfile | Owner ID, version, business type, services, proof references, capacity, preferences, constraints, unknowns, confirmation time |
| InterviewAnswer | Owner ID, profile ID, question, answer, timestamp; supports resume and review |
| ResearchRun | Owner ID, confirmed profile snapshot, sector, geography, status, stage, source budget, timestamps and errors |
| Evidence | Owner ID, run ID, original/canonical URL, publisher, employer, observed/published time, excerpt, extracted duties, access status and provenance |
| Opportunity | Owner ID, run ID, name, offer, fit dimensions, computed score, constraints, critique, unknowns and assessment status |
| OpportunityEvidence | Owner ID, opportunity ID, evidence ID and supporting claim; references must belong to the same run |
| SavedOpportunity | Owner ID, opportunity ID, user status, note and timestamps |

All private tables carry an owner identifier. Enforce row-level security and check ownership on every server read and mutation. Use the user's authenticated database context for ordinary operations. Research results and exports are private by default. Do not expose private profile data through a public share URL in the MVP.

After 2FA enrollment, require a verified second-factor session for workspace access. The test plan includes direct URL/API access attempts across two accounts, not only hiding another user's cards in the interface.

## 11. User experience

Five main screens keep the product focused:

1. **Account and security:** signup, signin and authenticator setup/challenge.
2. **Business interview:** one question at a time, clear progress, editable answers and resume.
3. **Profile review:** confirmed strengths, capacity, constraints and missing facts before research.
4. **Research workspace:** sector/market selection, stage progress and opportunity cards with fit explanations.
5. **Opportunity detail and saved work:** evidence beside each claim, critique, notes and export.

Use plain language and visible uncertainty. Show "source unavailable," "single-company lead" and "needs confirmation" when those are the actual states. Avoid empty dashboards, unexplained percentages and generic AI chat as the primary interface. Support keyboard navigation and a usable mobile layout.

## 12. Build plan and team responsibilities

### Four-day delivery plan

| Date (PKT) | Deliverable | Exit check |
|---|---|---|
| 19 Oct, 9:00 AM-1:00 PM | Create product implementation in Devmarketplace; deploy initial app; connect auth, database and one live interview call | Organiser can see a working app in progress; an answer is saved |
| 19 Oct, afternoon/evening | Finish 2FA, account isolation, resumable interview and profile confirmation | Two accounts have separate saved profiles; second factor is enforced |
| 20 Oct | Source discovery/inspection, evidence storage and profile-grounded matching | A live run saves evidence and a candidate or honest insufficient-evidence result; publish first code gig |
| 21 Oct | Critique, score explanations, saved shortlist, notes and export | Full core journey works on the deployed app; publish second code gig |
| 22 Oct, before 8:00 PM | Fix failure cases, run acceptance checks and record demo | Authentication, AI and persistence checks pass; three-minute demo ready |
| 22 Oct, 8:00 PM-11:00 PM | Final review, documentation and Devpost submission before code freeze | Live URL, video, repository, two gig links and all members included |

### Responsibility split

The team has **three members**, with the following planned responsibility split:

| Team role | Primary responsibilities |
|---|---|
| Frontend and experience owner | Interview interface, profile review, opportunity cards, saved-work screens, accessibility and responsive layout |
| AI and research owner | Adaptive interview logic, source discovery/extraction, evidence-grounded matching, critique and evaluation |
| Backend and delivery owner | Database, authentication and 2FA, account isolation, research-run persistence, deployment and integration testing |

All three members share end-to-end testing, code review and demo preparation. The team lead additionally coordinates scope, checkpoint communication and submission. Individual names and registration details are supplied in the pitch form; these role assignments describe the planned division of work.

### Reuse and code gigs

Use established framework, auth and UI components and inspect relevant approved Devmarketplace gigs during the build. Preserve source attribution and record actual dependencies, licenses, AI assistants and models in AI_DISCLOSURE.md. Product implementation begins within the event window; this pitch repository contains documentation only.

Publish two reusable pieces authored during the event:

1. **Adaptive Profile Interview:** a typed interview-state utility with missing-field tracking, question limits, answer persistence and profile-confirmation hooks.
2. **Evidence-Linked Recommendation Validator:** a utility that checks citation IDs, same-run ownership, recency and score calculations before recommendations are displayed.

Each gig will include its purpose, setup instructions, usage example and contributor credits. Extract only the team's newly authored utility code, not third-party library code.

## 13. Acceptance tests and demo

The build is complete when the deployed core journey passes these checks:

| Area | Acceptance check |
|---|---|
| Authentication | New user signs up, enrolls and uses 2FA, signs out and signs back in |
| Isolation | Account B cannot read or modify account A's profile, runs, opportunities or notes through UI or direct requests |
| Adaptive AI | Two contrasting provider profiles produce relevant follow-up questions and materially different fit explanations over a shared evidence set |
| Grounding | Every displayed citation resolves to stored evidence from the run; nonexistent IDs and unsupported recency claims are rejected |
| Honest absence | Sparse or inaccessible evidence produces a partial/insufficient result without invented opportunities |
| Constraints | A provider who excludes on-site work or lacks an essential skill does not receive an unconditional match requiring it |
| Persistence | Profile, evidence, results and notes survive an application restart and a fresh authenticated session |
| Reliability | Model timeout, invalid structured output and source failure preserve completed work and offer a retry |
| Delivery | Export works; public docs are complete; two authored code gigs are published; live AI remains available for judges |

Prepare a small, explicitly labeled evaluation set of contrasting provider profiles and manually reviewed source examples during the event. Measure citation validity, constraint violations and completion of the user journey. These are evaluation plans, not achieved results. Seek feedback from available freelancers or small agencies on whether the shortlist is understandable and worth investigating; report any feedback honestly with its sample size.

**Three-minute demo:** establish the user/problem; show signup and 2FA; answer a few adaptive questions and confirm the profile; run live research; inspect one opportunity's source and fit explanation; save a note; show persisted data after restart and signin. Previously saved runs may demonstrate history, but must never be presented as a newly completed live model call.

## 14. Risks and scope controls

| Risk | Response |
|---|---|
| Sources block access or lack current jobs | Prioritize accessible employer pages; accept user URLs; expose coverage limits; allow no-match results |
| Broad research exceeds time or credits | One sector/market, twelve-source cap, short extracts and bounded model calls; preserve partial progress |
| AI overstates buyer intent or provider capability | Confirm profile, require source IDs, apply constraint checks and critique; label inferences |
| 2FA or isolation slips late | Implement and test on day one; no exemption assumed |
| Deployment interrupts long research | Persist stages and results; explicit safe retry from the last completed stage |
| Too many features dilute completion | Protect the complete journey; defer integrations, monitoring, outreach and collaboration |

## 15. Impact, validation and future direction

The intended outcome is a provider who can explain: **"These companies are advertising work related to what I can deliver; here is the evidence, the small offer I could test, and what I must ask before assuming they are a buyer."**

Initial validation will test whether users understand and trust the reasoning and can identify a worthwhile next conversation. The hackathon demonstrates technical feasibility and usefulness of the workflow; it does not establish customer traction, market size or improved sales conversion.

After the core workflow is validated, expand to additional service categories, repeat research with fresh evidence, learn from user dispositions and actual buyer feedback, and add optional CRM integrations. A subscription or research-credit model is a business hypothesis to evaluate after usefulness and research costs are measured. The long-term goal is an opportunity-discovery workspace that stays grounded in both the provider's changing capabilities and current market evidence.
