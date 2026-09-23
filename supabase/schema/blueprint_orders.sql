-- Run manually via the Supabase SQL editor (no migration tooling in this repo yet).

create table blueprint_orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text unique not null,
  client_name text,
  client_email text not null,
  unlock_price_centavos integer not null,
  drive_file_id text not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paymongo_payment_intent_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table blueprint_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now()
);
