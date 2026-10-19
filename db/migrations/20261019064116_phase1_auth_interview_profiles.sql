create extension if not exists pgcrypto;
create table if not exists users (
 id uuid primary key default gen_random_uuid(), email text not null unique, password_hash text not null, totp_secret_enc text, totp_enabled boolean not null default false, recovery_codes_hashes jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
create table if not exists sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, token_hash text not null unique, assurance smallint not null default 1 check (assurance in (1,2)), expires_at timestamptz not null, created_at timestamptz not null default now()
);
create index if not exists sessions_token_idx on sessions(token_hash);
create table if not exists auth_attempts (key text primary key, attempts integer not null default 0, window_started_at timestamptz not null default now());
create table if not exists business_profiles (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references users(id) on delete cascade, version integer not null default 1, data jsonb not null default '{}'::jsonb, confirmed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id, version)
);
create index if not exists profiles_owner_idx on business_profiles(owner_id);
create table if not exists interview_answers (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references users(id) on delete cascade, profile_id uuid not null references business_profiles(id) on delete cascade, question text not null, answer text not null, skipped boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists answers_owner_idx on interview_answers(owner_id, created_at);
create table if not exists model_calls (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references users(id) on delete cascade, purpose text not null, model text not null, status text not null, created_at timestamptz not null default now()
);
alter table users enable row level security; alter table sessions enable row level security; alter table business_profiles enable row level security; alter table interview_answers enable row level security; alter table model_calls enable row level security; alter table auth_attempts enable row level security;
create policy users_owner on users using (id = current_setting('app.user_id', true)::uuid);
create policy sessions_owner on sessions using (user_id = current_setting('app.user_id', true)::uuid);
create policy profiles_owner on business_profiles using (owner_id = current_setting('app.user_id', true)::uuid);
create policy answers_owner on interview_answers using (owner_id = current_setting('app.user_id', true)::uuid);
create policy calls_owner on model_calls using (owner_id = current_setting('app.user_id', true)::uuid);
