-- Blueprint email automation: send_log table (spec 7.1).
-- One row per ClickUp "Ready to Send" status change. Only the service role touches it.

create table public.send_log (
  id uuid primary key default gen_random_uuid(),
  clickup_task_id text not null,
  status_change_id text not null,
  status text not null check (status in (
    'pending','processing','retry_scheduled','awaiting_approval',
    'approved','rejected','expired','sent',
    'failed_permanent','failed_exhausted'
  )),
  stage text not null default 'prepare' check (stage in ('prepare','send')),
  attempt_count int not null default 0 check (attempt_count between 0 and 3),
  next_retry_at timestamptz,
  previous_clickup_status text,
  company_name text,
  client_email text,
  drive_file_id text,
  drive_filename text,
  approved_md5 text,
  drive_modified_time text,
  slack_channel_id text,
  slack_message_ts text,
  approval_expires_at timestamptz,
  approved_by text,
  approved_at timestamptz,
  last_error_code text,
  last_error_message text,
  failed_step text,
  resend_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clickup_task_id, status_change_id)
);

create index send_log_due_idx
  on public.send_log (next_retry_at) where status = 'retry_scheduled';
create index send_log_task_idx on public.send_log (clickup_task_id);
create index send_log_approval_idx
  on public.send_log (approval_expires_at) where status = 'awaiting_approval';

alter table public.send_log enable row level security;
-- No policies. Only the service role touches this table.

-- Table-specific name so this cannot replace a shared public.set_updated_at()
-- that may already exist in the production database.
create or replace function public.send_log_set_updated_at() returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger send_log_updated_at before update on public.send_log
for each row execute function public.send_log_set_updated_at();
