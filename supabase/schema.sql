-- CoralStone Properties — database schema
-- ---------------------------------------------------------------------------
-- HOW TO RUN: open your Supabase project → SQL Editor → New query →
-- paste this whole file → Run. Safe to re-run (uses IF NOT EXISTS).
-- ---------------------------------------------------------------------------


-- ===========================================================================
-- LEADS  (contact / listing / fraud-report / valuation submissions)
-- ===========================================================================
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
  details     jsonb,
  source      text default 'website'
);

-- Widen constraint in case of earlier schema run without 'report'/'valuation'.
alter table public.leads drop constraint if exists leads_kind_check;
alter table public.leads
  add constraint leads_kind_check
  check (kind in ('contact', 'listing', 'report', 'valuation'));

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Service-role key bypasses RLS for inserts; anon key gets no access at all.
alter table public.leads enable row level security;


-- ===========================================================================
-- SHARED HELPER — updated_at trigger function
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ===========================================================================
-- PROFILES  (table + trigger only — RLS policies added AFTER is_admin())
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

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ===========================================================================
-- is_admin()  — defined AFTER profiles table exists so the SQL function body
-- can resolve public.profiles at CREATE time (language sql validates eagerly).
-- ===========================================================================
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
-- PROFILES — RLS policies (added AFTER is_admin() is defined)
-- ===========================================================================
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Note: role can only be elevated via the service role — never self-service.


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
  verified        jsonb not null default '[]'::jsonb,
  response_mins   integer not null default 0,
  completed_deals integer not null default 0,
  phone           text,
  whatsapp        text
);

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at before update on public.agents
  for each row execute function public.set_updated_at();

alter table public.agents enable row level security;

drop policy if exists "agents public read" on public.agents;
create policy "agents public read" on public.agents
  for select using (true);

drop policy if exists "agents admin write" on public.agents;
create policy "agents admin write" on public.agents
  for all using (public.is_admin()) with check (public.is_admin());


-- ===========================================================================
-- PROPERTIES  (mirrors Property type in src/lib/types.ts)
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

  verified         jsonb not null default '[]'::jsonb,
  boost_tier       text check (boost_tier in ('featured','spotlight')),

  description      text not null default '',
  ai_assisted_description boolean not null default false,

  agent_id         text references public.agents (id) on delete set null,
  area_guide       jsonb,

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

-- Anon key sees only active listings. Service role bypasses RLS.
drop policy if exists "properties public read active" on public.properties;
create policy "properties public read active" on public.properties
  for select using (status = 'active');

drop policy if exists "properties admin write" on public.properties;
create policy "properties admin write" on public.properties
  for all using (public.is_admin()) with check (public.is_admin());


-- ===========================================================================
-- SAVED PROPERTIES  (per-user favourites)
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
  totals        jsonb,
  fees          jsonb
);

create index if not exists bookings_property_idx on public.bookings (property_id);
create index if not exists bookings_user_idx     on public.bookings (user_id);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;

drop policy if exists "bookings manage own" on public.bookings;
create policy "bookings manage own" on public.bookings
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());


-- ===========================================================================
-- SUBSCRIBERS  (newsletter / marketing funnel — double opt-in)
-- ===========================================================================
create table if not exists public.subscribers (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  email            text not null unique,
  name             text,
  status           text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  source           text default 'footer',
  -- Opaque token used for BOTH the confirm link and the unsubscribe link.
  token            text not null default gen_random_uuid()::text,
  confirmed_at     timestamptz,
  unsubscribed_at  timestamptz
);

create index if not exists subscribers_status_idx on public.subscribers (status);
create index if not exists subscribers_token_idx  on public.subscribers (token);

drop trigger if exists subscribers_set_updated_at on public.subscribers;
create trigger subscribers_set_updated_at before update on public.subscribers
  for each row execute function public.set_updated_at();

-- Fully locked down: the anon key gets NO access. Every read/write goes through
-- the service role (public subscribe action, confirm/unsubscribe links, admin).
alter table public.subscribers enable row level security;


-- ===========================================================================
-- CAMPAIGNS  (broadcast email history — "view emails" in the admin console)
-- ===========================================================================
create table if not exists public.campaigns (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  subject          text not null,
  body_html        text not null,
  status           text not null default 'sent' check (status in ('draft','sending','sent','failed')),
  sent_at          timestamptz,
  recipient_count  integer not null default 0
);

create index if not exists campaigns_created_at_idx on public.campaigns (created_at desc);

-- Service role only (admin console). No anon access.
alter table public.campaigns enable row level security;
