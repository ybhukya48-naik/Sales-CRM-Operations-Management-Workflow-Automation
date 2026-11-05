-- Row Level Security for Cyond MVP

alter table public.profiles enable row level security;
alter table public.lead_sources enable row level security;
alter table public.prospects enable row level security;
alter table public.call_logs enable row level security;
alter table public.message_templates enable row level security;
alter table public.nurture_sequences enable row level security;
alter table public.nurture_steps enable row level security;
alter table public.nurture_enrollments enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.communication_logs enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles
create policy "Staff can read active profiles"
  on public.profiles for select
  using (public.is_staff());

create policy "Users can update own profile name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Lead sources
create policy "Staff can read lead sources"
  on public.lead_sources for select
  using (public.is_staff());

create policy "Admin/management can manage lead sources"
  on public.lead_sources for all
  using (public.current_role() in ('admin', 'management'))
  with check (public.current_role() in ('admin', 'management'));

-- Prospects
create policy "CRM roles can read prospects"
  on public.prospects for select
  using (public.can_manage_crm() or public.current_role() = 'engineer');

create policy "Sales/admin can insert prospects"
  on public.prospects for insert
  with check (public.current_role() in ('admin', 'sales'));

create policy "Sales/admin/management can update prospects"
  on public.prospects for update
  using (public.can_manage_crm())
  with check (public.can_manage_crm());

create policy "Admins can delete prospects"
  on public.prospects for delete
  using (public.is_admin());

-- Call logs
create policy "CRM can read call logs"
  on public.call_logs for select
  using (public.can_manage_crm());

create policy "Sales/admin can write call logs"
  on public.call_logs for insert
  with check (public.current_role() in ('admin', 'sales'));

-- Templates
create policy "Staff can read templates"
  on public.message_templates for select
  using (public.is_staff());

create policy "Admin/sales can manage templates"
  on public.message_templates for all
  using (public.current_role() in ('admin', 'sales'))
  with check (public.current_role() in ('admin', 'sales'));

-- Sequences
create policy "Staff can read sequences"
  on public.nurture_sequences for select
  using (public.is_staff());

create policy "Admin/sales can manage sequences"
  on public.nurture_sequences for all
  using (public.current_role() in ('admin', 'sales'))
  with check (public.current_role() in ('admin', 'sales'));

create policy "Staff can read nurture steps"
  on public.nurture_steps for select
  using (public.is_staff());

create policy "Admin/sales can manage nurture steps"
  on public.nurture_steps for all
  using (public.current_role() in ('admin', 'sales'))
  with check (public.current_role() in ('admin', 'sales'));

-- Enrollments
create policy "CRM can read enrollments"
  on public.nurture_enrollments for select
  using (public.can_manage_crm());

create policy "Sales/admin can manage enrollments"
  on public.nurture_enrollments for all
  using (public.current_role() in ('admin', 'sales'))
  with check (public.current_role() in ('admin', 'sales'));

-- Daily tasks
create policy "CRM can read daily tasks"
  on public.daily_tasks for select
  using (public.can_manage_crm());

create policy "Sales/admin can update daily tasks"
  on public.daily_tasks for update
  using (public.current_role() in ('admin', 'sales'))
  with check (public.current_role() in ('admin', 'sales'));

create policy "Sales/admin can insert daily tasks"
  on public.daily_tasks for insert
  with check (public.current_role() in ('admin', 'sales'));

-- Communication logs
create policy "CRM can read communication logs"
  on public.communication_logs for select
  using (public.can_manage_crm());

create policy "Sales/admin can insert communication logs"
  on public.communication_logs for insert
  with check (public.current_role() in ('admin', 'sales'));

-- Activity logs
create policy "Staff can read activity logs"
  on public.activity_logs for select
  using (public.is_staff());

create policy "Authenticated staff can insert activity"
  on public.activity_logs for insert
  with check (public.is_staff());
