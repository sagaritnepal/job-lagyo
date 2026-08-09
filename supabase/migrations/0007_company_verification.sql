-- Adds mandatory VAT/PAN registration + document verification for
-- employers. A company must reach verification_status = 'verified' before
-- it is allowed to post jobs (enforced both in the app layer and, as
-- defense-in-depth, in the RLS policy on jobs below).
-- Run this once in the Supabase SQL editor after migrations 0002-0006 have
-- been applied. Safe to re-run.

-- ─────────────────────────────────────────────────────────────
-- companies: VAT/PAN + verification status
-- ─────────────────────────────────────────────────────────────
alter table companies add column if not exists vat_number text;
alter table companies add column if not exists pan_number text;
alter table companies add column if not exists verification_status text
  not null default 'unverified';
alter table companies drop constraint if exists companies_verification_status_check;
alter table companies add constraint companies_verification_status_check
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected'));
alter table companies add column if not exists verification_submitted_at timestamptz;
alter table companies add column if not exists verified_at timestamptz;
alter table companies add column if not exists verified_by uuid references profiles (id);
alter table companies add column if not exists verification_rejection_reason text;

create index if not exists companies_verification_status_idx
  on companies (verification_status);

-- ─────────────────────────────────────────────────────────────
-- company_verification_documents: uploaded VAT/PAN/registration proof
-- ─────────────────────────────────────────────────────────────
create table if not exists company_verification_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  document_type text not null check (
    document_type in ('vat_certificate', 'pan_certificate', 'registration_certificate', 'other')
  ),
  file_path text not null, -- path in the company-documents bucket
  uploaded_at timestamptz not null default now()
);

create index if not exists company_verification_documents_company_idx
  on company_verification_documents (company_id);

alter table company_verification_documents enable row level security;

drop policy if exists "owners manage their own verification documents" on company_verification_documents;
create policy "owners manage their own verification documents"
  on company_verification_documents for all
  using (company_id in (select id from companies where owner_id = auth.uid()))
  with check (company_id in (select id from companies where owner_id = auth.uid()));

drop policy if exists "admins can view all verification documents" on company_verification_documents;
create policy "admins can view all verification documents"
  on company_verification_documents for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- company-documents: private storage bucket for VAT/PAN uploads
-- Path convention: {company_id}/{document_type}-{timestamp}.{ext}
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-documents',
  'company-documents',
  false,
  5242880, -- 5MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owners can upload their own company documents" on storage.objects;
create policy "owners can upload their own company documents"
  on storage.objects for insert with check (
    bucket_id = 'company-documents'
    and exists (
      select 1 from companies
      where id::text = (storage.foldername(name))[1] and owner_id = auth.uid()
    )
  );

drop policy if exists "owners can replace their own company documents" on storage.objects;
create policy "owners can replace their own company documents"
  on storage.objects for update using (
    bucket_id = 'company-documents'
    and exists (
      select 1 from companies
      where id::text = (storage.foldername(name))[1] and owner_id = auth.uid()
    )
  );

drop policy if exists "owners can delete their own company documents" on storage.objects;
create policy "owners can delete their own company documents"
  on storage.objects for delete using (
    bucket_id = 'company-documents'
    and exists (
      select 1 from companies
      where id::text = (storage.foldername(name))[1] and owner_id = auth.uid()
    )
  );

drop policy if exists "company documents are readable by owner or admin" on storage.objects;
create policy "company documents are readable by owner or admin"
  on storage.objects for select using (
    bucket_id = 'company-documents'
    and (
      exists (
        select 1 from companies
        where id::text = (storage.foldername(name))[1] and owner_id = auth.uid()
      )
      or exists (
        select 1 from profiles where id = auth.uid() and role = 'admin'
      )
    )
  );

-- ─────────────────────────────────────────────────────────────
-- RLS defense-in-depth: only verified, non-blacklisted companies may post
-- jobs, even if a server action ever fails to check this itself.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "employers can insert jobs for their own company" on jobs;
create policy "employers can insert jobs for their own company"
  on jobs for insert with check (
    company_id in (
      select id from companies
      where owner_id = auth.uid()
        and is_blacklisted = false
        and verification_status = 'verified'
    )
  );
