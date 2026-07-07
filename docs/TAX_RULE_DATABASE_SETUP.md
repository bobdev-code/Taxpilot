# Tax Rule Database Setup

## Purpose

This setup prepares a dedicated Supabase database layer for TaxPilot tax sources, tax rules and rule mappings.

Do not run these files in unrelated Supabase projects.

## Files

Run in this order:

1. `docs/supabase-tax-rules-schema.sql`
2. `docs/supabase-tax-rules-seed.sql`

## Tables

The schema creates:

- `tax_sources`
- `tax_rules`
- `tax_rule_sources`
- `tax_rule_evidence_requirements`
- `tax_rule_safety_boundaries`
- `tax_rule_mappings`
- `tax_rule_versions`

## Current status

This is prepared for the future TaxPilot Supabase project. It has not been applied to Supabase yet.

## Integration plan

1. Create or connect the dedicated TaxPilot Supabase project.
2. Run the schema file.
3. Run the seed file.
4. Verify sources and rules in Supabase.
5. Add a read-only API endpoint for app-side rule metadata.
6. Keep GitHub as review source until an admin workflow exists.

## Safety boundary

The database stores source-backed workflow metadata. It must not be used to generate final tax advice, filing decisions, guaranteed VAT treatment or certification claims.
