# Phase 6 Summary

## Goal

Phase 6 starts the German tax rule register for TaxPilot AI.

The goal is not to provide legal advice. The goal is to turn source-backed areas into safe, deterministic product behavior.

## Added

- `packages/tax-rules/package.json`
- `packages/tax-rules/src/index.ts`
- `docs/TAX_RULES_REGISTER.md`
- `docs/PHASE_6_SUMMARY.md`
- `docs/SOURCE_AUDIT_PHASE_6_2.md`

## Phase 6.2 source audit

The source audit now records official source locators for:

- EStG section 4
- EStG section 6
- UStG section 14
- UStDV section 33
- AO section 147
- BMF GoBD

The audit stores product interpretation and safety boundaries. Secondary sources were only used for orientation, not as authority.

## Rule categories introduced

- General business expense documentation
- Business meal documentation
- Equipment and asset review
- Invoice evidence completeness
- Small amount invoice path
- Home office special review
- Gifts and client presents review
- Travel context
- Electronic invoice readiness
- Record retention and auditability

## Safety boundary

The register may trigger:

- missing-information questions;
- accountant review flags;
- export warnings;
- evidence requirements.

The register must never trigger:

- legally binding deductibility conclusions;
- certified advice claims;
- GoBD certification claims;
- guaranteed VAT deduction claims.

## Current implementation status

The new `@taxpilot/tax-rules` package stores the first structured register. The active app still uses the existing rule engine, but the source audit prepares the Phase 6.1 mapping.

## Next recommended step

Phase 6.1 implementation follow-up:

- connect rule IDs to `@taxpilot/rules` insights;
- show source-backed rule IDs in the UI;
- add rule-source metadata to the accountant export;
- keep all wording preliminary and review-oriented.
