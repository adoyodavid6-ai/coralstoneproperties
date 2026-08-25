-- CoralStone Properties — database schema
-- ---------------------------------------------------------------------------
-- HOW TO RUN: open your Supabase project → SQL Editor → New query →
-- paste this whole file → Run. Safe to re-run (uses IF NOT EXISTS).
-- ---------------------------------------------------------------------------

-- Leads: contact enquiries and property-listing submissions from the site.
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('contact', 'listing')),
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  name        text,
  email       text,
  phone       text,
  subject     text,
  message     text,
  details     jsonb,            -- full listing fields (type, price, location…)
  source      text default 'website'
);

-- Newest leads first when browsing the table.
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Row Level Security: lock the table down completely.
-- The app writes with the service-role key, which BYPASSES RLS, so no policy
-- is needed for inserts. With RLS on and no policies, the public anon key can
-- neither read nor write this table — exactly what we want for private leads.
alter table public.leads enable row level security;
