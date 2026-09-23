alter table blueprint_orders
  add column delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed')),
  add column delivered_at timestamptz;
