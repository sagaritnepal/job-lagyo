-- Run this only if you already ran the original schema.sql before this
-- migration existed. Safe to re-run (IF NOT EXISTS guards).
alter table jobs add column if not exists tags text[] not null default '{}';
alter table jobs add column if not exists featured boolean not null default false;
