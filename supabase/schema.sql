-- CoralStones Properties — database schema
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
  role        text not null default 'user' check (role in ('user','agent','admin','owner'))
);

-- Migrate databases whose role check predates 'owner' (hosts). Owners, like
-- agents, are only ever elevated via the service role — never self-service.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user','agent','admin','owner'));

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

-- Owner link for mediated (short-let / venue) listings: the auth user who
-- hosts this property and receives payouts. Nullable — unlinked / sales-side
-- listings leave it null; `agent_id` still drives the public agent card.
alter table public.properties
  add column if not exists owner_id uuid references auth.users (id) on delete set null;
create index if not exists properties_owner_idx on public.properties (owner_id);


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
  status        text not null default 'pending' check (status in ('pending','confirmed','cancelled','paid','release_pending','payout_completed','payout_failed','refund_pending','refunded')),
  currency      text,
  totals        jsonb,
  fees          jsonb
);

-- Escrow lifecycle (mediated short-let/venue): widen the status set on existing
-- databases, and add the hold/release bookkeeping columns.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check check (status in
    ('pending','confirmed','cancelled','paid','release_pending','payout_completed','payout_failed','refund_pending','refunded'));
alter table public.bookings
  add column if not exists owner_id       uuid references auth.users (id) on delete set null,
  add column if not exists escrow_held_at timestamptz,
  add column if not exists release_due_at date;

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

create index if not exists bookings_owner_idx on public.bookings (owner_id);


-- ===========================================================================
-- PAYOUTS  (escrow release ledger — one row per owner disbursement)
-- ===========================================================================
-- Created when an admin/cron releases a held booking. `idempotency_key` (unique)
-- is `<booking_id>:v1`, so a double-release is impossible. Owners read their own
-- rows; writes go through the service role (payout orchestration).
create table if not exists public.payouts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  booking_id        uuid not null references public.bookings (id) on delete cascade,
  owner_id          uuid references auth.users (id) on delete set null,
  payout_account_id uuid references public.payout_accounts (id) on delete set null,
  amount            numeric not null,
  currency          text not null,
  method            text not null check (method in ('mpesa_b2c','flw_transfer','demo')),
  recipient_ref     text,                 -- masked (last-4 / label)
  status            text not null default 'pending'
                    check (status in ('pending','processing','completed','failed','reversed')),
  provider_ref      text,                 -- B2C ConversationID / FLW transfer id
  result_code       text,
  result_desc       text,
  receipt           text,
  idempotency_key   text unique,
  requested_by      text,
  completed_at      timestamptz
);

create index if not exists payouts_booking_idx on public.payouts (booking_id);
create index if not exists payouts_owner_idx   on public.payouts (owner_id);

drop trigger if exists payouts_set_updated_at on public.payouts;
create trigger payouts_set_updated_at before update on public.payouts
  for each row execute function public.set_updated_at();

alter table public.payouts enable row level security;

drop policy if exists "payouts read own" on public.payouts;
create policy "payouts read own" on public.payouts
  for select using (auth.uid() = owner_id or public.is_admin());


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


-- ===========================================================================
-- PROPERTY ALERTS  (saved searches → email me when a matching listing appears)
-- ===========================================================================
create table if not exists public.property_alerts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  email             text not null,
  name              text,
  -- Search criteria (a serialised subset of SearchFilters).
  q                 text,
  intent            text,              -- sale | rent | short_let | all
  type              text,              -- apartment | house | land | ... | all
  country           text,
  county            text,
  area              text,
  min_price         numeric,
  max_price         numeric,
  price_currency    text default 'KES',
  beds              integer,
  label             text,              -- human-readable description of the search
  status            text not null default 'active' check (status in ('active','unsubscribed')),
  token             text not null default gen_random_uuid()::text,
  -- Listing ids we've already alerted this subscriber about (dedupe future runs).
  notified_ids      jsonb not null default '[]'::jsonb,
  last_notified_at  timestamptz
);

create index if not exists property_alerts_status_idx on public.property_alerts (status);
create index if not exists property_alerts_token_idx  on public.property_alerts (token);

-- Service role only (public create action, unsubscribe link, cron dispatch). No anon access.
alter table public.property_alerts enable row level security;


-- ===========================================================================
-- BUYER DOCUMENTS  (purchase paperwork a signed-in buyer uploads per property)
-- ===========================================================================
-- Files live in the PRIVATE `buyer-documents` storage bucket (created below);
-- this table holds the metadata + review status. Writes go through server
-- actions using the service role; RLS below also lets a buyer read/manage their
-- own rows directly and admins see everything.
create table if not exists public.buyer_documents (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  user_email     text,
  -- property_id is NOT a FK: listings may come from the demo seed (not in the
  -- properties table), so we snapshot the title/slug for display instead.
  property_id    text not null,
  property_slug  text,
  property_title text,
  doc_key        text not null,
  doc_label      text,
  file_name      text not null,
  storage_path   text not null,
  size_bytes     integer not null default 0,
  mime           text,
  status         text not null default 'submitted' check (status in ('submitted','approved','rejected')),
  review_note    text,
  reviewed_at    timestamptz
);

