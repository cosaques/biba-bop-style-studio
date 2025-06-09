-- SQL migration to create tables for consultant-client invitation feature

-- Ensure uuid generation capability
create extension if not exists "pgcrypto";

-- Table storing invitation tokens sent by consultants
create table if not exists public.client_invites (
  token uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by uuid references auth.users(id)
);

-- Table linking consultants and clients once an invite is accepted
create table if not exists public.consultant_clients (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (consultant_id, client_id)
);
