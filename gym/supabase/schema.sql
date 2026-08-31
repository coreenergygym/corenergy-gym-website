-- ============================================================
-- CoreNergy The Gym — Database Schema
-- Run this in Supabase: SQL Editor > New query > paste > Run
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ADMINS
-- Admin identity lives in Supabase Auth (auth.users). This table
-- just marks which auth users are allowed into /admin, and locks
-- the first-time setup flow after the first admin is created.
-- ------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Single-row table that flags whether initial setup has run.
create table if not exists public.app_state (
  id boolean primary key default true check (id),
  setup_complete boolean not null default false
);
insert into public.app_state (id, setup_complete)
  values (true, false)
  on conflict (id) do nothing;

-- ------------------------------------------------------------
-- GYM SETTINGS (single row, editable from Admin > Gym Settings)
-- ------------------------------------------------------------
create table if not exists public.gym_settings (
  id boolean primary key default true check (id),
  gym_name text not null default 'CoreNergy The Gym',
  owner_name text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  instagram_url text default 'https://www.instagram.com/corenergy_thegym/',
  opening_hours text,
  upi_id text,
  payment_qr_url text,
  about_text text,
  logo_url text,
  updated_at timestamptz not null default now()
);
insert into public.gym_settings (id) values (true) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- MEMBERSHIPS
-- ------------------------------------------------------------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_label text not null,
  price numeric(10,2) not null default 0,
  description text,
  features text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SERVICES
-- ------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  features text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SCHEDULE
-- ------------------------------------------------------------
create table if not exists public.schedule_slots (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  day_of_week text not null check (day_of_week in ('MON','TUE','WED','THU','FRI','SAT','SUN')),
  start_time time not null,
  end_time time not null,
  trainer_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_schedule_day on public.schedule_slots(day_of_week);

-- ------------------------------------------------------------
-- GALLERY
-- ------------------------------------------------------------
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- REGISTRATIONS (membership sign-ups)
-- ------------------------------------------------------------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text,
  date_of_birth date,
  membership_id uuid references public.memberships(id) on delete set null,
  membership_name text,
  preferred_start_date date,
  notes text,
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','APPROVED','REJECTED','COMPLETED')),
  admin_notes text
);
create index if not exists idx_registrations_status on public.registrations(status);
create index if not exists idx_registrations_phone on public.registrations(phone);
create index if not exists idx_registrations_created on public.registrations(created_at desc);

-- ------------------------------------------------------------
-- MEMBERS (converted from a registration once approved)
-- ------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  registration_id uuid references public.registrations(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  membership_id uuid references public.memberships(id) on delete set null,
  membership_name text,
  status text not null default 'PENDING' check (status in ('ACTIVE','PENDING','EXPIRED','INACTIVE')),
  start_date date,
  end_date date,
  notes text
);
create index if not exists idx_members_status on public.members(status);
create index if not exists idx_members_phone on public.members(phone);

-- ------------------------------------------------------------
-- APPOINTMENTS (free trial / bookings)
-- ------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text,
  service text not null,
  appointment_date date not null,
  appointment_time time not null,
  message text,
  status text not null default 'PENDING' check (status in ('PENDING','CONFIRMED','COMPLETED','CANCELLED')),
  admin_notes text
);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_appointments_status on public.appointments(status);

-- ------------------------------------------------------------
-- PAYMENTS (manual UPI/QR verification workflow)
-- ------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  registration_id uuid references public.registrations(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  amount numeric(10,2) not null,
  transaction_reference text not null,
  proof_url text,
  status text not null default 'PENDING' check (status in ('PENDING','VERIFIED','REJECTED')),
  admin_notes text,
  verified_at timestamptz
);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_reference on public.payments(transaction_reference);

-- ------------------------------------------------------------
-- RECEIPTS (generated only after a payment is VERIFIED)
-- ------------------------------------------------------------
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  receipt_number text not null unique,
  customer_name text not null,
  membership_or_service text not null,
  amount numeric(10,2) not null,
  payment_date timestamptz not null,
  transaction_reference text not null
);

