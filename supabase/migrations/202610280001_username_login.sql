-- Username login mapping. Run in Supabase SQL Editor.
-- Do not store passwords in this table.
create table if not exists public.username_login (
  username text primary key check (username ~ '^[a-zA-Z0-9_.-]{3,32}$'),
  auth_email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.username_login enable row level security;
revoke all on table public.username_login from anon, authenticated;
-- Add the mapping only after confirming the intended Auth user exists:
-- insert into public.username_login (username, auth_email)
-- values ('rajabi730', 'YOUR_AUTH_USER_EMAIL');
