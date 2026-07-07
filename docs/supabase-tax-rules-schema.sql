-- TaxPilot AI tax rule registry schema
-- Prepared for a dedicated TaxPilot Supabase project.
-- Do not run this in unrelated projects.

create table if not exists public.tax_sources (
  id text primary key,
  label text not null,
  source_type text not null check (source_type in ('statute', 'administrative_guidance', 'official_portal', 'internal_note')),
  jurisdiction text not null default 'DE',
  official_url text,
  verified_at date,
  valid_from date,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tax_rules (
  id text primary key,
  title text not null,
  category text not null,
  jurisdiction text not null default 'DE',
  review_level text not null check (review_level in ('low', 'medium', 'high', 'professional_review')),
  app_action text not null,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'active', 'deprecated')),
  version text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tax_rule_sources (
  rule_id text not null references public.tax_rules(id) on delete cascade,
  source_id text not null references public.tax_sources(id) on delete restrict,
  relevance_note text,
  primary key (rule_id, source_id)
);

create table if not exists public.tax_rule_evidence_requirements (
  id bigserial primary key,
  rule_id text not null references public.tax_rules(id) on delete cascade,
  evidence_key text not null,
  label text not null,
  required_for_export boolean not null default true,
  sort_order integer not null default 100,
  unique (rule_id, evidence_key)
);

create table if not exists public.tax_rule_safety_boundaries (
  id bigserial primary key,
  rule_id text not null references public.tax_rules(id) on delete cascade,
  boundary_key text not null,
  statement text not null,
  sort_order integer not null default 100,
  unique (rule_id, boundary_key)
);

create table if not exists public.tax_rule_mappings (
  id bigserial primary key,
  app_category text not null,
  rule_id text not null references public.tax_rules(id) on delete restrict,
  priority integer not null default 100,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (app_category, rule_id)
);

create table if not exists public.tax_rule_versions (
  id bigserial primary key,
  rule_id text not null references public.tax_rules(id) on delete cascade,
  version text not null,
  change_note text not null,
  changed_at timestamptz not null default now(),
  unique (rule_id, version)
);

create index if not exists tax_sources_jurisdiction_idx on public.tax_sources (jurisdiction);
create index if not exists tax_rules_category_idx on public.tax_rules (category);
create index if not exists tax_rules_status_idx on public.tax_rules (status);
create index if not exists tax_rule_mappings_category_idx on public.tax_rule_mappings (app_category);

comment on table public.tax_sources is 'Official and reviewed source locators for TaxPilot rule metadata.';
comment on table public.tax_rules is 'Source-backed workflow rules. These rules may trigger evidence questions and review flags, not final tax advice.';
comment on table public.tax_rule_mappings is 'Maps TaxPilot app categories to source-backed rule identifiers.';
