-- Adds 3 fixed, mandatory document slots per candidate — education proof,
-- work proof, and national ID — replacing the old freeform
-- candidate_certificates flow (left in place, unused, so no data is lost).
-- Run this once in the Supabase SQL editor after migration 0007 has been
-- applied. Safe to re-run.

create table if not exists candidate_documents (
  candidate_id uuid not null references profiles (id) on delete cascade,
  doc_type text not null check (doc_type in ('education', 'work', 'national_id')),
  document_path text not null, -- path in the candidate-documents bucket
  uploaded_at timestamptz not null default now(),
  primary key (candidate_id, doc_type)
);

alter table candidate_documents enable row level security;

drop policy if exists "candidates manage their own documents" on candidate_documents;
create policy "candidates manage their own documents"
  on candidate_documents for all
  using (auth.uid() = candidate_id)
  with check (auth.uid() = candidate_id);

drop policy if exists "admins can view all candidate documents" on candidate_documents;
create policy "admins can view all candidate documents"
  on candidate_documents for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Storage bucket + object policies for candidate-documents already cover
-- any path under {candidate_id}/... (see migration 0006), so the
-- {candidate_id}/{doc_type}-{timestamp}.{ext} convention used here needs
-- no additional storage policy changes.
