-- CoralStone Properties — database schema
-- ---------------------------------------------------------------------------
-- HOW TO RUN: open your Supabase project → SQL Editor → New query →
-- paste this whole file → Run. Safe to re-run (uses IF NOT EXISTS).
-- ---------------------------------------------------------------------------

-- Leads: contact, property-listing, fraud-report and valuation submissions.
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('contact', 'listing', 'report', 'valuation')),
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  name        text,
  email       text,
  phone       text,
  subject     text,
  message     text,
  details     jsonb,            -- full listing fields (type, price, location…)
  source      text default 'website'
);

-- Migration for tables created before 'report'/'valuation' kinds existed.
-- Safe to re-run: drops the old kind constraint and re-adds the widened one.
-- (Postgres names inline single-column checks '<table>_<column>_check'.)
alter table public.leads drop constraint if exists leads_kind_check;
alter table public.leads
  add constraint leads_kind_check
  check (kind in ('contact', 'listing', 'report', 'valuation'));

-- Newest leads first when browsing the table.
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Row Level Security: lock the table down completely.
-- The app writes with the service-role key, which BYPASSES RLS, so no policy
-- is needed for inserts. With RLS on and no policies, the public anon key can
-- neither read nor write this table — exactly what we want for private leads.
alter table public.leads enable row level security;


-- ===========================================================================
-- SHARED HELPERS
-- ===========================================================================

-- Keep an updated_at column fresh on every UPDATE.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- True when the current auth user has the 'admin' role. SECURITY DEFINER so it
-- can read profiles regardless of the caller's own RLS. Used in write policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;


-- ===========================================================================
-- AGENTS  (vetted listing agents / agencies / developers)
-- ===========================================================================
create table if not exists public.agents (
  id              text primary key default gen_random_uuid()::text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  name            text not null,
  agency          text not null default '',
  avatar_url      text,
  verified        jsonb not null default '[]'::jsonb,   -- VerificationKind[]
  response_mins   integer not null default 0,
  completed_deals integer not null default 0,
  phone           text,
  whatsapp        text
);

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at before update on public.agents
  for each row execute function public.set_updated_at();

alter table public.agents enable row level security;

-- Agents attached to active listings must be publicly readable.
drop policy if exists "agents public read" on public.agents;
create policy "agents public read" on public.agents
  for select using (true);

-- Only admins (or the service role, which bypasses RLS) may write agents.
drop policy if exists "agents admin write" on public.agents;
create policy "agents admin write" on public.agents
  for all using (public.is_admin()) with check (public.is_admin());


-- ===========================================================================
-- PROPERTIES  (the public inventory — mirrors the Property type in src/lib/types.ts)
-- ===========================================================================
create table if not exists public.properties (
  id               text primary key default gen_random_uuid()::text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  slug             text not null unique,
  title            text not null,
  type             text not null check (type in ('apartment','house','townhouse','land','commercial','off_plan','venue')),
  intent           text not null check (intent in ('sale','rent','short_let')),
  status           text not null default 'draft' check (status in ('draft','pending_review','active','under_offer','reserved','sold','let','withdrawn')),

  price            numeric not null,
  currency         text not null check (currency in ('KES','UGX','TZS','RWF','USD','GBP')),
  price_period     text not null default 'total' check (price_period in ('total','month','night','day')),
  previous_price   numeric,

  beds             integer,
  baths            integer,
  capacity         integer,
  size             numeric,
  size_unit        text check (size_unit in ('sqm','sqft','acres')),
  plot_size        numeric,
  plot_size_unit   text check (plot_size_unit in ('acres','sqm')),
  furnishing       text check (furnishing in ('furnished','semi_furnished','unfurnished')),
  year_built       integer,

  country          text not null check (country in ('Kenya','Uganda','Tanzania','Rwanda')),
  county           text not null,
  area             text not null,
  estate           text,
  lat              double precision not null default 0,
  lng              double precision not null default 0,

  service_charge   numeric,
  title_type       text check (title_type in ('freehold','leasehold','sectional','controlled')),

  amenities        jsonb not null default '[]'::jsonb,
  lifestyle        jsonb not null default '[]'::jsonb,
  images           jsonb not null default '[]'::jsonb,
  has_video        boolean not null default false,
  has_3d_tour      boolean not null default false,
  has_drone        boolean not null default false,

  verified         jsonb not null default '[]'::jsonb,   -- VerifiedBadgeInfo[]
  boost_tier       text check (boost_tier in ('featured','spotlight')),

  description      text not null default '',
  ai_assisted_description boolean not null default false,

  agent_id         text references public.agents (id) on delete set null,
  area_guide       jsonb,                                 -- embedded AreaGuide

  listed_on        date not null default current_date,
  view_count       integer not null default 0,
  save_count       integer not null default 0,

  completion_percent integer,
  handover_date      date
);

create index if not exists properties_status_idx    on public.properties (status);
create index if not exists properties_country_idx   on public.properties (country);
create index if not exists properties_listed_on_idx on public.properties (listed_on desc);

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

alter table public.properties enable row level security;

-- The public may read ONLY active listings. Drafts / pending / sold stay hidden
-- from the anon key; the admin console reads all statuses via the service role.
drop policy if exists "properties public read active" on public.properties;
create policy "properties public read active" on public.properties
  for select using (status = 'active');

-- Admins (or the service role) may write. Guests and normal users cannot.
drop policy if exists "properties admin write" on public.properties;
create policy "properties admin write" on public.properties
  for all using (public.is_admin()) with check (public.is_admin());


-- ===========================================================================
-- PROFILES  (one row per auth user; carries the role for authorization)
-- ===========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  full_name   text,
  phone       text,
  role        text not null default 'user' check (role in ('user','agent','admin'))
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- A user can read and update their own profile; admins can read every profile.
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Note: role can only be elevated by the service role (never self-service).

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ===========================================================================
-- SAVED PROPERTIES  (per-user favourites — syncs the localStorage list)
-- ===========================================================================
create table if not exists public.saved_properties (
  user_id     uuid not null references auth.users (id) on delete cascade,
  property_id text not null references public.properties (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, property_id)
);

alter table public.saved_properties enable row level security;

drop policy if exists "saved manage own" on public.saved_properties;
create policy "saved manage own" on public.saved_properties
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ===========================================================================
-- BOOKINGS  (short-let / venue reservations)
-- ===========================================================================
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  user_id       uuid references auth.users (id) on delete set null,
  property_id   text not null references public.properties (id) on delete cascade,
  guest_name    text,
  guest_email   text,
  check_in      date not null,
  check_out     date not null,
  guests        integer not null default 1,
  unit          text not null default 'night' check (unit in ('night','day')),
  status        text not null default 'pending' check (status in ('pending','confirmed','cancelled','paid')),
  currency      text,
  totals        jsonb,   -- computed fee breakdown (guest total, platform take, owner payout)
  fees          jsonb    -- fee model snapshot at booking time
);

create index if not exists bookings_property_idx on public.bookings (property_id);
create index if not exists bookings_user_idx     on public.bookings (user_id);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;

-- Guests manage their own bookings; admins see all. Owners/hosts get access in a
-- later iteration (needs a property->owner link).
drop policy if exists "bookings manage own" on public.bookings;
create policy "bookings manage own" on public.bookings
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
