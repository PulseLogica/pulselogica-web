-- Blueprint email automation: claim and reset functions (spec 7.2).

-- Claims up to batch_size due retry rows, moving them to 'processing'.
-- The CTE locks candidate rows with SKIP LOCKED so concurrent callers never
-- claim the same row. The outer status guard re-checks the row state.
create or replace function public.claim_due_send_logs(batch_size int default 10)
returns setof public.send_log
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with due as (
    select d.id
      from public.send_log d
     where d.status = 'retry_scheduled'
       and d.next_retry_at <= now()
     order by d.next_retry_at
     limit batch_size
       for update skip locked
  )
  update public.send_log s
     set status = 'processing'
    from due
   where s.id = due.id
     and s.status = 'retry_scheduled'
  returning s.*;
end $$;

-- Returns rows stuck in 'processing' for more than 5 minutes to the retry queue.
create or replace function public.reset_stuck_send_logs() returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  update public.send_log
     set status = 'retry_scheduled', next_retry_at = now()
   where status = 'processing' and updated_at < now() - interval '5 minutes';
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.claim_due_send_logs(int) from public, anon, authenticated;
revoke all on function public.reset_stuck_send_logs() from public, anon, authenticated;
grant execute on function public.claim_due_send_logs(int) to service_role;
grant execute on function public.reset_stuck_send_logs() to service_role;
