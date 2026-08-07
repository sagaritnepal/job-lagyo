-- Adds an admin role plus job-approval / fraud-flagging / vendor-blacklisting
-- support. Run this once in the Supabase SQL editor after schema.sql (and
-- migrations 0002-0003) have been applied. Safe to re-run.

-- ─────────────────────────────────────────────────────────────
-- profiles: allow an 'admin' role
-- ─────────────────────────────────────────────────────────────
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('candidate', 'employer', 'admin'));

-- There's no self-signup path for admins — promote a user manually:
--   update profiles set role = 'admin' where id = '<user-id>';

-- ─────────────────────────────────────────────────────────────
-- companies: vendor blacklisting
-- ─────────────────────────────────────────────────────────────
alter table companies add column if not exists is_blacklisted boolean not null default false;
alter table companies add column if not exists blacklist_reason text;
alter table companies add column if not exists blacklisted_at timestamptz;

-- ─────────────────────────────────────────────────────────────
-- jobs: admin approval workflow + fraud flagging
-- ─────────────────────────────────────────────────────────────
alter table jobs drop constraint if exists jobs_status_check;
alter table jobs add constraint jobs_status_check
  check (status in ('draft', 'pending', 'published', 'rejected', 'flagged', 'closed'));

alter table jobs alter column status set default 'pending';

alter table jobs add column if not exists rejection_reason text;
alter table jobs add column if not exists flag_reason text;
alter table jobs add column if not exists reviewed_at timestamptz;

create index if not exists jobs_status_idx on jobs (status);

-- ─────────────────────────────────────────────────────────────
-- RLS: let admins see and moderate everything, and stop blacklisted
-- vendors from posting new jobs
-- ─────────────────────────────────────────────────────────────
create policy "admins can view all jobs"
  on jobs for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admins can update any job"
  on jobs for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "admins can update any company"
  on companies for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "employers can insert jobs for their own company" on jobs;
create policy "employers can insert jobs for their own company"
  on jobs for insert with check (
    company_id in (
      select id from companies where owner_id = auth.uid() and is_blacklisted = false
    )
  );
