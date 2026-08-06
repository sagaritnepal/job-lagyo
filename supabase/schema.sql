-- Job Lagyo database schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- profiles: one row per auth user (candidate or employer)
-- ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'candidate' check (role in ('candidate', 'employer')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are viewable by everyone"
  on profiles for select using (true);

create policy "users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'candidate'),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- companies
-- ─────────────────────────────────────────────────────────────
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  website text,
  description text,
  location text not null default 'Kathmandu',
  created_at timestamptz not null default now()
);

alter table companies enable row level security;

create policy "companies are viewable by everyone"
  on companies for select using (true);

create policy "owners can insert their own company"
  on companies for insert with check (auth.uid() = owner_id);

create policy "owners can update their own company"
  on companies for update using (auth.uid() = owner_id);

-- ─────────────────────────────────────────────────────────────
-- jobs
-- ─────────────────────────────────────────────────────────────
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  title text not null,
  slug text not null unique,
  category text not null,
  job_type text not null check (
    job_type in ('full-time', 'part-time', 'internship', 'contract', 'remote')
  ),
  location text not null default 'Kathmandu',
  salary_min integer,
  salary_max integer,
  salary_period text not null default 'monthly' check (salary_period in ('monthly', 'yearly')),
  description text not null,
  requirements text,
  deadline date,
  status text not null default 'published' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists jobs_status_created_idx on jobs (status, created_at desc);
create index if not exists jobs_category_idx on jobs (category);
create index if not exists jobs_company_idx on jobs (company_id);

alter table jobs enable row level security;

create policy "published jobs are viewable by everyone"
  on jobs for select using (
    status = 'published'
    or company_id in (select id from companies where owner_id = auth.uid())
  );

create policy "employers can insert jobs for their own company"
  on jobs for insert with check (
    company_id in (select id from companies where owner_id = auth.uid())
  );

create policy "employers can update their own jobs"
  on jobs for update using (
    company_id in (select id from companies where owner_id = auth.uid())
  );

create policy "employers can delete their own jobs"
  on jobs for delete using (
    company_id in (select id from companies where owner_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- applications
-- ─────────────────────────────────────────────────────────────
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  applicant_id uuid not null references profiles (id) on delete cascade,
  cover_letter text,
  resume_url text,
  status text not null default 'submitted' check (
    status in ('submitted', 'reviewed', 'shortlisted', 'rejected', 'hired')
  ),
  created_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

alter table applications enable row level security;

create policy "applicants can view their own applications"
  on applications for select using (
    auth.uid() = applicant_id
    or job_id in (
      select j.id from jobs j
      join companies c on c.id = j.company_id
      where c.owner_id = auth.uid()
    )
  );

create policy "candidates can apply to jobs"
  on applications for insert with check (auth.uid() = applicant_id);

create policy "employers can update applications on their jobs"
  on applications for update using (
    job_id in (
      select j.id from jobs j
      join companies c on c.id = j.company_id
      where c.owner_id = auth.uid()
    )
  );