-- ------------------------------------------------------------
-- ADMIN NOTES / ACTIVITY LOG (generic, optional)
-- ------------------------------------------------------------
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  admin_id uuid references public.admins(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  details text
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public (anonymous) visitors may only: read active content, and
-- INSERT into registrations/appointments/payments (never update
-- their own status). Everything else requires an authenticated
-- admin (a row in public.admins).
-- ============================================================

alter table public.admins enable row level security;
alter table public.app_state enable row level security;
alter table public.gym_settings enable row level security;
alter table public.memberships enable row level security;
alter table public.services enable row level security;
alter table public.schedule_slots enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.registrations enable row level security;
alter table public.members enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;
alter table public.admin_logs enable row level security;

-- Helper: is the current request from a logged-in admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

-- admins: admins can read the admin list; nobody can self-insert
-- except through the locked setup RPC below.
create policy "admins_select_own_table" on public.admins
  for select using (public.is_admin());

-- app_state: anyone can read (frontend needs to know if setup is locked)
create policy "app_state_select_all" on public.app_state
  for select using (true);

-- gym_settings: public read, admin write
create policy "gym_settings_select_all" on public.gym_settings
  for select using (true);
create policy "gym_settings_admin_update" on public.gym_settings
  for update using (public.is_admin());

-- memberships: public reads active ones, admin manages all
create policy "memberships_select_active" on public.memberships
  for select using (is_active = true or public.is_admin());
create policy "memberships_admin_write" on public.memberships
  for insert with check (public.is_admin());
create policy "memberships_admin_update" on public.memberships
  for update using (public.is_admin());
create policy "memberships_admin_delete" on public.memberships
  for delete using (public.is_admin());

-- services: same pattern
create policy "services_select_active" on public.services
  for select using (is_active = true or public.is_admin());
create policy "services_admin_write" on public.services
  for insert with check (public.is_admin());
create policy "services_admin_update" on public.services
  for update using (public.is_admin());
create policy "services_admin_delete" on public.services
  for delete using (public.is_admin());

-- schedule: same pattern
create policy "schedule_select_active" on public.schedule_slots
  for select using (is_active = true or public.is_admin());
create policy "schedule_admin_write" on public.schedule_slots
  for insert with check (public.is_admin());
create policy "schedule_admin_update" on public.schedule_slots
  for update using (public.is_admin());
create policy "schedule_admin_delete" on public.schedule_slots
  for delete using (public.is_admin());

-- gallery: same pattern
create policy "gallery_select_active" on public.gallery_photos
  for select using (is_active = true or public.is_admin());
create policy "gallery_admin_write" on public.gallery_photos
  for insert with check (public.is_admin());
create policy "gallery_admin_update" on public.gallery_photos
  for update using (public.is_admin());
create policy "gallery_admin_delete" on public.gallery_photos
  for delete using (public.is_admin());

-- registrations: public can INSERT only; only admin can read/update/delete
create policy "registrations_public_insert" on public.registrations
  for insert with check (true);
create policy "registrations_admin_select" on public.registrations
  for select using (public.is_admin());
create policy "registrations_admin_update" on public.registrations
  for update using (public.is_admin());
create policy "registrations_admin_delete" on public.registrations
  for delete using (public.is_admin());

-- members: admin only (created by admin from an approved registration)
create policy "members_admin_all_select" on public.members
  for select using (public.is_admin());
create policy "members_admin_insert" on public.members
  for insert with check (public.is_admin());
create policy "members_admin_update" on public.members
  for update using (public.is_admin());
create policy "members_admin_delete" on public.members
  for delete using (public.is_admin());

-- appointments: public can INSERT only; admin manages
create policy "appointments_public_insert" on public.appointments
  for insert with check (true);
create policy "appointments_admin_select" on public.appointments
  for select using (public.is_admin());
create policy "appointments_admin_update" on public.appointments
  for update using (public.is_admin());
create policy "appointments_admin_delete" on public.appointments
  for delete using (public.is_admin());

-- payments: public can INSERT only (submit reference/proof), can never set status;
-- status is not exposed on the public insert form, and update requires admin.
create policy "payments_public_insert" on public.payments
  for insert with check (status = 'PENDING');
create policy "payments_admin_select" on public.payments
  for select using (public.is_admin());
create policy "payments_admin_update" on public.payments
  for update using (public.is_admin());
create policy "payments_admin_delete" on public.payments
  for delete using (public.is_admin());

-- receipts: admin only
create policy "receipts_admin_select" on public.receipts
  for select using (public.is_admin());
create policy "receipts_admin_insert" on public.receipts
  for insert with check (public.is_admin());

-- admin_logs: admin only
create policy "admin_logs_admin_select" on public.admin_logs
  for select using (public.is_admin());
create policy "admin_logs_admin_insert" on public.admin_logs
  for insert with check (public.is_admin());

-- ============================================================
-- FIRST-TIME SETUP LOCK
-- This RPC is the ONLY way a row can be added to public.admins
-- by a normal (non-service-role) client, and it refuses once
-- app_state.setup_complete is true. Call it right after the
-- corresponding Supabase Auth sign-up completes.
-- ============================================================
create or replace function public.complete_initial_setup(admin_full_name text)
returns void
language plpgsql
security definer
as $$
begin
  if (select setup_complete from public.app_state where id = true) then
    raise exception 'Setup has already been completed.';
  end if;

  insert into public.admins (id, full_name, email)
  values (auth.uid(), admin_full_name, (select email from auth.users where id = auth.uid()));

  update public.app_state set setup_complete = true where id = true;
end;
$$;

-- Storage bucket for gallery photos and payment proof uploads.
-- Run once (Supabase also lets you create these from the Storage tab):
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', false) on conflict do nothing;
