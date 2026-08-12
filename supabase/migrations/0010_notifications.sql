-- In-app notifications. Rows are created automatically by triggers (not
-- application code) whenever: a candidate applies to a job (notifies the
-- employer), an application's status changes (notifies the candidate), or
-- a job post is approved/rejected/flagged by an admin (notifies the
-- employer). Run this once in the Supabase SQL editor after migration
-- 0009 has been applied. Safe to re-run.

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on notifications (user_id, created_at desc);

alter table notifications enable row level security;

drop policy if exists "users can view their own notifications" on notifications;
create policy "users can view their own notifications"
  on notifications for select using (auth.uid() = user_id);

drop policy if exists "users can update their own notifications" on notifications;
create policy "users can update their own notifications"
  on notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No insert/delete policy for regular users on purpose — rows are only
-- ever created by the security-definer trigger functions below, which run
-- with elevated privilege and bypass RLS (same pattern as handle_new_user()
-- in schema.sql), so a candidate's session can still cause a notification
-- row to be created for the employer they applied to, and vice versa.

-- ─────────────────────────────────────────────────────────────
-- New application -> notify the employer who owns the job
-- ─────────────────────────────────────────────────────────────
create or replace function notify_employer_on_application()
returns trigger as $$
declare
  v_owner_id uuid;
  v_job_title text;
  v_applicant_name text;
begin
  select c.owner_id, j.title into v_owner_id, v_job_title
  from jobs j
  join companies c on c.id = j.company_id
  where j.id = new.job_id;

  select full_name into v_applicant_name
  from profiles where id = new.applicant_id;

  if v_owner_id is not null then
    insert into notifications (user_id, type, title, body, link)
    values (
      v_owner_id,
      'application_received',
      'New application received',
      coalesce(v_applicant_name, 'A candidate') || ' applied to ' ||
        coalesce(v_job_title, 'your job posting'),
      '/dashboard/applications'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_application_created on applications;
create trigger on_application_created
  after insert on applications
  for each row execute procedure notify_employer_on_application();

-- ─────────────────────────────────────────────────────────────
-- Application status change -> notify the candidate
-- ─────────────────────────────────────────────────────────────
create or replace function notify_candidate_on_status_change()
returns trigger as $$
declare
  v_job_title text;
  v_status_label text;
begin
  if new.status is distinct from old.status then
    select title into v_job_title from jobs where id = new.job_id;

    v_status_label := case new.status
      when 'submitted' then 'Reviewing'
      when 'reviewed' then 'Reviewing'
      when 'shortlisted' then 'Shortlisted'
      when 'interviewing' then 'Interviewing'
      when 'rejected' then 'Rejected'
      when 'hired' then 'Hired'
      else new.status
    end;

    insert into notifications (user_id, type, title, body, link)
    values (
      new.applicant_id,
      'application_status',
      'Application update',
      'Your application for ' || coalesce(v_job_title, 'a job') ||
        ' is now "' || v_status_label || '"',
      '/my-applications'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_application_status_changed on applications;
create trigger on_application_status_changed
  after update on applications
  for each row execute procedure notify_candidate_on_status_change();

-- ─────────────────────────────────────────────────────────────
-- Job moderation (approved / rejected / flagged / closed) -> notify the
-- employer who owns the job
-- ─────────────────────────────────────────────────────────────
create or replace function notify_employer_on_job_status_change()
returns trigger as $$
declare
  v_owner_id uuid;
  v_status_label text;
begin
  if new.status is distinct from old.status then
    select owner_id into v_owner_id from companies where id = new.company_id;

    v_status_label := case new.status
      when 'pending' then 'Pending review'
      when 'published' then 'Published'
      when 'rejected' then 'Rejected'
      when 'flagged' then 'Flagged for review'
      when 'closed' then 'Closed'
      when 'draft' then 'Draft'
      else new.status
    end;

    if v_owner_id is not null then
      insert into notifications (user_id, type, title, body, link)
      values (
        v_owner_id,
        'job_moderated',
        'Job post update',
        '"' || new.title || '" is now "' || v_status_label || '"',
        '/dashboard/jobs'
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_job_status_changed on jobs;
create trigger on_job_status_changed
  after update on jobs
  for each row execute procedure notify_employer_on_job_status_change();
