-- Blueprint email automation: at most one live or completed send per ClickUp task.
--
-- Two send_log rows for the same task (for example a webhook row and a reconcile row)
-- could both reach awaiting_approval. Without this index, approving both would let
-- two emails go out. With it, the second approve() hits a unique violation, which
-- send-log.ts treats as a no-op. Failed, rejected and expired rows are not covered,
-- so a rerun after a failure is still allowed.

create unique index send_log_one_send_per_task_idx
  on public.send_log (clickup_task_id)
  where stage = 'send'
    and status in ('approved', 'processing', 'retry_scheduled', 'sent');
