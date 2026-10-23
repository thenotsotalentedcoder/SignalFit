-- Phase 3: harden RLS for a non-owner app role, add matching/critique/save tables.
-- Policies use nullif() so a pooled connection with an emptied GUC never raises a uuid cast error.
-- app.auth='1' is set only by server-side withAuth() for pre-session auth work (signup/signin/session lookup).
drop policy if exists users_owner on users;
drop policy if exists sessions_owner on sessions;
drop policy if exists profiles_owner on business_profiles;
drop policy if exists answers_owner on interview_answers;
drop policy if exists calls_owner on model_calls;
drop policy if exists research_runs_owner on research_runs;
drop policy if exists evidence_owner on evidence;
drop policy if exists opportunities_owner on opportunities;
alter table auth_attempts enable row level security;
drop policy if exists attempts_auth on auth_attempts;
create policy attempts_auth on auth_attempts for all using (current_setting('app.auth', true) = '1') with check (current_setting('app.auth', true) = '1');
create policy users_owner on users for all using (id = nullif(current_setting('app.user_id', true), '')::uuid or current_setting('app.auth', true) = '1') with check (id = nullif(current_setting('app.user_id', true), '')::uuid or current_setting('app.auth', true) = '1');
create policy sessions_owner on sessions for all using (user_id = nullif(current_setting('app.user_id', true), '')::uuid or current_setting('app.auth', true) = '1') with check (user_id = nullif(current_setting('app.user_id', true), '')::uuid or current_setting('app.auth', true) = '1');
create policy profiles_owner on business_profiles for all using (owner_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (owner_id = nullif(current_setting('app.user_id', true), '')::uuid);
create policy answers_owner on interview_answers for all using (owner_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (owner_id = nullif(current_setting('app.user_id', true), '')::uuid);
create policy calls_owner on model_calls for all using (owner_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (owner_id = nullif(current_setting('app.user_id', true), '')::uuid);
create policy research_runs_owner on research_runs for all using (owner_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (owner_id = nullif(current_setting('app.user_id', true), '')::uuid);
create policy evidence_owner on evidence for all using (exists (select 1 from research_runs r where r.id = evidence.run_id and r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid)) with check (exists (select 1 from research_runs r where r.id = evidence.run_id and r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid));
create policy opportunities_owner on opportunities for all using (exists (select 1 from research_runs r where r.id = opportunities.run_id and r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid)) with check (exists (select 1 from research_runs r where r.id = opportunities.run_id and r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid));

alter table evidence add column if not exists body_text text, add column if not exists page_type text, add column if not exists extracted boolean not null default false;
alter table opportunities add column if not exists offer jsonb not null default '{}'::jsonb, add column if not exists dimensions jsonb not null default '{}'::jsonb, add column if not exists computed_score integer, add column if not exists critique jsonb not null default '{}'::jsonb, add column if not exists profile_version integer, add column if not exists buyer_role text, add column if not exists conflicts jsonb not null default '[]'::jsonb, add column if not exists assessment_status text not null default 'current';

create table if not exists opportunity_evidence (opportunity_id uuid not null references opportunities(id) on delete cascade, evidence_id uuid not null references evidence(id) on delete cascade, claim text not null default '', primary key (opportunity_id, evidence_id));
alter table opportunity_evidence enable row level security;
create policy opportunity_evidence_owner on opportunity_evidence for all using (exists (select 1 from opportunities o join research_runs r on r.id = o.run_id where o.id = opportunity_evidence.opportunity_id and r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid)) with check (exists (select 1 from opportunities o join research_runs r on r.id = o.run_id join evidence e on e.run_id = r.id where o.id = opportunity_evidence.opportunity_id and e.id = opportunity_evidence.evidence_id and r.owner_id = nullif(current_setting('app.user_id', true), '')::uuid));

create table if not exists saved_opportunities (id uuid primary key default gen_random_uuid(), owner_id uuid not null references users(id) on delete cascade, opportunity_id uuid not null references opportunities(id) on delete cascade, status text not null check (status in ('saved','worth_investigating','dismissed')), note text not null default '', dismiss_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (owner_id, opportunity_id));
alter table saved_opportunities enable row level security;
create policy saved_owner on saved_opportunities for all using (owner_id = nullif(current_setting('app.user_id', true), '')::uuid) with check (owner_id = nullif(current_setting('app.user_id', true), '')::uuid and exists (select 1 from opportunities o join research_runs r on r.id = o.run_id where o.id = saved_opportunities.opportunity_id and r.owner_id = saved_opportunities.owner_id));

do $$ begin if exists (select 1 from pg_roles where rolname = 'signalfit_app') then
  grant usage on schema public to signalfit_app;
  grant select, insert, update, delete on all tables in schema public to signalfit_app;
end if; end $$;
