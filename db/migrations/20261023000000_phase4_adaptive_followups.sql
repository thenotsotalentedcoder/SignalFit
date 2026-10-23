-- Phase 4: model-chosen follow-up questions are persisted so the interview can resume.
create table if not exists interview_followups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  field text not null,
  title text not null,
  hint text not null default '',
  choices jsonb not null default '[]'::jsonb,
  addresses text not null default '',
  created_at timestamptz not null default now(),
  unique (owner_id, field)
);
alter table interview_followups enable row level security;
drop policy if exists followups_owner on interview_followups;
create policy followups_owner on interview_followups for all
  using (owner_id = nullif(current_setting('app.user_id', true), '')::uuid)
  with check (owner_id = nullif(current_setting('app.user_id', true), '')::uuid);
do $$ begin if exists (select 1 from pg_roles where rolname = 'signalfit_app') then
  grant select, insert, update, delete on all tables in schema public to signalfit_app;
end if; end $$;
