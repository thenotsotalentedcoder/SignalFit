alter table research_runs enable row level security;
alter table evidence enable row level security;
alter table opportunities enable row level security;
drop policy if exists research_runs_owner on research_runs;
drop policy if exists evidence_owner on evidence;
drop policy if exists opportunities_owner on opportunities;
create policy research_runs_owner on research_runs for all using (owner_id = (current_setting('app.user_id', true))::uuid) with check (owner_id = (current_setting('app.user_id', true))::uuid);
create policy evidence_owner on evidence for all using (exists (select 1 from research_runs r where r.id=evidence.run_id and r.owner_id=(current_setting('app.user_id', true))::uuid)) with check (exists (select 1 from research_runs r where r.id=evidence.run_id and r.owner_id=(current_setting('app.user_id', true))::uuid));
create policy opportunities_owner on opportunities for all using (exists (select 1 from research_runs r where r.id=opportunities.run_id and r.owner_id=(current_setting('app.user_id', true))::uuid)) with check (exists (select 1 from research_runs r where r.id=opportunities.run_id and r.owner_id=(current_setting('app.user_id', true))::uuid));
