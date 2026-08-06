-- Run this only if you already ran the original schema.sql before this
-- migration existed. Safe to re-run.
alter table applications add column if not exists updated_at timestamptz not null default now();

alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check check (
  status in ('submitted', 'reviewed', 'shortlisted', 'interviewing', 'rejected', 'hired')
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on applications;
create trigger applications_set_updated_at
  before update on applications
  for each row execute procedure set_updated_at();
