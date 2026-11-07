-- Reliable poll trigger: Supabase pg_cron calls /api/poll every 5 minutes.
-- (GitHub's free scheduler only managed ~4-5 runs/day, far too slow.)
--
-- Run once in the Supabase SQL editor. Before this, store the poll secret in
-- Vault (NOT committed — the repo is public):
--   select vault.create_secret('<POLL_SECRET>', 'poll_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Re-running with the same job name updates the existing job.
select cron.schedule(
  'poll-recalls',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://recallguardian.ca/api/poll',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'poll_secret'
      )
    ),
    timeout_milliseconds := 60000
  );
  $$
);

-- Check it's scheduled and running:
--   select jobname, schedule, active from cron.job;
--   select status, start_time from cron.job_run_details order by start_time desc limit 5;
--   select status_code, content from net._http_response order by created desc limit 5;
