-- RecallGuardian push-alerts schema.
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- No user accounts: a "device" is an anonymous APNs token + its preferences.

-- Devices registered to receive push alerts.
create table if not exists devices (
  token       text primary key,                 -- APNs device token (hex)
  platform    text not null default 'ios',
  categories  text[] not null default '{}',     -- group ids: food, medicine, kids, vehicles, household
  threshold   text not null default 'all',       -- 'critical' | 'high' | 'all'
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Recalls we've already processed, so each one is pushed at most once.
create table if not exists seen_recalls (
  nid        text primary key,
  first_seen timestamptz not null default now()
);

-- Small key/value store (e.g. the cached APNs provider JWT).
create table if not exists kv (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Help the fan-out query find devices subscribed to a given category fast.
create index if not exists devices_categories_idx on devices using gin (categories);

-- RLS: these tables are only ever touched by the backend using the
-- service-role key (which bypasses RLS). Enable RLS with no public policies
-- so the anon/public key can't read or write them.
alter table devices       enable row level security;
alter table seen_recalls  enable row level security;
alter table kv            enable row level security;
