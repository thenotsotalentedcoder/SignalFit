# ADR 0002: Browser-driven, persisted research stages (no worker)

Status: accepted, 2026-10-22.

## Context
Research needs several network fetches and model calls. SPEC and AGENTS.md require short resumable stages and forbid a background worker. The target host may interrupt long requests.

## Decision
Four endpoints on one route (`POST /api/research/run/:id` with `stage` = collect, extract, match, critique). Each does bounded work (collect: up to 12 pages in groups of 4; extract: 3 pages per call; match: one model call; critique: one call per candidate), commits, and returns the new state. The browser loops: extract repeats until `pending=0`.

## Alternatives rejected
- One long request: loses all work on timeout or deploy.
- Job queue/worker: violates the stated invariant and adds operations burden for a three-person team.

## Consequences
- Resume is the same button: stage calls are idempotent over stored rows.
- Per-user hourly budget (60 stage calls) bounds cost; a user can burn it with retries.
- Match deletes and recreates a run's opportunities; saved notes survive only if the opportunity row survives, so re-matching a run that already has saved items is a known sharp edge.
