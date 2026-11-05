-- Cyond Operations Portal — MVP schema (Lead CRM + 30-day nurture)
-- Roles: admin, management, sales, engineer

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'management', 'sales', 'engineer');

create type public.pipeline_status as enum (
  'new',
  'contacted',
  'qualified',
  'nurturing',
  'proposal',
  'won',
  'lost'
);

create type public.task_status as enum ('pending', 'sent', 'skipped', 'overdue');

create type public.enrollment_status as enum ('active', 'paused', 'completed', 'cancelled');

create type public.comm_channel as enum ('whatsapp', 'call', 'email', 'note', 'system');

create type public.comm_direction as enum ('outbound', 'inbound', 'internal');

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'sales',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Lead sources
-- ---------------------------------------------------------------------------
create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Prospects / leads
-- ---------------------------------------------------------------------------
create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  company text,
  city text,
  source_id uuid references public.lead_sources (id) on delete set null,
  status public.pipeline_status not null default 'new',
  owner_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospects_status_idx on public.prospects (status);
create index prospects_owner_idx on public.prospects (owner_id);
create index prospects_source_idx on public.prospects (source_id);

-- ---------------------------------------------------------------------------
-- Call logs
-- ---------------------------------------------------------------------------
create table public.call_logs (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  outcome text not null,
  notes text,
  called_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index call_logs_prospect_idx on public.call_logs (prospect_id);

-- ---------------------------------------------------------------------------
-- Message templates
-- ---------------------------------------------------------------------------
create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  body text not null,
  channel public.comm_channel not null default 'whatsapp',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Nurture sequences + steps
-- ---------------------------------------------------------------------------
create table public.nurture_sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nurture_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.nurture_sequences (id) on delete cascade,
  day_offset integer not null check (day_offset >= 0),
  template_id uuid not null references public.message_templates (id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (sequence_id, day_offset)
);

create index nurture_steps_sequence_idx on public.nurture_steps (sequence_id);

-- ---------------------------------------------------------------------------
-- Enrollments
-- ---------------------------------------------------------------------------
create table public.nurture_enrollments (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  sequence_id uuid not null references public.nurture_sequences (id) on delete restrict,
  status public.enrollment_status not null default 'active',
  current_step integer not null default 0,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (prospect_id, sequence_id)
);

create index nurture_enrollments_prospect_idx on public.nurture_enrollments (prospect_id);

-- ---------------------------------------------------------------------------
-- Daily tasks
-- ---------------------------------------------------------------------------
create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.nurture_enrollments (id) on delete cascade,
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  step_id uuid not null references public.nurture_steps (id) on delete restrict,
  due_date date not null,
  status public.task_status not null default 'pending',
  message_body text not null,
  sent_at timestamptz,
  sent_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (enrollment_id, step_id)
);

create index daily_tasks_due_date_idx on public.daily_tasks (due_date, status);
create index daily_tasks_prospect_idx on public.daily_tasks (prospect_id);

-- ---------------------------------------------------------------------------
-- Communication log
-- ---------------------------------------------------------------------------
create table public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  channel public.comm_channel not null default 'whatsapp',
  direction public.comm_direction not null default 'outbound',
  body text not null,
  status text not null default 'logged',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index communication_logs_prospect_idx on public.communication_logs (prospect_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Activity / audit log
-- ---------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);
create index activity_logs_created_idx on public.activity_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger prospects_set_updated_at
  before update on public.prospects
  for each row execute function public.set_updated_at();

create trigger message_templates_set_updated_at
  before update on public.message_templates
  for each row execute function public.set_updated_at();

create trigger nurture_sequences_set_updated_at
  before update on public.nurture_sequences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth helper: create profile on signup (role defaults to sales)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'sales')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role helpers for RLS
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active
      and role in ('admin', 'management', 'sales', 'engineer')
  );
$$;

create or replace function public.can_manage_crm()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active
      and role in ('admin', 'management', 'sales')
  );
$$;