create index if not exists buyer_documents_user_idx     on public.buyer_documents (user_id);
create index if not exists buyer_documents_property_idx on public.buyer_documents (property_id);
create index if not exists buyer_documents_status_idx   on public.buyer_documents (status);

alter table public.buyer_documents enable row level security;

drop policy if exists "buyer_documents manage own" on public.buyer_documents;
create policy "buyer_documents manage own" on public.buyer_documents
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());


-- ===========================================================================
-- STORAGE  — private bucket for buyer documents
-- ===========================================================================
-- Create the bucket (idempotent). The upload server action also creates it
-- lazily, but declaring it here keeps a fresh project self-describing.
insert into storage.buckets (id, name, public)
  values ('buyer-documents', 'buyer-documents', false)
  on conflict (id) do nothing;

-- Object paths are `{user_id}/{property_id}/{doc_key}/{file}`. A buyer may only
-- touch files under their own id prefix; admins see all. (Server actions use the
-- service role and bypass these — they're defence-in-depth for the anon key.)
drop policy if exists "buyer docs read own" on storage.objects;
create policy "buyer docs read own" on storage.objects
  for select using (
    bucket_id = 'buyer-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "buyer docs write own" on storage.objects;
create policy "buyer docs write own" on storage.objects
  for insert with check (
    bucket_id = 'buyer-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "buyer docs delete own" on storage.objects;
create policy "buyer docs delete own" on storage.objects
  for delete using (
    bucket_id = 'buyer-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );


-- ===========================================================================
-- MESSAGING  (on-platform, PII-masked threads — keeps buyer↔owner talk on-site)
-- ===========================================================================
-- One thread per (property, buyer). `owner_id` is nullable: until a property is
-- linked to an owner account (Stage B) the CoralStones team relays. Message
-- bodies are PII-scrubbed in the server action before insert so neither side
-- can leak a phone/email back-channel. property_id is NOT a FK (listings may be
-- demo-seed rows not present in `properties`) — we snapshot slug/title, like
-- buyer_documents. Writes go through the service role; RLS is defence-in-depth.
create table if not exists public.message_threads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  property_id     text not null,
  property_slug   text,
  property_title  text,
  buyer_id        uuid not null references auth.users (id) on delete cascade,
  owner_id        uuid references auth.users (id) on delete set null,
  subject         text,
  last_message_at timestamptz not null default now(),
  buyer_unread    integer not null default 0,
  owner_unread    integer not null default 0,
  status          text not null default 'open' check (status in ('open','closed')),
  unique (property_id, buyer_id)
);

create index if not exists message_threads_buyer_idx on public.message_threads (buyer_id, last_message_at desc);
create index if not exists message_threads_owner_idx on public.message_threads (owner_id, last_message_at desc);

drop trigger if exists message_threads_set_updated_at on public.message_threads;
create trigger message_threads_set_updated_at before update on public.message_threads
  for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  thread_id   uuid not null references public.message_threads (id) on delete cascade,
  sender_id   uuid references auth.users (id) on delete set null,  -- null = system/admin relay
  sender_role text not null check (sender_role in ('buyer','owner','system','admin')),
  body        text not null,
  read_at     timestamptz
);

create index if not exists messages_thread_idx on public.messages (thread_id, created_at);

alter table public.message_threads enable row level security;
alter table public.messages enable row level security;

drop policy if exists "threads read participants" on public.message_threads;
create policy "threads read participants" on public.message_threads
  for select using (auth.uid() = buyer_id or auth.uid() = owner_id or public.is_admin());

drop policy if exists "messages read participants" on public.messages;
create policy "messages read participants" on public.messages
  for select using (exists (
    select 1 from public.message_threads t
    where t.id = thread_id
      and (auth.uid() = t.buyer_id or auth.uid() = t.owner_id or public.is_admin())));


-- ===========================================================================
-- PAYOUT ACCOUNTS  (owner/host payout destinations — M-Pesa or bank)
-- ===========================================================================
-- `secret_enc` holds the raw payout details (phone / account number) encrypted
-- by the app (AES-256-GCM, key in PAYOUT_ENC_KEY) — it is NEVER selected into a
-- client bundle, email, or RLS read. Only `display_label` (last-4) is shown.
-- The table is fully locked (RLS on, NO anon policy): every read/write goes
-- through the service role in src/lib/host/payoutAccounts.ts (same posture as
-- subscribers). Decryption happens only at payout time, server-side.
create table if not exists public.payout_accounts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  method        text not null check (method in ('mpesa','bank')),
  display_label text not null,
  secret_enc    text,
  is_default    boolean not null default false,
  verified      boolean not null default false,
  status        text not null default 'active' check (status in ('active','disabled'))
);

create index if not exists payout_accounts_owner_idx on public.payout_accounts (owner_id);

drop trigger if exists payout_accounts_set_updated_at on public.payout_accounts;
create trigger payout_accounts_set_updated_at before update on public.payout_accounts
  for each row execute function public.set_updated_at();

-- Locked down: no anon/user access at all (secret_enc must never be reachable
-- via the anon key). Host reads go through the service role and return only
-- masked columns.
alter table public.payout_accounts enable row level security;
