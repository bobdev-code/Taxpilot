# Phase 6 Summary

## Goal

Phase 6 starts the German tax rule register for TaxPilot AI.

The goal is not to provide legal advice. The goal is to turn source-backed tax areas into safe, deterministic product behavior.

## Added

- `packages/tax-rules/package.json`
- `packages/tax-rules/src/index.ts`
- `docs/TAX_RULES_REGISTER.md`
- `docs/PHASE_6_SUMMARY.md`

## Rule categories introduced

- General business expense documentation
- Business meal documentation
- Equipment and asset review
- Invoice evidence completeness
- Record retention and auditability

## Safety boundary

The register may trigger:

- missing-information questions;
- accountant review flags;
- export warnings;
- evidence requirements.

The register must never trigger:

- legally binding deductibility conclusions;
- certified tax advice;
- GoBD certification claims;
- guaranteed VAT deduction claims.

## Current implementation status

The new `@taxpilot/tax-rules` package stores the first structured register, but the active app does not yet consume it.

This is intentional. Phase 6 first saves the source-backed model. The next implementation step is to map the register into `@taxpilot/rules` and expose the source IDs in the Rule Engine Cockpit.

## Next recommended step

Phase 6.1:

- connect `@taxpilot/tax-rules` to `@taxpilot/rules`;
- show source-backed rule IDs in the UI;
- add rule-source metadata to the accountant export;
- keep all wording preliminary and review-oriented.
