-- Adds saved/bookmarked jobs for candidates, plus a private Storage bucket
-- for résumé uploads on job applications. Run this once in the Supabase SQL
-- editor after migrations 0002-0004 have been applied. Safe to re-run.

-- ─────────────────────────────────────────────────────────────
-- saved_jobs: a candidate bookmarking a job for later
-- ─────────────────────────────────────────────────────────────
create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  job_id uuid not null references jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists saved_jobs_user_idx on saved_jobs (user_id);

alter table saved_jobs enable row level security;

drop policy if exists "users can view their own saved jobs" on saved_jobs;
create policy "users can view their own saved jobs"
  on saved_jobs for select using (auth.uid() = user_id);

drop policy if exists "users can save jobs" on saved_jobs;
create policy "users can save jobs"
  on saved_jobs for insert with check (auth.uid() = user_id);

drop policy if exists "users can unsave their own saved jobs" on saved_jobs;
create policy "users can unsave their own saved jobs"
  on saved_jobs for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- resumes: private storage bucket for application résumé uploads
-- Path convention: {applicant_id}/{application-scoped filename}
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880, -- 5MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "candidates can upload their own resumes" on storage.objects;
create policy "candidates can upload their own resumes"
  on storage.objects for insert with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "candidates can replace their own resumes" on storage.objects;
create policy "candidates can replace their own resumes"
  on storage.objects for update using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "candidates can delete their own resumes" on storage.objects;
create policy "candidates can delete their own resumes"
  on storage.objects for delete using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "resumes are readable by owner, hiring employer, or admin" on storage.objects;
create policy "resumes are readable by owner, hiring employer, or admin"
  on storage.objects for select using (
    bucket_id = 'resumes'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from applications a
        join jobs j on j.id = a.job_id
        join companies c on c.id = j.company_id
        where c.owner_id = auth.uid()
          and a.applicant_id::text = (storage.foldername(name))[1]
      )
      or exists (
        select 1 from profiles where id = auth.uid() and role = 'admin'
      )
    )
  );
