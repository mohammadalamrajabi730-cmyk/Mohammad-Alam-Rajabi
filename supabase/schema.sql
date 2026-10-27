-- صرافی محمد علم رجبی — Supabase schema
-- Run this in Supabase SQL Editor. Every row is isolated to its authenticated owner.
create table if not exists public.exchange_records (
  id text not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  record_type text not null check (record_type in ('customers','agents','remits','exchanges','expenses','journal','cashbox')),
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner_id, record_type, id)
);

create index if not exists exchange_records_owner_type_idx
  on public.exchange_records (owner_id, record_type);

alter table public.exchange_records enable row level security;

drop policy if exists "Read own exchange records" on public.exchange_records;
create policy "Read own exchange records"
  on public.exchange_records for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Insert own exchange records" on public.exchange_records;
create policy "Insert own exchange records"
  on public.exchange_records for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Update own exchange records" on public.exchange_records;
create policy "Update own exchange records"
  on public.exchange_records for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Delete own exchange records" on public.exchange_records;
create policy "Delete own exchange records"
  on public.exchange_records for delete to authenticated
  using (owner_id = auth.uid());

-- Deliberately no anon/public policies. Never place a service_role key in website code.
