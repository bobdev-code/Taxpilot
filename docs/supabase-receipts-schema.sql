-- TaxPilot AI Phase 5 durable receipt storage schema
-- Run this in the Supabase SQL editor before enabling the Phase 5 adapter.

create table if not exists public.taxpilot_receipts (
  id text primary key,
  merchant text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'EUR',
  receipt_date date not null,
  category text not null,
  status text not null,
  description text,
  preliminary_explanation text,
  missing_information jsonb not null default '[]'::jsonb,
  rule_evaluation jsonb,
  recommended_for_accountant_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists taxpilot_receipts_created_at_idx
  on public.taxpilot_receipts (created_at desc);

create index if not exists taxpilot_receipts_status_idx
  on public.taxpilot_receipts (status);

comment on table public.taxpilot_receipts is
  'TaxPilot AI Phase 5 receipt storage. Contains preliminary workflow data only, not legally binding tax advice.';
