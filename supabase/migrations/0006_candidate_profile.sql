-- Adds a detailed candidate profile: field(s) of expertise, education,
-- work experience, and certificate/document proof. Required before a
-- candidate can apply to jobs (enforced in the app layer, not here).
-- Run this once in the Supabase SQL editor after migrations 0002-0005 have
-- been applied. Safe to re-run.

-- ─────────────────────────────────────────────────────────────
-- candidate_profiles: 1:1 with profiles, holds field(s) of expertise
-- ─────────────────────────────────────────────────────────────
create table if not exists candidate_profiles (
  id uuid primary key references profiles (id) on delete cascade,
  -- keep in sync with JOB_CATEGORY_NAMES in src/lib/constants.ts
  categories text[] not null default '{}' check (
    categories <@ array[
      'Information Technology',
      'Banking & Finance',
      'Sales & Marketing',
      'Customer Service',
      'Education & Teaching',
      'Hospitality & Tourism',
      'Creative & Design',
      'Healthcare & Medicine'
    ]::text[]
  ),
  bio text,
  updated_at timestamptz not null default now()
);

create index if not exists candidate_profiles_categories_idx
  on candidate_profiles using gin (categories);

alter table candidate_profiles enable row level security;

drop trigger if exists candidate_profiles_set_updated_at on candidate_profiles;
create trigger candidate_profiles_set_updated_at
  before update on candidate_profiles
  for each row execute procedure set_updated_at();

drop policy if exists "candidates can view their own profile" on candidate_profiles;
create policy "candidates can view their own profile"
  on candidate_profiles for select using (auth.uid() = id);

drop policy if exists "candidates can upsert their own profile" on candidate_profiles;
create policy "candidates can upsert their own profile"
  on candidate_profiles for insert with check (auth.uid() = id);

drop policy if exists "candidates can update their own profile" on candidate_profiles;
create policy "candidates can update their own profile"
  on candidate_profiles for update using (auth.uid() = id);

drop policy if exists "admins can view all candidate profiles" on candidate_profiles;
create policy "admins can view all candidate profiles"
  on candidate_profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- candidate_education
-- ─────────────────────────────────────────────────────────────
create table if not exists candidate_education (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references profiles (id) on delete cascade,
  institution text not null,
  degree text not null,
  field_of_study text,
  start_year integer,
  end_year integer, -- null = currently studying
  created_at timestamptz not null default now()
);

create index if not exists candidate_education_candidate_idx
  on candidate_education (candidate_id);

alter table candidate_education enable row level security;

drop policy if exists "candidates manage their own education" on candidate_education;
create policy "candidates manage their own education"
  on candidate_education for all
  using (auth.uid() = candidate_id)
  with check (auth.uid() = candidate_id);

drop policy if exists "admins can view all education" on candidate_education;
create policy "admins can view all education"
  on candidate_education for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- candidate_experience
-- ─────────────────────────────────────────────────────────────
create table if not exists candidate_experience (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references profiles (id) on delete cascade,
  company_name text not null,
  job_title text not null,
  start_date date not null,
  end_date date, -- null = current role
  description text,
  created_at timestamptz not null default now()
);

create index if not exists candidate_experience_candidate_idx
  on candidate_experience (candidate_id);

alter table candidate_experience enable row level security;

drop policy if exists "candidates manage their own experience" on candidate_experience;
create policy "candidates manage their own experience"
  on candidate_experience for all
  using (auth.uid() = candidate_id)
  with check (auth.uid() = candidate_id);

drop policy if exists "admins can view all experience" on candidate_experience;
create policy "admins can view all experience"
  on candidate_experience for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- candidate_certificates: metadata for uploaded proof documents
-- ─────────────────────────────────────────────────────────────
create table if not exists candidate_certificates (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  issuer text,
  issue_date date,
  document_path text not null, -- path in the candidate-documents bucket
  created_at timestamptz not null default now()
);

create index if not exists candidate_certificates_candidate_idx
  on candidate_certificates (candidate_id);

alter table candidate_certificates enable row level security;

drop policy if exists "candidates manage their own certificates" on candidate_certificates;
create policy "candidates manage their own certificates"
  on candidate_certificates for all
  using (auth.uid() = candidate_id)
  with check (auth.uid() = candidate_id);

drop policy if exists "admins can view all certificates" on candidate_certificates;
create policy "admins can view all certificates"
  on candidate_certificates for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- candidate-documents: private storage bucket for certificate uploads
-- Path convention: {candidate_id}/{type}-{timestamp}.{ext}
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'candidate-documents',
  'candidate-documents',
  false,
  5242880, -- 5MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "candidates can upload their own documents" on storage.objects;
create policy "candidates can upload their own documents"
  on storage.objects for insert with check (
    bucket_id = 'candidate-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "candidates can replace their own documents" on storage.objects;
create policy "candidates can replace their own documents"
  on storage.objects for update using (
    bucket_id = 'candidate-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "candidates can delete their own documents" on storage.objects;
create policy "candidates can delete their own documents"
  on storage.objects for delete using (
    bucket_id = 'candidate-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "candidate documents are readable by owner, hiring employer, or admin" on storage.objects;
create policy "candidate documents are readable by owner, hiring employer, or admin"
  on storage.objects for select using (
    bucket_id = 'candidate-documents'
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
