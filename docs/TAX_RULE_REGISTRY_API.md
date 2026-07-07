# Tax Rule Registry API

## Endpoint

```txt
GET /api/tax-rules
```

## Purpose

Returns the current static TaxPilot tax rule registry snapshot.

This endpoint is a bridge between the GitHub-reviewed rule registry and the future Supabase-backed rule database.

## Current source

```txt
api/_lib/taxRuleRegistry.ts
```

## Future source

Dedicated TaxPilot Supabase tables:

- `tax_sources`
- `tax_rules`
- `tax_rule_sources`
- `tax_rule_evidence_requirements`
- `tax_rule_safety_boundaries`
- `tax_rule_mappings`
- `tax_rule_versions`

## Response shape

```txt
registryVersion
source
storageTarget
sources
rules
mappings
```

## Safety boundary

The endpoint returns metadata for workflow checks and review context. It must not be presented as final tax advice or as a filing decision engine.
